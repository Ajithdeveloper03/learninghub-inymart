<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Repositories\UserRepository;
use App\Utils\Logger;
use App\Utils\Response;

class DeviceSessionController
{
    private UserRepository $userRepo;

    public function __construct()
    {
        $this->userRepo = new UserRepository();
    }

    public function index(): void
    {
        $user = AuthMiddleware::authenticate();
        $targetUserId = (int)$user['id'];

        // If admin requests another student's sessions via query param
        if (isset($_GET['user_id']) && in_array($user['role_name'], ['super_admin', 'admin'], true)) {
            $targetUserId = (int)$_GET['user_id'];
        }

        $sessions = $this->userRepo->getActiveDeviceSessions($targetUserId);
        Response::success($sessions, 'Device sessions retrieved');
    }

    public function revoke(int $sessionId): void
    {
        $user = AuthMiddleware::authenticate();
        $isAdmin = in_array($user['role_name'], ['super_admin', 'admin'], true);

        $success = $this->userRepo->revokeSessionById($sessionId, $isAdmin ? null : (int)$user['id']);

        if (!$success) {
            Response::error('Failed to revoke session or session does not exist', 400);
        }

        Logger::audit((int)$user['id'], 'SESSION_REVOKED', 'device_session', $sessionId);
        Response::success(null, 'Device session revoked successfully');
    }
}
