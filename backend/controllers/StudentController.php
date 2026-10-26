<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\RoleMiddleware;
use App\Repositories\UserRepository;
use App\Repositories\CourseRepository;
use App\Utils\Database;
use App\Utils\Logger;
use App\Utils\Response;
use App\Utils\Validator;
use Exception;

class StudentController
{
    private UserRepository $userRepo;
    private CourseRepository $courseRepo;

    public function __construct()
    {
        $this->userRepo = new UserRepository();
        $this->courseRepo = new CourseRepository();
    }

    public function index(): void
    {
        RoleMiddleware::requireAdmin();

        $search = trim($_GET['search'] ?? '');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $students = $this->userRepo->listStudents($search, $limit, $offset);
        $total = $this->userRepo->countStudents($search);

        Response::success($students, 'Students retrieved', 200, [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
        ]);
    }

    public function show(int $id): void
    {
        $current = RoleMiddleware::requireAdmin();

        $student = $this->userRepo->findById($id);
        if (!$student || $student['role_name'] !== 'student') {
            Response::notFound('Student not found');
        }

        // Get enrollments & courses
        $courses = $this->courseRepo->getStudentCourses($id);
        // Get device sessions
        $sessions = $this->userRepo->getActiveDeviceSessions($id);

        Response::success([
            'student' => $student,
            'courses' => $courses,
            'device_sessions' => $sessions,
        ]);
    }

    public function create(): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        // If username not explicitly provided, use email as username
        if (empty($input['username']) && !empty($input['email'])) {
            $input['username'] = trim($input['email']);
        }

        $validator = new Validator();
        $rules = [
            'username' => ['required', 'min:3', 'max:150'],
            'email' => ['required', 'email'],
            'phone' => ['required', 'min:7', 'max:25'],
            'full_name' => ['required', 'min:2', 'max:100'],
            'password' => ['required', 'min:6'],
        ];

        if (!$validator->validate($input, $rules)) {
            $errs = $validator->getErrors();
            $firstErrors = [];
            foreach ($errs as $f => $mList) {
                $firstErrors[] = $mList[0];
            }
            Response::error(implode(' ', $firstErrors), 422, $errs);
        }

        // Check if username or email already taken
        $existing = $this->userRepo->findByUsername($input['username']);
        if ($existing) {
            Response::error('Username is already registered. Please choose another username.', 409);
        }

        $existingEmail = $this->userRepo->findByEmail($input['email']);
        if ($existingEmail) {
            Response::error('Email address is already registered to an account.', 409);
        }

        try {
            $studentId = $this->userRepo->createStudent([
                'username' => trim($input['username']),
                'email' => trim($input['email']),
                'phone' => trim($input['phone'] ?? ''),
                'full_name' => trim($input['full_name']),
                'password' => $input['password'],
                'role_id' => 3, // student
                'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1,
                'require_password_change' => isset($input['require_password_change']) ? (int)$input['require_password_change'] : 0,
            ]);

            // Optional course assignment
            if (!empty($input['course_ids']) && is_array($input['course_ids'])) {
                foreach ($input['course_ids'] as $cid) {
                    $this->courseRepo->enrollStudent($studentId, (int)$cid);
                }
            }

            // Dispatch welcome credentials email via SMTP
            require_once __DIR__ . '/../utils/Mailer.php';
            $mailer = new \App\Utils\Mailer();
            try {
                $mailer->sendStudentWelcomeEmail(
                    trim($input['email']),
                    trim($input['full_name']),
                    trim($input['username']),
                    $input['password'],
                    trim($input['phone'] ?? '')
                );
            } catch (Exception $mailEx) {
                error_log("Failed to send welcome credentials email: " . $mailEx->getMessage());
                // We notify the admin that account is registered but mail delivery had an issue
                throw new Exception("Student saved in database, but SMTP email delivery failed: " . $mailEx->getMessage());
            }

            Logger::audit((int)$admin['id'], 'STUDENT_CREATED', 'user', $studentId, [
                'username' => $input['username'],
                'assigned_courses' => $input['course_ids'] ?? [],
                'credentials_emailed_to' => $input['email'],
            ]);

            $created = $this->userRepo->findById($studentId);
            Response::success($created, 'Student account created and login credentials successfully emailed to ' . $input['email'], 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function update(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $student = $this->userRepo->findById($id);
        if (!$student || $student['role_name'] !== 'student') {
            Response::notFound('Student not found');
        }

        $this->userRepo->updateStudent($id, $input);
        Logger::audit((int)$admin['id'], 'STUDENT_UPDATED', 'user', $id, $input);

        $updated = $this->userRepo->findById($id);
        Response::success($updated, 'Student profile updated successfully');
    }

    public function toggleStatus(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();

        $student = $this->userRepo->findById($id);
        if (!$student || $student['role_name'] !== 'student') {
            Response::notFound('Student not found');
        }

        $newStatus = ((int)$student['is_active'] === 1) ? 0 : 1;
        $this->userRepo->updateStudent($id, ['is_active' => $newStatus]);

        if ($newStatus === 0) {
            // Revoke active sessions immediately if suspended
            $this->userRepo->revokeOtherStudentSessions($id);
        }

        Logger::audit((int)$admin['id'], 'STUDENT_STATUS_TOGGLED', 'user', $id, ['new_status' => $newStatus]);
        Response::success(['is_active' => $newStatus], 'Student status updated successfully');
    }

    public function resetPassword(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $newPassword = $input['new_password'] ?? 'Student@' . rand(10000, 99999);

        $student = $this->userRepo->findById($id);
        if (!$student || $student['role_name'] !== 'student') {
            Response::notFound('Student not found');
        }

        $this->userRepo->updatePassword($id, $newPassword, false);
        // Revoke active sessions so they must log in with new password
        $this->userRepo->revokeOtherStudentSessions($id);

        Logger::audit((int)$admin['id'], 'STUDENT_PASSWORD_RESET', 'user', $id);

        Response::success([
            'temporary_password' => $newPassword,
            'message' => 'Password reset successfully. The student will be prompted to change it on login.',
        ]);
    }

    public function resetDevice(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();

        $student = $this->userRepo->findById($id);
        if (!$student || $student['role_name'] !== 'student') {
            Response::notFound('Student not found');
        }

        $revokedCount = $this->userRepo->revokeOtherStudentSessions($id);
        Logger::audit((int)$admin['id'], 'STUDENT_DEVICE_RESET', 'user', $id, ['revoked_sessions' => $revokedCount]);

        Response::success([
            'revoked_count' => $revokedCount,
            'message' => 'Active device session cleared. The student can now log in on a new device.',
        ]);
    }

    public function enroll(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $courseId = (int)($input['course_id'] ?? 0);

        if (!$courseId) {
            Response::error('Course ID is required', 400);
        }

        $this->courseRepo->enrollStudent($id, $courseId);
        Logger::audit((int)$admin['id'], 'STUDENT_ENROLLED', 'course', $courseId, ['student_id' => $id]);

        Response::success(null, 'Student enrolled in course successfully');
    }
}
