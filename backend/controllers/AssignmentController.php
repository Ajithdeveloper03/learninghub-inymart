<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Services\AssignmentService;
use App\Repositories\SubmissionRepository;
use App\Utils\Database;
use App\Utils\Response;
use Exception;
use PDO;

class AssignmentController
{
    private AssignmentService $assignmentService;
    private SubmissionRepository $submissionRepo;
    private PDO $pdo;

    public function __construct()
    {
        $this->assignmentService = new AssignmentService();
        $this->submissionRepo = new SubmissionRepository();
        $this->pdo = Database::getConnection();
    }

    public function getForSection(int $sectionId): void
    {
        $user = AuthMiddleware::authenticate();
        $assignment = $this->submissionRepo->getAssignmentBySection($sectionId);

        if (!$assignment) {
            Response::notFound('No assignment configured for this section');
        }

        $submission = $this->submissionRepo->getSubmission((int)$assignment['id'], (int)$user['id']);

        Response::success([
            'assignment' => $assignment,
            'submission' => $submission,
        ]);
    }

    public function submit(?int $assignmentId = null): void
    {
        $user = RoleMiddleware::requireStudent();

        $assignmentId = $assignmentId ? (int)$assignmentId : (int)($_POST['assignment_id'] ?? 0);
        if ($assignmentId <= 0) {
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $assignmentId = (int)($input['assignment_id'] ?? 0);
        }

        if ($assignmentId <= 0) {
            Response::error('Assignment ID is required', 400);
        }

        $text = $_POST['submission_text'] ?? null;
        if ($text === null) {
            $input = json_decode(file_get_contents('php://input'), true);
            $text = $input['submission_text'] ?? null;
        }

        $file = $_FILES['file'] ?? $_FILES['attachment'] ?? null;

        try {
            $result = $this->assignmentService->submitAssignment(
                (int)$user['id'],
                $assignmentId,
                $text,
                $file
            );

            Response::success($result, 'Assignment submitted successfully', 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function show(int $submissionId): void
    {
        $user = AuthMiddleware::authenticate();
        $submission = $this->submissionRepo->getSubmissionById($submissionId);

        if (!$submission) {
            Response::notFound('Submission not found');
        }

        // Students can only view their own submission; Admins can view any
        $isAdmin = in_array($user['role_name'], ['super_admin', 'admin'], true);
        if (!$isAdmin && (int)$submission['user_id'] !== (int)$user['id']) {
            Response::forbidden('Access denied to this submission.');
        }

        Response::success($submission);
    }

    public function pending(): void
    {
        RoleMiddleware::requireAdmin();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;

        $submissions = $this->submissionRepo->listPendingSubmissions($limit, $offset);
        Response::success($submissions, 'Pending submissions retrieved');
    }

    public function all(): void
    {
        RoleMiddleware::requireAdmin();

        $status = trim($_GET['status'] ?? '');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;

        $submissions = $this->submissionRepo->listAllSubmissions($status, $limit, $offset);
        Response::success($submissions);
    }

    public function downloadAttachment(int $submissionId, int $attachmentId): void
    {
        $user = AuthMiddleware::authenticate();

        $submission = $this->submissionRepo->getSubmissionById($submissionId);
        if (!$submission) {
            Response::notFound('Submission not found');
        }

        $isAdmin = in_array($user['role_name'], ['super_admin', 'admin'], true);
        if (!$isAdmin && (int)$submission['user_id'] !== (int)$user['id']) {
            Response::forbidden('Unauthorized to download this attachment.');
        }

        $stmt = $this->pdo->prepare("SELECT * FROM `submission_attachments` WHERE `id` = :id AND `submission_id` = :sid");
        $stmt->execute([':id' => $attachmentId, ':sid' => $submissionId]);
        $attachment = $stmt->fetch();

        if (!$attachment) {
            Response::notFound('Attachment not found');
        }

        $config = require dirname(__DIR__) . '/config/app.php';
        $fullPath = $config['storage']['base'] . DIRECTORY_SEPARATOR . $attachment['file_path'];

        if (!file_exists($fullPath)) {
            Response::notFound('File not found on storage server');
        }

        // Clean output buffering
        while (ob_get_level()) {
            ob_end_clean();
        }

        $inline = isset($_GET['inline']) && ($_GET['inline'] == '1' || $_GET['inline'] === 'true');
        $disposition = $inline ? 'inline' : 'attachment';

        header('Content-Type: ' . $attachment['mime_type']);
        header('Content-Disposition: ' . $disposition . '; filename="' . basename($attachment['original_filename']) . '"');
        header('Expires: 0');
        header('Cache-Control: public, must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($fullPath));
        readfile($fullPath);
        exit;
    }
}
