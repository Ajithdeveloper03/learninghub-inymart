<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\RoleMiddleware;
use App\Repositories\SubmissionRepository;
use App\Utils\Logger;
use App\Utils\Response;
use Exception;

class ApprovalController
{
    private SubmissionRepository $submissionRepo;

    public function __construct()
    {
        $this->submissionRepo = new SubmissionRepository();
    }

    public function approve(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $feedback = trim($input['remarks'] ?? $input['feedback'] ?? 'Great work! Assignment approved.');

        try {
            $result = $this->submissionRepo->reviewSubmission(
                $id,
                (int)$admin['id'],
                'APPROVED',
                $feedback
            );

            Logger::audit((int)$admin['id'], 'SUBMISSION_APPROVED', 'submission', $id, [
                'feedback' => $feedback,
                'next_section_id' => $result['next_section']['id'] ?? null,
            ]);

            Response::success($result, 'Submission approved and next section unlocked successfully');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function requestRevision(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $feedback = trim($input['remarks'] ?? $input['feedback'] ?? '');

        if ($feedback === '') {
            Response::error('Feedback remarks are mandatory when requesting a revision.', 422);
        }

        try {
            $result = $this->submissionRepo->reviewSubmission(
                $id,
                (int)$admin['id'],
                'REVISION_REQUIRED',
                $feedback
            );

            Logger::audit((int)$admin['id'], 'REVISION_REQUESTED', 'submission', $id, [
                'feedback' => $feedback,
            ]);

            Response::success($result, 'Revision requested from student. Next section remains locked.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function reject(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $feedback = trim($input['remarks'] ?? $input['feedback'] ?? 'Submission does not meet required standards.');

        try {
            $result = $this->submissionRepo->reviewSubmission(
                $id,
                (int)$admin['id'],
                'REJECTED',
                $feedback
            );

            Logger::audit((int)$admin['id'], 'SUBMISSION_REJECTED', 'submission', $id, [
                'feedback' => $feedback,
            ]);

            Response::success($result, 'Submission rejected. Next section remains locked.');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
