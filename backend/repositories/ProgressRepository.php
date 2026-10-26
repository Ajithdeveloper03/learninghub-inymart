<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Utils\Database;
use PDO;

class ProgressRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function isSectionUnlocked(int $userId, int $sectionId): bool
    {
        $stmt = $this->pdo->prepare("
            SELECT `status` FROM `section_unlocks`
            WHERE `user_id` = :uid AND `section_id` = :sid
        ");
        $stmt->execute([':uid' => $userId, ':sid' => $sectionId]);
        $row = $stmt->fetch();
        return ($row && $row['status'] === 'UNLOCKED');
    }

    public function getOrCreateProgress(int $userId, int $sectionId, int $durationSeconds = 0): array
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM `video_progress`
            WHERE `user_id` = :uid AND `section_id` = :sid
        ");
        $stmt->execute([':uid' => $userId, ':sid' => $sectionId]);
        $progress = $stmt->fetch();

        if (!$progress) {
            $insert = $this->pdo->prepare("
                INSERT INTO `video_progress` (`user_id`, `section_id`, `duration_seconds`, `status`)
                VALUES (:uid, :sid, :dur, 'AVAILABLE')
            ");
            $insert->execute([':uid' => $userId, ':sid' => $sectionId, ':dur' => $durationSeconds]);

            return [
                'id' => (int)$this->pdo->lastInsertId(),
                'user_id' => $userId,
                'section_id' => $sectionId,
                'last_watched_position' => 0.00,
                'duration_seconds' => $durationSeconds,
                'watched_seconds' => 0,
                'completion_percentage' => 0.00,
                'status' => 'AVAILABLE',
            ];
        }

        return $progress;
    }

    public function recordSegment(int $progressId, float $start, float $end): void
    {
        // Sanity checks
        if ($end <= $start) {
            return;
        }

        // Segment length sanity: a single periodic ping shouldn't exceed 30 seconds
        if (($end - $start) > 60) {
            $end = $start + 60;
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO `watched_segments` (`video_progress_id`, `segment_start`, `segment_end`)
            VALUES (:pid, :start, :end)
        ");
        $stmt->execute([
            ':pid' => $progressId,
            ':start' => round($start, 2),
            ':end' => round($end, 2),
        ]);
    }

    public function calculateUniqueWatchedCoverage(int $progressId, int $totalDuration): array
    {
        // Fetch all recorded segments ordered by start
        $stmt = $this->pdo->prepare("
            SELECT `segment_start`, `segment_end`
            FROM `watched_segments`
            WHERE `video_progress_id` = :pid
            ORDER BY `segment_start` ASC
        ");
        $stmt->execute([':pid' => $progressId]);
        $segments = $stmt->fetchAll();

        if (empty($segments)) {
            return [
                'unique_watched_seconds' => 0,
                'percentage' => 0.0,
            ];
        }

        // Merge overlapping intervals algorithm
        $merged = [];
        $currentStart = (float)$segments[0]['segment_start'];
        $currentEnd = (float)$segments[0]['segment_end'];

        for ($i = 1; $i < count($segments); $i++) {
            $segStart = (float)$segments[$i]['segment_start'];
            $segEnd = (float)$segments[$i]['segment_end'];

            // Small tolerance gap (e.g. 1.0 second buffering gap)
            if ($segStart <= ($currentEnd + 1.0)) {
                $currentEnd = max($currentEnd, $segEnd);
            } else {
                $merged[] = ['start' => $currentStart, 'end' => $currentEnd];
                $currentStart = $segStart;
                $currentEnd = $segEnd;
            }
        }
        $merged[] = ['start' => $currentStart, 'end' => $currentEnd];

        // Sum unique seconds
        $totalUniqueSeconds = 0.0;
        foreach ($merged as $interval) {
            $totalUniqueSeconds += ($interval['end'] - $interval['start']);
        }

        $duration = max(1, $totalDuration);
        $percentage = min(100.0, round(($totalUniqueSeconds / $duration) * 100, 2));

        return [
            'unique_watched_seconds' => round($totalUniqueSeconds, 1),
            'percentage' => $percentage,
            'merged_intervals' => $merged,
        ];
    }

    public function updateProgress(int $progressId, float $lastPosition, int $watchedSeconds, float $percentage, string $status): bool
    {
        $completedAtClause = ($status === 'VIDEO_COMPLETED') ? ", `completed_at` = IF(`completed_at` IS NULL, NOW(), `completed_at`)" : "";
        $stmt = $this->pdo->prepare("
            UPDATE `video_progress`
            SET `last_watched_position` = :pos,
                `watched_seconds` = :watched,
                `completion_percentage` = :pct,
                `status` = :status
                {$completedAtClause}
            WHERE `id` = :id
        ");
        return $stmt->execute([
            ':pos' => round($lastPosition, 2),
            ':watched' => $watchedSeconds,
            ':pct' => round($percentage, 2),
            ':status' => $status,
            ':id' => $progressId,
        ]);
    }

    public function getNextSection(int $currentSectionId): ?array
    {
        // 1. Get current section's module and order
        $stmt = $this->pdo->prepare("
            SELECT s.`id`, s.`order_index`, s.`module_id`, m.`course_id`, m.`order_index` as `module_order`
            FROM `sections` s
            JOIN `modules` m ON s.`module_id` = m.`id`
            WHERE s.`id` = :sid
        ");
        $stmt->execute([':sid' => $currentSectionId]);
        $current = $stmt->fetch();

        if (!$current) {
            return null;
        }

        // 2. Check for next section in the same module
        $nextInMod = $this->pdo->prepare("
            SELECT s.*
            FROM `sections` s
            WHERE s.`module_id` = :mid AND s.`order_index` > :s_order
            ORDER BY s.`order_index` ASC
            LIMIT 1
        ");
        $nextInMod->execute([
            ':mid' => $current['module_id'],
            ':s_order' => $current['order_index'],
        ]);
        $next = $nextInMod->fetch();
        if ($next) {
            return $next;
        }

        // 3. Otherwise, check for the first section of the next module
        $nextMod = $this->pdo->prepare("
            SELECT s.*
            FROM `sections` s
            JOIN `modules` m ON s.`module_id` = m.`id`
            WHERE m.`course_id` = :cid AND m.`order_index` > :m_order
            ORDER BY m.`order_index` ASC, s.`order_index` ASC
            LIMIT 1
        ");
        $nextMod->execute([
            ':cid' => $current['course_id'],
            ':m_order' => $current['module_order'],
        ]);
        $next = $nextMod->fetch();
        if ($next) {
            return $next;
        }

        // 4. Otherwise, check for the first section of the NEXT COURSE (Sequential Course Progression!)
        $nextCourseStmt = $this->pdo->prepare("
            SELECT s.*, c.`id` as `course_id`
            FROM `sections` s
            JOIN `modules` m ON s.`module_id` = m.`id`
            JOIN `courses` c ON m.`course_id` = c.`id`
            WHERE c.`id` > :cid AND c.`is_published` = 1
            ORDER BY c.`id` ASC, m.`order_index` ASC, s.`order_index` ASC
            LIMIT 1
        ");
        $nextCourseStmt->execute([':cid' => $current['course_id']]);
        $nextCourseSec = $nextCourseStmt->fetch();
        return $nextCourseSec ?: null;
    }

    public function unlockSection(int $userId, int $sectionId, string $unlockedBy = 'SYSTEM'): bool
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `section_unlocks` (`user_id`, `section_id`, `status`, `unlocked_by`)
            VALUES (:uid, :sid, 'UNLOCKED', :by)
            ON DUPLICATE KEY UPDATE `status` = 'UNLOCKED', `unlocked_by` = :by2
        ");
        return $stmt->execute([
            ':uid' => $userId,
            ':sid' => $sectionId,
            ':by' => $unlockedBy,
            ':by2' => $unlockedBy,
        ]);
    }
}
