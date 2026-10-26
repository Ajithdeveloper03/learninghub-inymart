<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Utils\Database;
use PDO;

class UserRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT u.`id`, u.`username`, u.`email`, u.`phone`, u.`full_name`, u.`role_id`, u.`is_active`,
                   u.`require_password_change`, u.`created_at`, u.`updated_at`, r.`name` as `role_name`
            FROM `users` u
            JOIN `roles` r ON u.`role_id` = r.`id`
            WHERE u.`id` = :id
        ");
        $stmt->execute([':id' => $id]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function findByUsername(string $username): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT u.*, r.`name` as `role_name`
            FROM `users` u
            JOIN `roles` r ON u.`role_id` = r.`id`
            WHERE u.`username` = :username OR u.`email` = :email
            LIMIT 1
        ");
        $stmt->execute([':username' => $username, ':email' => $username]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function createStudent(array $data): int
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `users` (`username`, `email`, `phone`, `full_name`, `password_hash`, `role_id`, `is_active`, `require_password_change`)
            VALUES (:username, :email, :phone, :full_name, :password_hash, :role_id, :is_active, :require_password_change)
        ");
        $stmt->execute([
            ':username' => $data['username'],
            ':email' => $data['email'],
            ':phone' => $data['phone'] ?? null,
            ':full_name' => $data['full_name'],
            ':password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            ':role_id' => $data['role_id'] ?? 3, // 3 = student
            ':is_active' => $data['is_active'] ?? 1,
            ':require_password_change' => $data['require_password_change'] ?? 0,
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    public function updateStudent(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        if (isset($data['full_name'])) {
            $fields[] = "`full_name` = :full_name";
            $params[':full_name'] = $data['full_name'];
        }
        if (isset($data['email'])) {
            $fields[] = "`email` = :email";
            $params[':email'] = $data['email'];
        }
        if (isset($data['is_active'])) {
            $fields[] = "`is_active` = :is_active";
            $params[':is_active'] = (int)$data['is_active'];
        }
        if (isset($data['require_password_change'])) {
            $fields[] = "`require_password_change` = :require_password_change";
            $params[':require_password_change'] = (int)$data['require_password_change'];
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE `users` SET " . implode(', ', $fields) . " WHERE `id` = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    public function updatePassword(int $id, string $newPassword, bool $clearRequireChange = true): bool
    {
        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $this->pdo->prepare("
            UPDATE `users` 
            SET `password_hash` = :hash, 
                `require_password_change` = :req 
            WHERE `id` = :id
        ");
        return $stmt->execute([
            ':hash' => $hash,
            ':req' => $clearRequireChange ? 0 : 1,
            ':id' => $id,
        ]);
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `users` WHERE `email` = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function listStudents(string $search = '', int $limit = 50, int $offset = 0): array
    {
        $query = "
            SELECT u.`id`, u.`username`, u.`email`, u.`phone`, u.`full_name`, u.`is_active`, 
                   u.`require_password_change`, u.`created_at`,
                   (SELECT COUNT(*) FROM `course_enrollments` ce WHERE ce.`user_id` = u.`id`) as `enrolled_courses_count`,
                   (SELECT COUNT(*) FROM `submissions` s WHERE s.`user_id` = u.`id` AND s.`status` = 'APPROVED') as `approved_submissions_count`
            FROM `users` u
            WHERE u.`role_id` = 3
        ";

        $params = [];
        if ($search !== '') {
            $query .= " AND (u.`username` LIKE :s1 OR u.`email` LIKE :s2 OR u.`full_name` LIKE :s3)";
            $params[':s1'] = "%{$search}%";
            $params[':s2'] = "%{$search}%";
            $params[':s3'] = "%{$search}%";
        }

        $query .= " ORDER BY u.`created_at` DESC LIMIT " . (int)$limit . " OFFSET " . (int)$offset;

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function countStudents(string $search = ''): int
    {
        $query = "SELECT COUNT(*) FROM `users` WHERE `role_id` = 3";
        $params = [];
        if ($search !== '') {
            $query .= " AND (`username` LIKE :s1 OR `email` LIKE :s2 OR `full_name` LIKE :s3)";
            $params[':s1'] = "%{$search}%";
            $params[':s2'] = "%{$search}%";
            $params[':s3'] = "%{$search}%";
        }
        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    public function createDeviceSession(int $userId, string $sessionToken, string $ip, string $ua, string $deviceName, int $lifetime = 86400 * 7): int
    {
        $expiresAt = date('Y-m-d H:i:s', time() + $lifetime);
        $stmt = $this->pdo->prepare("
            INSERT INTO `device_sessions` (`user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `expires_at`)
            VALUES (:user_id, :session_token, :ip_address, :user_agent, :device_name, :expires_at)
        ");
        $stmt->execute([
            ':user_id' => $userId,
            ':session_token' => $sessionToken,
            ':ip_address' => $ip,
            ':user_agent' => $ua,
            ':device_name' => $deviceName,
            ':expires_at' => $expiresAt,
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    public function revokeOtherStudentSessions(int $userId, ?string $keepSessionToken = null): int
    {
        $sql = "
            UPDATE `device_sessions` 
            SET `is_revoked` = 1, `revoked_at` = NOW() 
            WHERE `user_id` = :user_id AND `is_revoked` = 0
        ";
        $params = [':user_id' => $userId];

        if ($keepSessionToken !== null) {
            $sql .= " AND `session_token` != :keep_token";
            $params[':keep_token'] = $keepSessionToken;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    public function getActiveDeviceSessions(int $userId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT `id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `last_activity_at`, `created_at`
            FROM `device_sessions`
            WHERE `user_id` = :user_id
            ORDER BY `last_activity_at` DESC
        ");
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function revokeSessionById(int $sessionId, ?int $userId = null): bool
    {
        $sql = "UPDATE `device_sessions` SET `is_revoked` = 1, `revoked_at` = NOW() WHERE `id` = :id";
        $params = [':id' => $sessionId];
        if ($userId !== null) {
            $sql .= " AND `user_id` = :user_id";
            $params[':user_id'] = $userId;
        }
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }
}
