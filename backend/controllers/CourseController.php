<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Repositories\CourseRepository;
use App\Utils\Logger;
use App\Utils\Response;
use App\Utils\Validator;
use Exception;

class CourseController
{
    private CourseRepository $courseRepo;

    public function __construct()
    {
        $this->courseRepo = new CourseRepository();
    }

    public function index(): void
    {
        $user = AuthMiddleware::tryAuthenticate();
        $isAdmin = ($user && in_array($user['role_name'], ['super_admin', 'admin'], true));
        $courses = $this->courseRepo->listCourses(!$isAdmin);

        Response::success($courses, 'Courses retrieved');
    }

    public function show(int $id): void
    {
        $user = AuthMiddleware::tryAuthenticate();
        $course = $this->courseRepo->getCourseHierarchy($id, $user ? (int)$user['id'] : null);
        if (!$course) {
            Response::notFound('Course not found');
        }

        Response::success($course);
    }

    public function showBySlug(string $slug): void
    {
        $course = $this->courseRepo->findBySlug($slug);
        if (!$course) {
            Response::notFound('Course not found');
        }

        $hierarchy = $this->courseRepo->getCourseHierarchy((int)$course['id'], null);
        Response::success($hierarchy);
    }

    public function studentEnrolled(): void
    {
        $user = RoleMiddleware::requireStudent();
        $courses = $this->courseRepo->getStudentCourses((int)$user['id']);

        Response::success($courses, 'Enrolled courses retrieved');
    }

    public function create(): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $validator = new Validator();
        $rules = [
            'title' => ['required', 'min:3', 'max:200'],
            'slug' => ['required', 'min:3', 'max:220'],
        ];

        if (!$validator->validate($input, $rules)) {
            Response::error('Validation failed', 422, $validator->getErrors());
        }

        try {
            $input['created_by'] = (int)$admin['id'];
            $id = $this->courseRepo->createCourse($input);

            Logger::audit((int)$admin['id'], 'COURSE_CREATED', 'course', $id, ['title' => $input['title']]);
            $created = $this->courseRepo->findById($id);

            Response::success($created, 'Course created successfully', 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function update(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $existing = $this->courseRepo->findById($id);
        if (!$existing) {
            Response::notFound('Course not found');
        }

        try {
            $this->courseRepo->updateCourse($id, $input);
            Logger::audit((int)$admin['id'], 'COURSE_UPDATED', 'course', $id, ['title' => $input['title'] ?? $existing['title']]);
            $updated = $this->courseRepo->findById($id);

            Response::success($updated, 'Course updated successfully');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete(int $id): void
    {
        $admin = RoleMiddleware::requireAdmin();
        $existing = $this->courseRepo->findById($id);
        if (!$existing) {
            Response::notFound('Course not found');
        }

        try {
            $this->courseRepo->deleteCourse($id);
            Logger::audit((int)$admin['id'], 'COURSE_DELETED', 'course', $id, ['title' => $existing['title']]);

            Response::success(null, 'Course deleted successfully');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
