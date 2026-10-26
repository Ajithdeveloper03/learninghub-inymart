<?php
/**
 * Secure Digital Marketing Academy LMS - API Gateway & Front Controller
 * Plain PHP Native Implementation
 */

declare(strict_types=1);

if (php_sapi_name() === 'cli-server') {
    $url = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($url !== '/' && file_exists(__DIR__ . $url)) {
        return false;
    }
}

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Register PSR-4 style autoloader for App\ namespace
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = dirname(__DIR__) . DIRECTORY_SEPARATOR;

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $parts = explode('\\', $relativeClass);

    // Convert first part to lowercase directory name (e.g. Controllers -> controllers)
    if (!empty($parts)) {
        $parts[0] = strtolower($parts[0]);
    }

    $file = $baseDir . implode(DIRECTORY_SEPARATOR, $parts) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

// Auto-load backend .env if present
$envFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            [$k, $v] = explode('=', $line, 2);
            $k = trim($k);
            $v = trim($v, " \t\n\r\0\x0B\"'");
            if (!getenv($k)) {
                putenv("{$k}={$v}");
                $_ENV[$k] = $v;
                $_SERVER[$k] = $v;
            }
        }
    }
}

use App\Controllers\AuthController;
use App\Controllers\StudentController;
use App\Controllers\CourseController;
use App\Controllers\SectionController;
use App\Controllers\VideoController;
use App\Controllers\AssignmentController;
use App\Controllers\ApprovalController;
use App\Controllers\NotificationController;
use App\Controllers\DeviceSessionController;
use App\Controllers\ReportController;
use App\Middleware\CorsMiddleware;
use App\Routes\Router;
use App\Utils\Response;

// Apply CORS & Options preflight
CorsMiddleware::handle();

$router = new Router();

// Health Check
$router->get('/api/health', function () {
    Response::success([
        'status' => 'online',
        'timestamp' => time(),
        'php_version' => PHP_VERSION,
        'system' => 'Secure Digital Marketing Academy LMS Backend',
    ], 'API Healthy');
});

// Authentication Routes
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->get('/api/auth/me', [AuthController::class, 'me']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);
$router->post('/api/auth/change-password', [AuthController::class, 'changePassword']);

// Student Management (Admin)
$router->get('/api/students', [StudentController::class, 'index']);
$router->post('/api/students', [StudentController::class, 'create']);
$router->get('/api/students/{id}', [StudentController::class, 'show']);
$router->patch('/api/students/{id}', [StudentController::class, 'update']);
$router->post('/api/students/{id}/suspend', [StudentController::class, 'toggleStatus']);
$router->post('/api/students/{id}/reset-password', [StudentController::class, 'resetPassword']);
$router->post('/api/students/{id}/reset-device', [StudentController::class, 'resetDevice']);
$router->post('/api/students/{id}/enroll', [StudentController::class, 'enroll']);

// Courses
$router->get('/api/courses', [CourseController::class, 'index']);
$router->post('/api/courses', [CourseController::class, 'create']);
$router->put('/api/courses/{id}', [CourseController::class, 'update']);
$router->post('/api/courses/{id}', [CourseController::class, 'update']);
$router->delete('/api/courses/{id}', [CourseController::class, 'delete']);
$router->get('/api/courses/enrolled', [CourseController::class, 'studentEnrolled']);
$router->get('/api/courses/slug/{slug}', [CourseController::class, 'showBySlug']);
$router->get('/api/courses/{id}', [CourseController::class, 'show']);

// Sections & Access
$router->get('/api/sections/{id}/access', [SectionController::class, 'access']);
$router->post('/api/sections/{id}/unlock', [SectionController::class, 'unlockForStudent']);

// Videos & Streaming
$router->post('/api/videos/upload', [VideoController::class, 'upload']);
$router->post('/api/videos/{id}/playback-authorize', [VideoController::class, 'authorizePlayback']);
$router->get('/api/videos/stream', [VideoController::class, 'stream']);
$router->post('/api/videos/{id}/progress', [VideoController::class, 'recordProgress']);

// Assignments & Submissions
$router->get('/api/sections/{id}/assignment', [AssignmentController::class, 'getForSection']);
$router->post('/api/submissions', [AssignmentController::class, 'submit']);
$router->post('/api/assignments/{id}/submissions', [AssignmentController::class, 'submit']);
$router->get('/api/submissions/{id}', [AssignmentController::class, 'show']);
$router->get('/api/submissions/{id}/download/{attachment_id}', [AssignmentController::class, 'downloadAttachment']);
$router->get('/api/admin/submissions/pending', [AssignmentController::class, 'pending']);
$router->get('/api/admin/submissions/all', [AssignmentController::class, 'all']);

// Approvals & Workflow Decisions
$router->post('/api/submissions/{id}/approve', [ApprovalController::class, 'approve']);
$router->post('/api/submissions/{id}/request-revision', [ApprovalController::class, 'requestRevision']);
$router->post('/api/submissions/{id}/reject', [ApprovalController::class, 'reject']);

// Notifications
$router->get('/api/notifications', [NotificationController::class, 'index']);
$router->post('/api/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
$router->post('/api/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

// Device Sessions
$router->get('/api/device-sessions', [DeviceSessionController::class, 'index']);
$router->post('/api/device-sessions/{id}/revoke', [DeviceSessionController::class, 'revoke']);

// Reports & Audit
$router->get('/api/reports/dashboard', [ReportController::class, 'dashboard']);
$router->get('/api/reports/audit-logs', [ReportController::class, 'auditLogs']);
$router->get('/api/reports/student-progress', [ReportController::class, 'studentProgress']);
$router->get('/api/reports/export-csv', [ReportController::class, 'exportCsv']);

// Dispatch
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';

try {
    $router->dispatch($method, $uri);
} catch (Throwable $e) {
    error_log("Unhandled Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    Response::error("An unexpected server error occurred.", 500);
}
