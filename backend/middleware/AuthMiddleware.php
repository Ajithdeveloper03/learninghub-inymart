<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Utils\Database;
use App\Utils\JWT;
use App\Utils\Response;
use PDO;

class AuthMiddleware
{
    private static ?array $currentUser = null;
    private static ?array $currentSession = null;

    public static function tryAuthenticate(): ?array
    {
        $token = self::extractToken();
        if (!$token) {
            return null;
        }

        try {
            $payload = JWT::decode($token);
            if (!$payload || !isset($payload['user_id']) || !isset($payload['session_token'])) {
                return null;
            }

            $pdo = Database::getConnection();
            $sessionStmt = $pdo->prepare("
                SELECT `id`, `user_id`, `session_token`, `is_revoked`, `expires_at`, `revoked_at`
                FROM `device_sessions`
                WHERE `session_token` = :session_token
            ");
            $sessionStmt->execute([':session_token' => $payload['session_token']]);
            $deviceSession = $sessionStmt->fetch();

            if (!$deviceSession) {
                $userCheck = $pdo->prepare("SELECT `id`, `is_active` FROM `users` WHERE `id` = :id");
                $userCheck->execute([':id' => $payload['user_id']]);
                $u = $userCheck->fetch();
                if ($u && (int)$u['is_active'] === 1) {
                    $ins = $pdo->prepare("
                        INSERT INTO `device_sessions` (`user_id`, `session_token`, `device_name`, `ip_address`, `expires_at`, `is_revoked`)
                        VALUES (:uid, :token, 'Active Browser', :ip, DATE_ADD(NOW(), INTERVAL 7 DAY), 0)
                    ");
                    $ins->execute([
                        ':uid' => $u['id'],
                        ':token' => $payload['session_token'],
                        ':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                    ]);
                    $sessionStmt->execute([':session_token' => $payload['session_token']]);
                    $deviceSession = $sessionStmt->fetch();
                }
            }

            if (!$deviceSession || (int)$deviceSession['is_revoked'] === 1 || strtotime($deviceSession['expires_at']) < time()) {
                return null;
            }

            $userStmt = $pdo->prepare("
                SELECT u.`id`, u.`username`, u.`email`, u.`full_name`, u.`role_id`, u.`is_active`, 
                       u.`require_password_change`, r.`name` as `role_name`
                FROM `users` u
                JOIN `roles` r ON u.`role_id` = r.`id`
                WHERE u.`id` = :id
            ");
            $userStmt->execute([':id' => $payload['user_id']]);
            $user = $userStmt->fetch();

            if (!$user || (int)$user['is_active'] !== 1) {
                return null;
            }

            self::$currentUser = $user;
            self::$currentSession = $deviceSession;
            return $user;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public static function authenticate(): array
    {
        $token = self::extractToken();
        if (!$token) {
            Response::unauthorized('Authentication token missing or invalid');
        }

        $payload = JWT::decode($token);
        if (!$payload || !isset($payload['user_id']) || !isset($payload['session_token'])) {
            Response::unauthorized('Invalid or expired authentication session');
        }

        $pdo = Database::getConnection();

        // Check device session validity (Enforces single-active-device policy)
        $sessionStmt = $pdo->prepare("
            SELECT `id`, `user_id`, `session_token`, `is_revoked`, `expires_at`, `revoked_at`
            FROM `device_sessions`
            WHERE `session_token` = :session_token
        ");
        $sessionStmt->execute([':session_token' => $payload['session_token']]);
        $deviceSession = $sessionStmt->fetch();

        if (!$deviceSession) {
            // Auto-heal session if user exists and is active (prevents logout on server restart/migration)
            $userCheck = $pdo->prepare("SELECT `id`, `is_active` FROM `users` WHERE `id` = :id");
            $userCheck->execute([':id' => $payload['user_id']]);
            $u = $userCheck->fetch();
            if ($u && (int)$u['is_active'] === 1) {
                $ins = $pdo->prepare("
                    INSERT INTO `device_sessions` (`user_id`, `session_token`, `device_name`, `ip_address`, `expires_at`, `is_revoked`)
                    VALUES (:uid, :token, 'Active Browser', :ip, DATE_ADD(NOW(), INTERVAL 7 DAY), 0)
                ");
                $ins->execute([
                    ':uid' => $u['id'],
                    ':token' => $payload['session_token'],
                    ':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                ]);
                $sessionStmt->execute([':session_token' => $payload['session_token']]);
                $deviceSession = $sessionStmt->fetch();
            } else {
                Response::unauthorized('Session not recognized. Please log in again.');
            }
        }

        if ((int)$deviceSession['is_revoked'] === 1) {
            Response::error('This session has been revoked because another device logged into your account or administrator revoked it.', 401, [
                'code' => 'SESSION_REVOKED',
            ]);
        }

        if (strtotime($deviceSession['expires_at']) < time()) {
            Response::unauthorized('Session expired. Please log in again.');
        }

        // Fetch user data with role
        $userStmt = $pdo->prepare("
            SELECT u.`id`, u.`username`, u.`email`, u.`full_name`, u.`role_id`, u.`is_active`, 
                   u.`require_password_change`, r.`name` as `role_name`
            FROM `users` u
            JOIN `roles` r ON u.`role_id` = r.`id`
            WHERE u.`id` = :id
        ");
        $userStmt->execute([':id' => $payload['user_id']]);
        $user = $userStmt->fetch();

        if (!$user) {
            Response::unauthorized('User not found.');
        }

        if ((int)$user['is_active'] !== 1) {
            Response::error('Your account is currently suspended. Please contact the administrator.', 403, [
                'code' => 'ACCOUNT_SUSPENDED',
            ]);
        }

        // Update last activity on session
        $updateActivity = $pdo->prepare("
            UPDATE `device_sessions` 
            SET `last_activity_at` = CURRENT_TIMESTAMP 
            WHERE `id` = :id
        ");
        $updateActivity->execute([':id' => $deviceSession['id']]);

        self::$currentUser = $user;
        self::$currentSession = $deviceSession;

        return $user;
    }

    public static function getCurrentUser(): ?array
    {
        return self::$currentUser;
    }

    public static function getCurrentSession(): ?array
    {
        return self::$currentSession;
    }

    private static function extractToken(): ?string
    {
        // 1. Authorization header: Bearer <token>
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return trim($matches[1]);
        }

        // 2. Cookie session
        if (isset($_COOKIE['auth_token']) && !empty($_COOKIE['auth_token'])) {
            return trim($_COOKIE['auth_token']);
        }

        // 3. Query string (only for video streaming range requests if token passed)
        if (isset($_GET['token']) && !empty($_GET['token'])) {
            return trim($_GET['token']);
        }

        return null;
    }
}
