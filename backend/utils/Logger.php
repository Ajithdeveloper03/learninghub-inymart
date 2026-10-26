<?php
declare(strict_types=1);

namespace App\Utils;

class Logger
{
    public static function audit(?int $userId, string $action, string $entityType, ?int $entityId = null, ?array $details = null): void
    {
        try {
            $pdo = Database::getConnection();
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

            $stmt = $pdo->prepare("
                INSERT INTO `audit_logs` (`user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`)
                VALUES (:user_id, :action, :entity_type, :entity_id, :ip_address, :user_agent, :details_json)
            ");
            $stmt->execute([
                ':user_id' => $userId,
                ':action' => $action,
                ':entity_type' => $entityType,
                ':entity_id' => $entityId,
                ':ip_address' => $ip,
                ':user_agent' => $ua,
                ':details_json' => $details ? json_encode($details) : null,
            ]);
        } catch (\Exception $e) {
            error_log("Failed to write audit log: " . $e->getMessage());
        }
    }

    public static function log(string $level, string $message, array $context = []): void
    {
        $config = require dirname(__DIR__) . '/config/app.php';
        $logFile = $config['storage']['logs'] . DIRECTORY_SEPARATOR . 'app-' . date('Y-m-d') . '.log';
        $formatted = sprintf(
            "[%s] [%s] %s %s\n",
            date('Y-m-d H:i:s'),
            strtoupper($level),
            $message,
            !empty($context) ? json_encode($context) : ''
        );
        @file_put_contents($logFile, $formatted, FILE_APPEND);
    }
}
