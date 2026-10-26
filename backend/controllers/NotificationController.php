<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Utils\Database;
use App\Utils\Response;
use PDO;

class NotificationController
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function index(): void
    {
        $user = AuthMiddleware::authenticate();
        $userId = (int)$user['id'];

        $stmt = $this->pdo->prepare("
            SELECT * FROM `notifications`
            WHERE `user_id` = :uid
            ORDER BY `created_at` DESC
            LIMIT 50
        ");
        $stmt->execute([':uid' => $userId]);
        $notifications = $stmt->fetchAll();

        $unreadCountStmt = $this->pdo->prepare("
            SELECT COUNT(*) FROM `notifications`
            WHERE `user_id` = :uid AND `is_read` = 0
        ");
        $unreadCountStmt->execute([':uid' => $userId]);
        $unreadCount = (int)$unreadCountStmt->fetchColumn();

        Response::success([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(int $id): void
    {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->pdo->prepare("
            UPDATE `notifications` 
            SET `is_read` = 1 
            WHERE `id` = :id AND `user_id` = :uid
        ");
        $stmt->execute([':id' => $id, ':uid' => (int)$user['id']]);

        Response::success(null, 'Notification marked as read');
    }

    public function markAllAsRead(): void
    {
        $user = AuthMiddleware::authenticate();
        $stmt = $this->pdo->prepare("
            UPDATE `notifications` 
            SET `is_read` = 1 
            WHERE `user_id` = :uid AND `is_read` = 0
        ");
        $stmt->execute([':uid' => (int)$user['id']]);

        Response::success(null, 'All notifications marked as read');
    }
}
