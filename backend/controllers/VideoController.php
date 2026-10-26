<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Services\VideoProgressService;
use App\Utils\Database;
use App\Utils\Logger;
use App\Utils\Response;
use App\Utils\Validator;
use Exception;
use PDO;

class VideoController
{
    private VideoProgressService $videoService;
    private PDO $pdo;

    public function __construct()
    {
        $this->videoService = new VideoProgressService();
        $this->pdo = Database::getConnection();
    }

    public function authorizePlayback(int $id): void
    {
        $user = AuthMiddleware::authenticate();
        $session = AuthMiddleware::getCurrentSession();

        try {
            $grant = $this->videoService->authorizePlayback(
                (int)$user['id'],
                $id,
                $session['session_token']
            );

            // Enhance watermark with real user details
            $grant['watermark']['username'] = $user['username'];
            $grant['watermark']['full_name'] = $user['full_name'];
            $grant['watermark']['ip'] = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

            Response::success($grant, 'Playback authorized');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 403);
        }
    }

    public function stream(): void
    {
        $token = trim($_GET['token'] ?? '');
        if ($token === '') {
            http_response_code(403);
            echo "Access Denied: Playback token missing";
            exit;
        }

        $grant = $this->videoService->validatePlaybackToken($token);
        if (!$grant) {
            http_response_code(403);
            echo "Access Denied: Invalid, expired, or revoked playback grant";
            exit;
        }

        // Support external video URLs (e.g., https://.../video.mp4)
        if (preg_match('/^https?:\/\//i', $grant['file_path'])) {
            header("Location: " . $grant['file_path'], true, 302);
            exit;
        }

        $config = require dirname(__DIR__) . '/config/app.php';
        $filePath = $config['storage']['base'] . DIRECTORY_SEPARATOR . $grant['file_path'];

        // If specific test video does not exist, use frontend/public/video.mp4 or sample video generator
        if (!file_exists($filePath)) {
            $frontendVideo = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'video.mp4';
            if (file_exists($frontendVideo)) {
                $filePath = $frontendVideo;
            } else {
                $fallback = $config['storage']['videos'] . DIRECTORY_SEPARATOR . 'sample.mp4';
                if (file_exists($fallback)) {
                    $filePath = $fallback;
                } else {
                    http_response_code(404);
                    echo "Video media stream not available on server";
                    exit;
                }
            }
        }

        $fileSize = filesize($filePath);
        $mime = $grant['mime_type'] ?: 'video/mp4';

        // Clear output buffering
        while (ob_get_level()) {
            ob_end_clean();
        }

        // Support HTTP Range Requests (RFC 7233)
        $start = 0;
        $end = $fileSize - 1;

        if (isset($_SERVER['HTTP_RANGE'])) {
            $range = $_SERVER['HTTP_RANGE'];
            if (preg_match('/bytes=(\d+)-(\d*)/i', $range, $matches)) {
                $start = (int)$matches[1];
                if (!empty($matches[2])) {
                    $end = (int)$matches[2];
                }
            }

            if ($start > $end || $start >= $fileSize) {
                http_response_code(416);
                header("Content-Range: bytes */{$fileSize}");
                exit;
            }

            http_response_code(206);
            header("Content-Range: bytes {$start}-{$end}/{$fileSize}");
        } else {
            http_response_code(200);
        }

        $length = $end - $start + 1;

        header("Content-Type: {$mime}");
        header("Accept-Ranges: bytes");
        header("Content-Length: {$length}");
        header("Cache-Control: no-cache, no-store, must-revalidate");
        header("Pragma: no-cache");
        header("Expires: 0");
        // Deter direct download dialog
        header("Content-Disposition: inline; filename=\"stream.mp4\"");

        $fp = fopen($filePath, 'rb');
        fseek($fp, $start);

        $buffer = 1024 * 64; // 64KB chunks
        $bytesRemaining = $length;

        while (!feof($fp) && $bytesRemaining > 0 && connection_status() === CONNECTION_NORMAL) {
            $bytesToRead = min($buffer, $bytesRemaining);
            $data = fread($fp, $bytesToRead);
            echo $data;
            flush();
            $bytesRemaining -= strlen($data);
        }

        fclose($fp);
        exit;
    }

    public function recordProgress(int $id): void
    {
        $user = AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $start = (float)($input['segment_start'] ?? 0);
        $end = (float)($input['segment_end'] ?? 0);
        $position = (float)($input['current_position'] ?? $end);
        $totalDuration = !empty($input['total_duration']) ? (float)$input['total_duration'] : null;
        $isEnded = !empty($input['is_ended']);

        if ($end <= $start && !$isEnded) {
            Response::error('Invalid segment interval', 400);
        }

        try {
            $result = $this->videoService->recordProgress((int)$user['id'], $id, $start, $end, $position, $totalDuration, $isEnded);
            Response::success($result, 'Progress updated');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function upload(): void
    {
        $admin = RoleMiddleware::requireAdmin();

        $sectionId = (int)($_POST['section_id'] ?? 0);
        if (!$sectionId) {
            Response::error('Section ID is required', 400);
        }

        if (!isset($_FILES['video']) || $_FILES['video']['error'] !== UPLOAD_ERR_OK) {
            Response::error('No valid video file uploaded', 400);
        }

        $file = $_FILES['video'];
        $config = require dirname(__DIR__) . '/config/app.php';
        $validator = new Validator();
        $fileError = $validator->validateFile($file, ['mp4', 'webm', 'mov', 'mkv'], 500 * 1024 * 1024);

        if ($fileError !== null) {
            Response::error($fileError, 422);
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $safeName = 'video_sec_' . $sectionId . '_' . bin2hex(random_bytes(10)) . '.' . $ext;
        $targetPath = $config['storage']['videos'] . DIRECTORY_SEPARATOR . $safeName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            Response::error('Failed to save video on server', 500);
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $targetPath);
        finfo_close($finfo);

        $duration = (int)($_POST['duration_seconds'] ?? 180);

        // Upsert video asset in DB
        $stmt = $this->pdo->prepare("
            INSERT INTO `video_assets` (`section_id`, `file_path`, `original_filename`, `file_size`, `duration_seconds`, `mime_type`, `status`)
            VALUES (:sid, :path, :orig, :size, :dur, :mime, 'ready')
            ON DUPLICATE KEY UPDATE 
                `file_path` = :path2, 
                `original_filename` = :orig2, 
                `file_size` = :size2, 
                `duration_seconds` = :dur2,
                `mime_type` = :mime2
        ");
        $stmt->execute([
            ':sid' => $sectionId,
            ':path' => 'videos/' . $safeName,
            ':orig' => $file['name'],
            ':size' => $file['size'],
            ':dur' => $duration,
            ':mime' => $mime,
            ':path2' => 'videos/' . $safeName,
            ':orig2' => $file['name'],
            ':size2' => $file['size'],
            ':dur2' => $duration,
            ':mime2' => $mime,
        ]);

        Logger::audit((int)$admin['id'], 'VIDEO_UPLOADED', 'section', $sectionId, [
            'original_filename' => $file['name'],
            'size' => $file['size'],
        ]);

        Response::success(null, 'Video uploaded successfully');
    }
}
