<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\SubmissionRepository;
use App\Repositories\ProgressRepository;
use App\Utils\Database;
use App\Utils\Logger;
use App\Utils\Validator;
use Exception;
use PDO;

class AssignmentService
{
    private SubmissionRepository $submissionRepo;
    private ProgressRepository $progressRepo;
    private PDO $pdo;

    public function __construct()
    {
        $this->submissionRepo = new SubmissionRepository();
        $this->progressRepo = new ProgressRepository();
        $this->pdo = Database::getConnection();
    }

    public function submitAssignment(int $userId, int $assignmentId, ?string $submissionText, ?array $uploadedFile = null): array
    {
        $assignment = $this->submissionRepo->getAssignmentById($assignmentId);
        if (!$assignment) {
            throw new Exception("Assignment not found.");
        }

        $sectionId = (int)$assignment['section_id'];

        // 1. Verify that the section is unlocked
        if (!$this->progressRepo->isSectionUnlocked($userId, $sectionId)) {
            throw new Exception("You cannot submit an assignment for a locked section.");
        }

        // 2. CRITICAL INVARIANT: Verify that video is completed first!
        $progStmt = $this->pdo->prepare("
            SELECT `status` FROM `video_progress` 
            WHERE `user_id` = :uid AND `section_id` = :sid
        ");
        $progStmt->execute([':uid' => $userId, ':sid' => $sectionId]);
        $progress = $progStmt->fetch();

        if (!$progress || $progress['status'] !== 'VIDEO_COMPLETED') {
            throw new Exception("You must watch and complete the section video before submitting the assignment.");
        }

        // 3. Validate text / file requirements
        $type = $assignment['submission_type']; // 'text', 'file', 'both'
        if ($type === 'text' && empty(trim($submissionText ?? ''))) {
            throw new Exception("Written response is required for this assignment.");
        }

        if ($type === 'file' && (!$uploadedFile || $uploadedFile['error'] === UPLOAD_ERR_NO_FILE)) {
            // Check if existing submission already had attachments
            $existing = $this->submissionRepo->getSubmission($assignmentId, $userId);
            if (!$existing || empty($existing['attachments'])) {
                throw new Exception("File upload is required for this assignment.");
            }
        }

        if (empty(trim($submissionText ?? '')) && (!$uploadedFile || $uploadedFile['error'] === UPLOAD_ERR_NO_FILE)) {
            throw new Exception("Please provide a text response or upload a file for your submission.");
        }

        // 4. Create or update submission record
        $submissionId = $this->submissionRepo->createOrUpdateSubmission($assignmentId, $userId, $submissionText);

        // 5. Handle file upload if provided
        if ($uploadedFile && $uploadedFile['error'] === UPLOAD_ERR_OK) {
            $allowed = array_map('trim', explode(',', strtolower($assignment['allowed_file_types'] ?? 'pdf,png,jpg,jpeg,zip,docx')));
            $maxSize = (int)($assignment['max_file_size_bytes'] ?? 20971520);

            $validator = new Validator();
            $fileError = $validator->validateFile($uploadedFile, $allowed, $maxSize);
            if ($fileError !== null) {
                throw new Exception($fileError);
            }

            // Save file securely outside public web root
            $config = require dirname(__DIR__) . '/config/app.php';
            $storageDir = $config['storage']['submissions'];
            if (!is_dir($storageDir)) {
                @mkdir($storageDir, 0755, true);
            }

            $ext = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
            $safeFilename = 'sub_' . $submissionId . '_' . bin2hex(random_bytes(16)) . '.' . $ext;
            $targetPath = $storageDir . DIRECTORY_SEPARATOR . $safeFilename;

            if (!move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
                throw new Exception("Failed to store uploaded file on the server.");
            }

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $targetPath);
            finfo_close($finfo);

            $this->submissionRepo->addAttachment(
                $submissionId,
                'submissions/' . $safeFilename,
                $uploadedFile['name'],
                (int)$uploadedFile['size'],
                $mime
            );
        }

        // 6. Notify Instructors / Admins
        $adminStmt = $this->pdo->query("SELECT `id` FROM `users` WHERE `role_id` IN (1, 2) AND `is_active` = 1");
        $admins = $adminStmt->fetchAll();

        $studentStmt = $this->pdo->prepare("SELECT `full_name`, `username` FROM `users` WHERE `id` = :uid");
        $studentStmt->execute([':uid' => $userId]);
        $student = $studentStmt->fetch();

        foreach ($admins as $adm) {
            $notif = $this->pdo->prepare("
                INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`, `data_json`)
                VALUES (:uid, :title, :msg, 'ASSIGNMENT_SUBMITTED', :json)
            ");
            $notif->execute([
                ':uid' => $adm['id'],
                ':title' => 'New Student Assignment Submitted',
                ':msg' => "Student {$student['full_name']} (@{$student['username']}) submitted task: {$assignment['title']}.",
                ':json' => json_encode(['submission_id' => $submissionId, 'student_id' => $userId, 'assignment_id' => $assignmentId]),
            ]);
        }

        Logger::audit($userId, 'ASSIGNMENT_SUBMITTED', 'submission', $submissionId, [
            'assignment_id' => $assignmentId,
            'section_id' => $sectionId,
        ]);

        return [
            'submission_id' => $submissionId,
            'status' => 'PENDING_REVIEW',
            'message' => 'Assignment submitted successfully and is awaiting instructor review.',
        ];
    }
}
