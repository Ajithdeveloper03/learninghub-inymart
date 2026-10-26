<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\ProgressRepository;
use App\Repositories\CourseRepository;
use App\Utils\Database;
use App\Utils\Logger;
use Exception;
use PDO;

class VideoProgressService
{
    private ProgressRepository $progressRepo;
    private CourseRepository $courseRepo;
    private PDO $pdo;

    public function __construct()
    {
        $this->progressRepo = new ProgressRepository();
        $this->courseRepo = new CourseRepository();
        $this->pdo = Database::getConnection();
    }

    public function authorizePlayback(int $userId, int $sectionId, string $sessionToken): array
    {
        // 1. Get section & course
        $stmt = $this->pdo->prepare("
            SELECT s.`id`, s.`title`, s.`module_id`, m.`course_id`, s.`is_free_preview`,
                   v.`id` as `video_id`, v.`file_path`, v.`duration_seconds`, v.`original_filename`
            FROM `sections` s
            JOIN `modules` m ON s.`module_id` = m.`id`
            LEFT JOIN `video_assets` v ON v.`section_id` = s.`id`
            WHERE s.`id` = :sid
        ");
        $stmt->execute([':sid' => $sectionId]);
        $section = $stmt->fetch();

        if (!$section) {
            throw new Exception("Section not found.");
        }

        // 2. Check enrollment (unless free preview)
        if (!(bool)$section['is_free_preview']) {
            if (!$this->courseRepo->isEnrolled($userId, (int)$section['course_id'])) {
                throw new Exception("You are not enrolled in this course.");
            }

            // 3. Check section unlock status
            if (!$this->progressRepo->isSectionUnlocked($userId, $sectionId)) {
                throw new Exception("This section is currently locked. Complete and receive approval for prior assignments first.");
            }
        }

        // 4. Generate short-lived playback grant token (valid for 5 minutes)
        $playbackToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + 300);

        $tokenStmt = $this->pdo->prepare("
            INSERT INTO `playback_tokens` (`token`, `user_id`, `section_id`, `session_token`, `expires_at`)
            VALUES (:token, :uid, :sid, :stoken, :exp)
        ");
        $tokenStmt->execute([
            ':token' => $playbackToken,
            ':uid' => $userId,
            ':sid' => $sectionId,
            ':stoken' => $sessionToken,
            ':exp' => $expiresAt,
        ]);

        // 5. Get current progress
        $progress = $this->progressRepo->getOrCreateProgress($userId, $sectionId, (int)($section['duration_seconds'] ?? 0));

        // Check if this section's latest assignment submission was REJECTED
        $subStmt = $this->pdo->prepare("
            SELECT s.`id`, s.`status`, s.`reviewed_at`
            FROM `submissions` s
            JOIN `assignments` a ON a.`id` = s.`assignment_id`
            WHERE s.`user_id` = :uid AND a.`section_id` = :sid
            ORDER BY s.`id` DESC LIMIT 1
        ");
        $subStmt->execute([':uid' => $userId, ':sid' => $sectionId]);
        $latestSubmission = $subStmt->fetch();

        $isRejectedSubmission = false;
        if ($latestSubmission && $latestSubmission['status'] === 'REJECTED') {
            $isRejectedSubmission = true;
            $reviewedAt = !empty($latestSubmission['reviewed_at']) ? strtotime($latestSubmission['reviewed_at']) : 0;
            $completedAt = !empty($progress['completed_at']) ? strtotime($progress['completed_at']) : 0;

            // If not completed AFTER the rejection was rendered, force complete re-watch from 0!
            if ($completedAt === 0 || $completedAt <= $reviewedAt) {
                $this->pdo->prepare("
                    UPDATE `video_progress`
                    SET `status` = 'AVAILABLE',
                        `last_watched_position` = 0.00,
                        `watched_seconds` = 0,
                        `completion_percentage` = 0.00,
                        `completed_at` = NULL
                    WHERE `id` = :id
                ")->execute([':id' => $progress['id']]);

                $this->pdo->prepare("DELETE FROM `watched_segments` WHERE `video_progress_id` = :vpid")
                    ->execute([':vpid' => $progress['id']]);

                $progress['status'] = 'AVAILABLE';
                $progress['last_watched_position'] = 0.00;
                $progress['watched_seconds'] = 0;
                $progress['completion_percentage'] = 0.00;
                $progress['completed_at'] = null;
            }
        }

        // 6. Watermark metadata for dynamic overlay
        $watermark = [
            'text' => sprintf("ID: %d | User: %s | Time: %s", $userId, $sessionToken ? substr($sessionToken, 0, 8) : '', date('Y-m-d H:i:s')),
            'session_hint' => substr($sessionToken, 0, 8),
            'timestamp' => time(),
        ];

        $rawFilePath = $section['file_path'] ?? 'videos/academy_master_video.mp4';
        $streamUrl = "/api/videos/stream?token={$playbackToken}";

        return [
            'playback_token' => $playbackToken,
            'expires_in' => 300,
            'stream_url' => $streamUrl,
            'video_url' => $rawFilePath,
            'is_youtube' => false,
            'duration_seconds' => (int)($section['duration_seconds'] ?? 0),
            'last_watched_position' => (float)$progress['last_watched_position'],
            'status' => $progress['status'],
            'completion_percentage' => (float)$progress['completion_percentage'],
            'is_rejected' => $isRejectedSubmission,
            'watermark' => $watermark,
        ];
    }

    public function recordProgress(int $userId, int $sectionId, float $start, float $end, float $currentPosition, ?float $totalDuration = null, bool $isEnded = false): array
    {
        // 1. Verify unlock
        if (!$this->progressRepo->isSectionUnlocked($userId, $sectionId)) {
            throw new Exception("Unauthorized: section is locked.");
        }

        // 2. Fetch video asset for total duration
        $stmt = $this->pdo->prepare("SELECT `duration_seconds` FROM `video_assets` WHERE `section_id` = :sid");
        $stmt->execute([':sid' => $sectionId]);
        $durationSeconds = (int)$stmt->fetchColumn();
        if ($totalDuration !== null && $totalDuration > 5.0) {
            $durationSeconds = (int)$totalDuration;
        } elseif ($durationSeconds <= 0) {
            $durationSeconds = 180; // fallback default
        }

        $progress = $this->progressRepo->getOrCreateProgress($userId, $sectionId, $durationSeconds);
        $progressId = (int)$progress['id'];

        // 3. Record segment interval (if valid)
        if ($end > $start) {
            $this->progressRepo->recordSegment($progressId, $start, $end);
        }

        // 4. Calculate actual unique coverage using interval union
        $coverage = $this->progressRepo->calculateUniqueWatchedCoverage($progressId, $durationSeconds);
        $uniqueSeconds = (int)$coverage['unique_watched_seconds'];
        $percentage = (float)$coverage['percentage'];

        if ($isEnded) {
            $percentage = 100.0;
            $uniqueSeconds = $durationSeconds;
        }

        // 5. Status evaluation
        $config = require dirname(__DIR__) . '/config/app.php';
        $threshold = (float)($config['watch_completion_threshold'] ?? 95.0);

        $newStatus = $progress['status'];
        if ($progress['status'] !== 'VIDEO_COMPLETED') {
            if ($isEnded || $percentage >= $threshold || $currentPosition >= ($durationSeconds - 3)) {
                $newStatus = 'VIDEO_COMPLETED';
                $percentage = 100.0;
                Logger::audit($userId, 'VIDEO_COMPLETED', 'section', $sectionId, [
                    'coverage_percentage' => $percentage,
                    'unique_seconds' => $uniqueSeconds,
                ]);
            } else {
                $newStatus = 'IN_PROGRESS';
            }
        }

        // Update progress in DB
        $this->progressRepo->updateProgress($progressId, $currentPosition, $uniqueSeconds, $percentage, $newStatus);

        return [
            'status' => $newStatus,
            'watched_seconds' => $uniqueSeconds,
            'total_duration' => $durationSeconds,
            'completion_percentage' => $percentage,
            'is_completed' => ($newStatus === 'VIDEO_COMPLETED'),
        ];
    }

    public function validatePlaybackToken(string $token): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT pt.*, ds.`is_revoked`, ds.`expires_at` as `session_expires_at`,
                   v.`file_path`, v.`mime_type`, v.`duration_seconds`, s.`id` as `section_id`
            FROM `playback_tokens` pt
            JOIN `device_sessions` ds ON pt.`session_token` = ds.`session_token`
            JOIN `sections` s ON pt.`section_id` = s.`id`
            JOIN `video_assets` v ON v.`section_id` = s.`id`
            WHERE pt.`token` = :token
        ");
        $stmt->execute([':token' => $token]);
        $row = $stmt->fetch();

        if (!$row) {
            return null;
        }

        // Check playback token expiry
        if (strtotime($row['expires_at']) < time()) {
            return null;
        }

        // Check device session revocation
        if ((int)$row['is_revoked'] === 1 || strtotime($row['session_expires_at']) < time()) {
            return null;
        }

        return $row;
    }
}
