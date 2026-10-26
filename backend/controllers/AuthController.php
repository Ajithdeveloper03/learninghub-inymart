<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimitMiddleware;
use App\Services\AuthService;
use App\Utils\Response;
use App\Utils\Validator;
use Exception;

class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');
        $deviceName = trim($input['device_name'] ?? '');
        $portalType = trim($input['portal_type'] ?? '');

        if ($username === '' || $password === '') {
            Response::error('Username and password are required', 400);
        }

        // Apply brute-force rate limit (10 attempts per IP+username)
        $rawIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $ip = trim(explode(',', $rawIp)[0]);
        $rateKey = "login_{$ip}_{$username}";
        RateLimitMiddleware::check('login', $rateKey, 10, 180);

        try {
            $result = $this->authService->login($username, $password, $deviceName, $portalType !== '' ? $portalType : null);
            RateLimitMiddleware::reset('login', $rateKey);

            // Set secure cookie as well for same-site sessions
            setcookie('auth_token', $result['token'], [
                'expires' => time() + 86400 * 7,
                'path' => '/',
                'httponly' => true,
                'samesite' => 'Lax',
            ]);

            Response::success($result, 'Login successful');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 401);
        }
    }

    public function me(): void
    {
        $user = AuthMiddleware::authenticate();
        $session = AuthMiddleware::getCurrentSession();

        Response::success([
            'user' => [
                'id' => (int)$user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => $user['role_name'],
                'require_password_change' => (bool)$user['require_password_change'],
            ],
            'session' => [
                'id' => (int)$session['id'],
                'device_name' => $session['device_name'] ?? 'Current Device',
                'created_at' => $session['created_at'] ?? null,
            ],
        ]);
    }

    public function logout(): void
    {
        $user = AuthMiddleware::authenticate();
        $session = AuthMiddleware::getCurrentSession();

        if ($session) {
            $this->authService->logout($session);
        }

        // Clear cookie
        setcookie('auth_token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        Response::success(null, 'Logged out successfully');
    }

    public function changePassword(): void
    {
        $user = AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $oldPassword = (string)($input['old_password'] ?? '');
        $newPassword = (string)($input['new_password'] ?? '');

        if ($oldPassword === '' || $newPassword === '') {
            Response::error('Both current password and new password are required.', 400);
        }

        try {
            $this->authService->changePassword((int)$user['id'], $oldPassword, $newPassword);
            Response::success(null, 'Password updated successfully');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
