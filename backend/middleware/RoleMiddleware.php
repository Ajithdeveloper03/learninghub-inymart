<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Utils\Response;

class RoleMiddleware
{
    public static function requireRole(array $allowedRoles): array
    {
        $user = AuthMiddleware::authenticate();
        $userRole = $user['role_name'] ?? '';

        if (!in_array($userRole, $allowedRoles, true)) {
            Response::forbidden("Access denied. Required role: " . implode(' or ', $allowedRoles));
        }

        return $user;
    }

    public static function requireAdmin(): array
    {
        return self::requireRole(['super_admin', 'admin']);
    }

    public static function requireSuperAdmin(): array
    {
        return self::requireRole(['super_admin']);
    }

    public static function requireStudent(): array
    {
        return self::requireRole(['student']);
    }
}
