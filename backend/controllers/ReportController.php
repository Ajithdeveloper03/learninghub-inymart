<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\RoleMiddleware;
use App\Repositories\AuditRepository;
use App\Utils\Response;

class ReportController
{
    private AuditRepository $auditRepo;

    public function __construct()
    {
        $this->auditRepo = new AuditRepository();
    }

    public function dashboard(): void
    {
        RoleMiddleware::requireAdmin();
        $stats = $this->auditRepo->getDashboardStats();
        Response::success($stats, 'Dashboard statistics retrieved');
    }

    public function auditLogs(): void
    {
        RoleMiddleware::requireAdmin();
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(200, max(1, (int)($_GET['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;

        $logs = $this->auditRepo->listAuditLogs($limit, $offset);
        Response::success($logs, 'Audit logs retrieved');
    }

    public function studentProgress(): void
    {
        RoleMiddleware::requireAdmin();
        $report = $this->auditRepo->getStudentProgressReport();
        Response::success($report, 'Student progress report retrieved');
    }

    public function exportCsv(): void
    {
        RoleMiddleware::requireAdmin();
        $type = $_GET['type'] ?? 'students';

        // Clear output buffering
        while (ob_get_level()) {
            ob_end_clean();
        }

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="report_' . $type . '_' . date('Ymd_His') . '.csv"');
        header('Pragma: no-cache');
        header('Expires: 0');

        $out = fopen('php://output', 'w');

        if ($type === 'students') {
            fputcsv($out, ['Student ID', 'Username', 'Full Name', 'Email', 'Course', 'Total Sections', 'Approved Sections', 'Pending Sections', 'Avg Video Completion %']);
            $rows = $this->auditRepo->getStudentProgressReport();
            foreach ($rows as $r) {
                fputcsv($out, [
                    $r['student_id'],
                    $r['username'],
                    $r['full_name'],
                    $r['email'],
                    $r['course_title'],
                    $r['total_course_sections'],
                    $r['approved_sections'],
                    $r['pending_sections'],
                    $r['avg_video_completion'] . '%',
                ]);
            }
        } else {
            fputcsv($out, ['Log ID', 'User ID', 'Username', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Timestamp']);
            $logs = $this->auditRepo->listAuditLogs(500, 0);
            foreach ($logs as $l) {
                fputcsv($out, [
                    $l['id'],
                    $l['user_id'],
                    $l['username'] ?? 'System',
                    $l['action'],
                    $l['entity_type'],
                    $l['entity_id'],
                    $l['ip_address'],
                    $l['created_at'],
                ]);
            }
        }

        fclose($out);
        exit;
    }
}
