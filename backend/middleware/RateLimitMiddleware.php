<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Utils\Database;
use App\Utils\Response;
use PDO;

class RateLimitMiddleware
{
    public static function check(string $action, string $identifier, int $maxAttempts = 5, int $decaySeconds = 300): void
    {
        $pdo = Database::getConnection();
        $now = date('Y-m-d H:i:s');

        // Clean expired rate limits
        $cleanStmt = $pdo->prepare("DELETE FROM `rate_limits` WHERE `expires_at` < :now");
        $cleanStmt->execute([':now' => $now]);

        $stmt = $pdo->prepare("
            SELECT `id`, `hit_count`, `expires_at` 
            FROM `rate_limits` 
            WHERE `identifier` = :identifier AND `action` = :action
        ");
        $stmt->execute([':identifier' => $identifier, ':action' => $action]);
        $record = $stmt->fetch();

        if ($record) {
            if ($record['hit_count'] >= $maxAttempts) {
                $retryAfter = max(1, strtotime($record['expires_at']) - time());
                Response::error("Too many attempts. Please try again after {$retryAfter} seconds.", 429, [
                    'retry_after' => $retryAfter,
                ]);
            }

            // Increment
            $update = $pdo->prepare("UPDATE `rate_limits` SET `hit_count` = `hit_count` + 1 WHERE `id` = :id");
            $update->execute([':id' => $record['id']]);
        } else {
            // Insert
            $expiresAt = date('Y-m-d H:i:s', time() + $decaySeconds);
            $insert = $pdo->prepare("
                INSERT INTO `rate_limits` (`identifier`, `action`, `hit_count`, `expires_at`)
                VALUES (:identifier, :action, 1, :expires_at)
            ");
            $insert->execute([
                ':identifier' => $identifier,
                ':action' => $action,
                ':expires_at' => $expiresAt,
            ]);
        }
    }

    public static function reset(string $action, string $identifier): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM `rate_limits` WHERE `identifier` = :identifier AND `action` = :action");
        $stmt->execute([':identifier' => $identifier, ':action' => $action]);
    }
}
