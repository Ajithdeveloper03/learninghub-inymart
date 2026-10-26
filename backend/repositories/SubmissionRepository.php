<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Utils\Database;
use PDO;
use Exception;

class SubmissionRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function getAssignmentBySection(int $sectionId): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `assignments` WHERE `section_id` = :sid");
        $stmt->execute([':sid' => $sectionId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getAssignmentById(int $id): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `assignments` WHERE `id` = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getSubmission(int $assignmentId, int $userId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT s.*, u.`full_name` as `reviewer_name`
            FROM `submissions` s
            LEFT JOIN `users` u ON s.`reviewed_by` = u.`id`
            WHERE s.`assignment_id` = :aid AND s.`user_id` = :uid
            ORDER BY s.`id` DESC LIMIT 1
        ");
        $stmt->execute([':aid' => $assignmentId, ':uid' => $userId]);
        $submission = $stmt->fetch();

        if ($submission) {
            // Attach attachments
            $attStmt = $this->pdo->prepare("SELECT * FROM `submission_attachments` WHERE `submission_id` = :sub_id");
            $attStmt->execute([':sub_id' => $submission['id']]);
            $submission['attachments'] = $attStmt->fetchAll();

            // Attach approval logs
            $logStmt = $this->pdo->prepare("
                SELECT al.*, u.`full_name` as `reviewer_name`
                FROM `approval_logs` al
                JOIN `users` u ON al.`reviewed_by` = u.`id`
                WHERE al.`submission_id` = :sub_id
                ORDER BY al.`created_at` DESC
            ");
            $logStmt->execute([':sub_id' => $submission['id']]);
            $submission['history'] = $logStmt->fetchAll();
        }

        return $submission ?: null;
    }

    public function getSubmissionById(int $submissionId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT s.*, a.`section_id`, a.`title` as `assignment_title`,
                   u.`full_name` as `student_name`, u.`username` as `student_username`, u.`email` as `student_email`,
                   sec.`title` as `section_title`, c.`title` as `course_title`, c.`id` as `course_id`,
                   rev.`full_name` as `reviewer_name`
            FROM `submissions` s
            JOIN `assignments` a ON s.`assignment_id` = a.`id`
            JOIN `sections` sec ON a.`section_id` = sec.`id`
            JOIN `modules` m ON sec.`module_id` = m.`id`
            JOIN `courses` c ON m.`course_id` = c.`id`
            JOIN `users` u ON s.`user_id` = u.`id`
            LEFT JOIN `users` rev ON s.`reviewed_by` = rev.`id`
            WHERE s.`id` = :id
        ");
        $stmt->execute([':id' => $submissionId]);
        $row = $stmt->fetch();

        if ($row) {
            $attStmt = $this->pdo->prepare("SELECT * FROM `submission_attachments` WHERE `submission_id` = :sub_id");
            $attStmt->execute([':sub_id' => $row['id']]);
            $row['attachments'] = $attStmt->fetchAll();

            $logStmt = $this->pdo->prepare("
                SELECT al.*, u.`full_name` as `reviewer_name`
                FROM `approval_logs` al
                JOIN `users` u ON al.`reviewed_by` = u.`id`
                WHERE al.`submission_id` = :sub_id
                ORDER BY al.`created_at` DESC
            ");
            $logStmt->execute([':sub_id' => $row['id']]);
            $row['history'] = $logStmt->fetchAll();
        }

        return $row ?: null;
    }

    public function createOrUpdateSubmission(int $assignmentId, int $userId, ?string $text): int
    {
        // Check if existing pending or revision submission
        $existing = $this->getSubmission($assignmentId, $userId);

        if ($existing && $existing['status'] === 'APPROVED') {
            throw new Exception("This assignment has already been approved and cannot be resubmitted.");
        }

        if ($existing && $existing['status'] === 'PENDING_REVIEW') {
            // Update current pending submission
            $stmt = $this->pdo->prepare("
                UPDATE `submissions` 
                SET `submission_text` = :txt, `submitted_at` = NOW() 
                WHERE `id` = :id
            ");
            $stmt->execute([':txt' => $text, ':id' => $existing['id']]);
            return (int)$existing['id'];
        }

        // Otherwise insert new submission record (e.g. for initial or re-submission after REVISION_REQUIRED)
        $stmt = $this->pdo->prepare("
            INSERT INTO `submissions` (`assignment_id`, `user_id`, `submission_text`, `status`)
            VALUES (:aid, :uid, :txt, 'PENDING_REVIEW')
        ");
        $stmt->execute([
            ':aid' => $assignmentId,
            ':uid' => $userId,
            ':txt' => $text,
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    public function addAttachment(int $submissionId, string $filePath, string $originalName, int $fileSize, string $mimeType): int
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `submission_attachments` (`submission_id`, `file_path`, `original_filename`, `file_size`, `mime_type`)
            VALUES (:sub_id, :path, :orig, :size, :mime)
        ");
        $stmt->execute([
            ':sub_id' => $submissionId,
            ':path' => $filePath,
            ':orig' => $originalName,
            ':size' => $fileSize,
            ':mime' => $mimeType,
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    public function listPendingSubmissions(int $limit = 50, int $offset = 0): array
    {
        $stmt = $this->pdo->prepare("
            SELECT s.`id`, s.`status`, s.`submitted_at`, s.`submission_text`,
                   u.`id` as `student_id`, u.`full_name` as `student_name`, u.`username` as `student_username`,
                   a.`id` as `assignment_id`, a.`title` as `assignment_title`,
                   sec.`id` as `section_id`, sec.`title` as `section_title`,
                   c.`id` as `course_id`, c.`title` as `course_title`,
                   (SELECT COUNT(*) FROM `submission_attachments` sa WHERE sa.`submission_id` = s.`id`) as `attachments_count`
            FROM `submissions` s
            JOIN `users` u ON s.`user_id` = u.`id`
            JOIN `assignments` a ON s.`assignment_id` = a.`id`
            JOIN `sections` sec ON a.`section_id` = sec.`id`
            JOIN `modules` m ON sec.`module_id` = m.`id`
            JOIN `courses` c ON m.`course_id` = c.`id`
            WHERE s.`status` = 'PENDING_REVIEW'
            ORDER BY s.`submitted_at` ASC
            LIMIT :lim OFFSET :off
        ");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function listAllSubmissions(string $statusFilter = '', int $limit = 50, int $offset = 0): array
    {
        $sql = "
            SELECT s.`id`, s.`status`, s.`submitted_at`, s.`reviewed_at`, s.`admin_feedback`,
                   u.`id` as `student_id`, u.`full_name` as `student_name`, u.`username` as `student_username`,
                   a.`title` as `assignment_title`, sec.`title` as `section_title`, c.`title` as `course_title`,
                   rev.`full_name` as `reviewer_name`
            FROM `submissions` s
            JOIN `users` u ON s.`user_id` = u.`id`
            JOIN `assignments` a ON s.`assignment_id` = a.`id`
            JOIN `sections` sec ON a.`section_id` = sec.`id`
            JOIN `modules` m ON sec.`module_id` = m.`id`
            JOIN `courses` c ON m.`course_id` = c.`id`
            LEFT JOIN `users` rev ON s.`reviewed_by` = rev.`id`
        ";
        $params = [];
        if ($statusFilter !== '') {
            $sql .= " WHERE s.`status` = :status";
            $params[':status'] = $statusFilter;
        }
        $sql .= " ORDER BY s.`submitted_at` DESC LIMIT " . (int)$limit . " OFFSET " . (int)$offset;

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function reviewSubmission(int $submissionId, int $reviewerId, string $decision, ?string $feedback): array
    {
        $this->pdo->beginTransaction();

        try {
            $submission = $this->getSubmissionById($submissionId);
            if (!$submission) {
                throw new Exception("Submission #{$submissionId} not found");
            }

            // 1. Update submission record
            $update = $this->pdo->prepare("
                UPDATE `submissions` 
                SET `status` = :decision, 
                    `admin_feedback` = :feedback, 
                    `reviewed_by` = :reviewer, 
                    `reviewed_at` = NOW() 
                WHERE `id` = :id
            ");
            $update->execute([
                ':decision' => $decision,
                ':feedback' => $feedback,
                ':reviewer' => $reviewerId,
                ':id' => $submissionId,
            ]);

            // 2. Insert approval log
            $log = $this->pdo->prepare("
                INSERT INTO `approval_logs` (`submission_id`, `user_id`, `section_id`, `reviewed_by`, `decision`, `remarks`)
                VALUES (:sub_id, :uid, :sec_id, :rev_by, :decision, :remarks)
            ");
            $log->execute([
                ':sub_id' => $submissionId,
                ':uid' => $submission['user_id'],
                ':sec_id' => $submission['section_id'],
                ':rev_by' => $reviewerId,
                ':decision' => $decision,
                ':remarks' => $feedback,
            ]);

            $nextSection = null;

            // 3. If APPROVED -> unlock the NEXT section for this student
            if ($decision === 'APPROVED') {
                $progressRepo = new ProgressRepository();
                $next = $progressRepo->getNextSection((int)$submission['section_id']);

                if ($next) {
                    $nextSection = $next;
                    $progressRepo->unlockSection((int)$submission['user_id'], (int)$next['id'], 'ADMIN');

                    if (!empty($next['course_id'])) {
                        $enr = $this->pdo->prepare("
                            INSERT IGNORE INTO `course_enrollments` (`user_id`, `course_id`, `status`)
                            VALUES (:uid, :cid, 'active')
                        ");
                        $enr->execute([':uid' => $submission['user_id'], ':cid' => $next['course_id']]);
                    }

                    // Initialize video progress for the newly unlocked section
                    $vp = $this->pdo->prepare("
                        INSERT INTO `video_progress` (`user_id`, `section_id`, `status`)
                        VALUES (:uid, :sid, 'AVAILABLE')
                        ON DUPLICATE KEY UPDATE `status` = IF(`status` = 'LOCKED', 'AVAILABLE', `status`)
                    ");
                    $vp->execute([':uid' => $submission['user_id'], ':sid' => $next['id']]);
                }
            } else if ($decision === 'REJECTED') {
                // If REJECTED -> force student to re-watch the section video completely before resubmitting!
                $vpReset = $this->pdo->prepare("
                    UPDATE `video_progress`
                    SET `status` = 'AVAILABLE',
                        `last_watched_position` = 0.00,
                        `watched_seconds` = 0,
                        `completion_percentage` = 0.00,
                        `completed_at` = NULL
                    WHERE `user_id` = :uid AND `section_id` = :sid
                ");
                $vpReset->execute([
                    ':uid' => $submission['user_id'],
                    ':sid' => $submission['section_id'],
                ]);

                // Delete interval segments so anti-skip union forces 95%+ watch from scratch
                $delSegs = $this->pdo->prepare("
                    DELETE FROM `watched_segments`
                    WHERE `video_progress_id` IN (
                        SELECT `id` FROM `video_progress` 
                        WHERE `user_id` = :uid AND `section_id` = :sid
                    )
                ");
                $delSegs->execute([
                    ':uid' => $submission['user_id'],
                    ':sid' => $submission['section_id'],
                ]);
            }

            // 4. In-app notification for the student
            $notifTitle = match ($decision) {
                'APPROVED' => 'Assignment Approved!',
                'REVISION_REQUIRED' => 'Assignment Needs Revision',
                'REJECTED' => 'Task Rejected - Re-watch Video Required',
            };
            $notifType = match ($decision) {
                'APPROVED' => 'ASSIGNMENT_APPROVED',
                'REVISION_REQUIRED' => 'REVISION_REQUESTED',
                'REJECTED' => 'SYSTEM_ALERT',
            };
            $notifMsg = "Your submission for \"{$submission['assignment_title']}\" in \"{$submission['section_title']}\" was reviewed: {$decision}." .
                        ($feedback ? " Remarks: {$feedback}" : "");

            $notifStmt = $this->pdo->prepare("
                INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `data_json`)
                VALUES (:uid, :title, :msg, :type, :json)
            ");
            $notifStmt->execute([
                ':uid' => $submission['user_id'],
                ':title' => $notifTitle,
                ':msg' => $notifMsg,
                ':type' => $notifType,
                ':json' => json_encode([
                    'submission_id' => $submissionId,
                    'section_id' => $submission['section_id'],
                    'decision' => $decision,
                    'next_section_id' => $nextSection ? $nextSection['id'] : null,
                ]),
            ]);

            $this->pdo->commit();

            return [
                'decision' => $decision,
                'submission_id' => $submissionId,
                'student_id' => $submission['user_id'],
                'next_section' => $nextSection,
            ];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
