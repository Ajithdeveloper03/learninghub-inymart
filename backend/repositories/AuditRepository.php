<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Utils\Database;
use PDO;

class AuditRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function getDashboardStats(): array
    {
        // 1. Total students
        $sStmt = $this->pdo->query("SELECT COUNT(*) FROM `users` WHERE `role_id` = 3");
        $totalStudents = (int)$sStmt->fetchColumn();

        // 2. Active students
        $asStmt = $this->pdo->query("SELECT COUNT(*) FROM `users` WHERE `role_id` = 3 AND `is_active` = 1");
        $activeStudents = (int)$asStmt->fetchColumn();

        // 3. Total & Published courses
        $cStmt = $this->pdo->query("SELECT COUNT(*) as `total`, SUM(IF(`is_published` = 1, 1, 0)) as `published` FROM `courses`");
        $courses = $cStmt->fetch();

        // 4. Pending assignments
        $pStmt = $this->pdo->query("SELECT COUNT(*) FROM `submissions` WHERE `status` = 'PENDING_REVIEW'");
        $pendingSubmissions = (int)$pStmt->fetchColumn();

        // 5. Completed sections (Approved submissions)
        $csStmt = $this->pdo->query("SELECT COUNT(*) FROM `submissions` WHERE `status` = 'APPROVED'");
        $completedSections = (int)$csStmt->fetchColumn();

        // 6. Currently active sessions (Students active in last 24h)
        $actStmt = $this->pdo->query("
            SELECT COUNT(DISTINCT `user_id`) 
            FROM `device_sessions` 
            WHERE `is_revoked` = 0 AND `last_activity_at` >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        $activeNow = (int)$actStmt->fetchColumn();

        // 7. Recent submissions
        $subStmt = $this->pdo->query("
            SELECT s.`id`, s.`status`, s.`submitted_at`, u.`full_name` as `student_name`, a.`title` as `assignment_title`, sec.`title` as `section_title`
            FROM `submissions` s
            JOIN `users` u ON s.`user_id` = u.`id`
            JOIN `assignments` a ON s.`assignment_id` = a.`id`
            JOIN `sections` sec ON a.`section_id` = sec.`id`
            ORDER BY s.`submitted_at` DESC LIMIT 6
        ");
        $recentSubmissions = $subStmt->fetchAll();

        // 8. Recent logins / device events
        $loginsStmt = $this->pdo->query("
            SELECT ds.`id`, ds.`ip_address`, ds.`device_name`, ds.`is_revoked`, ds.`created_at`, ds.`last_activity_at`,
                   u.`full_name` as `user_name`, u.`username`
            FROM `device_sessions` ds
            JOIN `users` u ON ds.`user_id` = u.`id`
            ORDER BY ds.`created_at` DESC LIMIT 6
        ");
        $recentLogins = $loginsStmt->fetchAll();

        // 9. Recent security alerts / audit logs
        $alertsStmt = $this->pdo->query("
            SELECT al.*, u.`username`
            FROM `audit_logs` al
            LEFT JOIN `users` u ON al.`user_id` = u.`id`
            ORDER BY al.`created_at` DESC LIMIT 8
        ");
        $recentAudit = $alertsStmt->fetchAll();

        return [
            'total_students' => $totalStudents,
            'active_students' => $activeStudents,
            'total_courses' => (int)($courses['total'] ?? 0),
            'published_courses' => (int)($courses['published'] ?? 0),
            'pending_approvals' => $pendingSubmissions,
            'completed_sections' => $completedSections,
            'students_active_24h' => $activeNow,
            'recent_submissions' => $recentSubmissions,
            'recent_logins' => $recentLogins,
            'recent_audit' => $recentAudit,
        ];
    }

    public function listAuditLogs(int $limit = 100, int $offset = 0): array
    {
        $stmt = $this->pdo->prepare("
            SELECT al.*, u.`username`, u.`full_name`
            FROM `audit_logs` al
            LEFT JOIN `users` u ON al.`user_id` = u.`id`
            ORDER BY al.`created_at` DESC
            LIMIT :lim OFFSET :off
        ");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getStudentProgressReport(): array
    {
        $stmt = $this->pdo->query("
            SELECT u.`id` as `student_id`, u.`username`, u.`full_name`, u.`email`,
                   c.`title` as `course_title`,
                   COUNT(DISTINCT s.`id`) as `total_course_sections`,
                   COUNT(DISTINCT CASE WHEN sub.`status` = 'APPROVED' THEN sub.`id` END) as `approved_sections`,
                   COUNT(DISTINCT CASE WHEN sub.`status` = 'PENDING_REVIEW' THEN sub.`id` END) as `pending_sections`,
                   ROUND(AVG(vp.`completion_percentage`), 1) as `avg_video_completion`
            FROM `users` u
            JOIN `course_enrollments` ce ON u.`id` = ce.`user_id`
            JOIN `courses` c ON ce.`course_id` = c.`id`
            LEFT JOIN `modules` m ON c.`id` = m.`course_id`
            LEFT JOIN `sections` s ON m.`id` = s.`module_id`
            LEFT JOIN `video_progress` vp ON (u.`id` = vp.`user_id` AND s.`id` = vp.`section_id`)
            LEFT JOIN `assignments` a ON s.`id` = a.`section_id`
            LEFT JOIN `submissions` sub ON (u.`id` = sub.`user_id` AND a.`id` = sub.`assignment_id`)
            WHERE u.`role_id` = 3
            GROUP BY u.`id`, c.`id`
            ORDER BY u.`full_name` ASC
        ");
        return $stmt->fetchAll();
    }
}
