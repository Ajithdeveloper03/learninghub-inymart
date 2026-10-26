<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Repositories\ProgressRepository;
use App\Repositories\SubmissionRepository;
use App\Utils\Database;
use App\Utils\Response;
use PDO;

class SectionController
{
    private ProgressRepository $progressRepo;
    private SubmissionRepository $submissionRepo;
    private PDO $pdo;

    public function __construct()
    {
        $this->progressRepo = new ProgressRepository();
        $this->submissionRepo = new SubmissionRepository();
        $this->pdo = Database::getConnection();
    }

    public function access(int $id): void
    {
        $user = AuthMiddleware::authenticate();
        $userId = (int)$user['id'];

        // Get section details with module and course
        $stmt = $this->pdo->prepare("
            SELECT s.*, m.`course_id`, m.`title` as `module_title`, c.`title` as `course_title`,
                   v.`id` as `video_id`, v.`duration_seconds`,
                   a.`id` as `assignment_id`, a.`title` as `assignment_title`, a.`instructions` as `assignment_instructions`, a.`submission_type`
            FROM `sections` s
            JOIN `modules` m ON s.`module_id` = m.`id`
            JOIN `courses` c ON m.`course_id` = c.`id`
            LEFT JOIN `video_assets` v ON v.`section_id` = s.`id`
            LEFT JOIN `assignments` a ON a.`section_id` = s.`id`
            WHERE s.`id` = :id
        ");
        $stmt->execute([':id' => $id]);
        $section = $stmt->fetch();

        if (!$section) {
            Response::notFound('Section not found');
        }

        $isUnlocked = $this->progressRepo->isSectionUnlocked($userId, $id);
        $progress = $this->progressRepo->getOrCreateProgress($userId, $id, (int)($section['duration_seconds'] ?? 0));
        $submission = $section['assignment_id'] ? $this->submissionRepo->getSubmission((int)$section['assignment_id'], $userId) : null;

        $workflowStatus = 'LOCKED';
        if ($isUnlocked) {
            if ($submission) {
                $workflowStatus = $submission['status'];
            } elseif ($progress['status'] === 'VIDEO_COMPLETED') {
                $workflowStatus = 'VIDEO_COMPLETED';
            } elseif ((float)$progress['last_watched_position'] > 0 || (int)$progress['watched_seconds'] > 0) {
                $workflowStatus = 'IN_PROGRESS';
            } else {
                $workflowStatus = 'AVAILABLE';
            }
        }

        Response::success([
            'section' => $section,
            'is_unlocked' => $isUnlocked,
            'workflow_status' => $workflowStatus,
            'progress' => $progress,
            'submission' => $submission,
        ]);
    }

    public function unlockForStudent(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $studentId = (int)($input['student_id'] ?? 0);

        if (!$studentId) {
            Response::error('Student ID is required', 400);
        }

        $this->progressRepo->unlockSection($studentId, $id, 'ADMIN');
        Response::success(null, 'Section manually unlocked for student');
    }
}
