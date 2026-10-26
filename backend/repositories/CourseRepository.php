<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Utils\Database;
use PDO;

class CourseRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function listCourses(bool $publishedOnly = false): array
    {
        $sql = "
            SELECT c.*, u.`full_name` as `instructor_name`,
                   (SELECT COUNT(*) FROM `modules` m WHERE m.`course_id` = c.`id`) as `modules_count`,
                   (SELECT COUNT(*) FROM `sections` s JOIN `modules` m ON s.`module_id` = m.`id` WHERE m.`course_id` = c.`id`) as `sections_count`,
                   (SELECT COUNT(*) FROM `course_enrollments` ce WHERE ce.`course_id` = c.`id`) as `enrolled_count`
            FROM `courses` c
            JOIN `users` u ON c.`created_by` = u.`id`
        ";
        if ($publishedOnly) {
            $sql .= " WHERE c.`is_published` = 1";
        }
        $sql .= " ORDER BY c.`id` ASC";

        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT c.*, u.`full_name` as `instructor_name`
            FROM `courses` c
            JOIN `users` u ON c.`created_by` = u.`id`
            WHERE c.`id` = :id
        ");
        $stmt->execute([':id' => $id]);
        $course = $stmt->fetch();
        return $course ?: null;
    }

    public function findBySlug(string $slug): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT c.*, u.`full_name` as `instructor_name`
            FROM `courses` c
            JOIN `users` u ON c.`created_by` = u.`id`
            WHERE c.`slug` = :slug
        ");
        $stmt->execute([':slug' => $slug]);
        $course = $stmt->fetch();
        return $course ?: null;
    }

    public function getCourseHierarchy(int $courseId, ?int $studentUserId = null): ?array
    {
        $course = $this->findById($courseId);
        if (!$course) {
            return null;
        }

        // Fetch modules
        $mStmt = $this->pdo->prepare("
            SELECT * FROM `modules`
            WHERE `course_id` = :course_id
            ORDER BY `order_index` ASC
        ");
        $mStmt->execute([':course_id' => $courseId]);
        $modules = $mStmt->fetchAll();

        foreach ($modules as &$mod) {
            $sStmt = $this->pdo->prepare("
                SELECT s.*, 
                       v.`id` as `video_id`, v.`file_path` as `video_file_path`, v.`duration_seconds`, v.`status` as `video_status`,
                       a.`id` as `assignment_id`, a.`title` as `assignment_title`, a.`instructions` as `assignment_instructions`, a.`submission_type`
                FROM `sections` s
                LEFT JOIN `video_assets` v ON v.`section_id` = s.`id`
                LEFT JOIN `assignments` a ON a.`section_id` = s.`id`
                WHERE s.`module_id` = :module_id
                ORDER BY s.`order_index` ASC
            ");
            $sStmt->execute([':module_id' => $mod['id']]);
            $sections = $sStmt->fetchAll();

            // If student context is provided, attach their specific access & progress status
            if ($studentUserId !== null) {
                foreach ($sections as &$sec) {
                    // Check unlock status
                    $uStmt = $this->pdo->prepare("
                        SELECT `status` FROM `section_unlocks` 
                        WHERE `user_id` = :user_id AND `section_id` = :sec_id
                    ");
                    $uStmt->execute([':user_id' => $studentUserId, ':sec_id' => $sec['id']]);
                    $unlock = $uStmt->fetch();
                    $isUnlocked = ($unlock && $unlock['status'] === 'UNLOCKED');

                    // If this is the first section of the FIRST enrolled course and not unlocked yet, auto-unlock it
                    if (!$isUnlocked && (int)$mod['order_index'] === 1 && (int)$sec['order_index'] === 1) {
                        $firstCourseId = (int)$this->pdo->query("SELECT id FROM `courses` WHERE `is_published` = 1 ORDER BY `id` ASC LIMIT 1")->fetchColumn();
                        if ($courseId === $firstCourseId && $this->isEnrolled($studentUserId, $courseId)) {
                            $initUnlock = $this->pdo->prepare("
                                INSERT INTO `section_unlocks` (`user_id`, `section_id`, `status`, `unlocked_by`)
                                VALUES (:uid, :sid, 'UNLOCKED', 'SYSTEM')
                                ON DUPLICATE KEY UPDATE `status` = 'UNLOCKED'
                            ");
                            $initUnlock->execute([':uid' => $studentUserId, ':sid' => $sec['id']]);
                            $isUnlocked = true;
                        }
                    }

                    // Check video progress
                    $vpStmt = $this->pdo->prepare("
                        SELECT `last_watched_position`, `watched_seconds`, `completion_percentage`, `status`, `completed_at`
                        FROM `video_progress`
                        WHERE `user_id` = :user_id AND `section_id` = :sec_id
                    ");
                    $vpStmt->execute([':user_id' => $studentUserId, ':sec_id' => $sec['id']]);
                    $progress = $vpStmt->fetch();

                    // Check submission status
                    $subStmt = $this->pdo->prepare("
                        SELECT s.`id`, s.`status`, s.`admin_feedback`, s.`submitted_at`, s.`reviewed_at`
                        FROM `submissions` s
                        WHERE s.`user_id` = :user_id AND s.`assignment_id` = :assignment_id
                        ORDER BY s.`id` DESC LIMIT 1
                    ");
                    $subStmt->execute([':user_id' => $studentUserId, ':assignment_id' => $sec['assignment_id'] ?? 0]);
                    $submission = $subStmt->fetch();

                    // Compute clean workflow status
                    $effectiveStatus = 'LOCKED';
                    if ($isUnlocked) {
                        if ($submission) {
                            if ($submission['status'] === 'REJECTED') {
                                $reviewedAt = !empty($submission['reviewed_at']) ? strtotime($submission['reviewed_at']) : 0;
                                $completedAt = (!empty($progress) && !empty($progress['completed_at'])) ? strtotime($progress['completed_at']) : 0;
                                if ($completedAt > $reviewedAt && $progress && $progress['status'] === 'VIDEO_COMPLETED') {
                                    $effectiveStatus = 'VIDEO_COMPLETED';
                                } else {
                                    $effectiveStatus = 'REJECTED';
                                }
                            } else {
                                $effectiveStatus = $submission['status']; // PENDING_REVIEW, APPROVED, REVISION_REQUIRED
                            }
                        } elseif ($progress && $progress['status'] === 'VIDEO_COMPLETED') {
                            $effectiveStatus = 'VIDEO_COMPLETED';
                        } elseif ($progress && $progress['watched_seconds'] > 0) {
                            $effectiveStatus = 'IN_PROGRESS';
                        } else {
                            $effectiveStatus = 'AVAILABLE';
                        }
                    }

                    $sec['is_unlocked'] = $isUnlocked;
                    $sec['workflow_status'] = $effectiveStatus;
                    $sec['progress'] = $progress ?: null;
                    $sec['submission'] = $submission ?: null;
                }
            }

            $mod['sections'] = $sections;
        }

        $course['modules'] = $modules;
        return $course;
    }

    public function createCourse(array $data): int
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `courses` (`title`, `slug`, `subtitle`, `description`, `thumbnail_url`, `price`, `level`, `is_published`, `created_by`)
            VALUES (:title, :slug, :subtitle, :description, :thumbnail_url, :price, :level, :is_published, :created_by)
        ");
        $stmt->execute([
            ':title' => $data['title'],
            ':slug' => $data['slug'],
            ':subtitle' => $data['subtitle'] ?? null,
            ':description' => $data['description'] ?? null,
            ':thumbnail_url' => $data['thumbnail_url'] ?? null,
            ':price' => $data['price'] ?? 0.00,
            ':level' => $data['level'] ?? 'all',
            ':is_published' => $data['is_published'] ?? 1,
            ':created_by' => $data['created_by'],
        ]);
        $courseId = (int)$this->pdo->lastInsertId();

        // Auto-provision Module 1, Section 1, Video Asset, and Task Assignment if specified
        $videoUrl = !empty($data['video_url']) ? trim($data['video_url']) : '';
        $taskInstructions = !empty($data['task_instructions']) ? trim($data['task_instructions']) : '';

        // Handle direct video file upload if provided by admin
        $uploadedFilePath = null;
        $originalFilename = 'lesson_video.mp4';
        $fileSize = 34816616;

        if (isset($_FILES['video_file']) && $_FILES['video_file']['error'] === UPLOAD_ERR_OK) {
            $tmp = $_FILES['video_file']['tmp_name'];
            $orig = basename($_FILES['video_file']['name']);
            $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION)) ?: 'mp4';
            $uniqueName = 'course_' . $courseId . '_sec1_' . time() . '.' . $ext;
            $config = require dirname(__DIR__) . '/config/app.php';
            $dest = $config['storage']['videos'] . DIRECTORY_SEPARATOR . $uniqueName;
            if (move_uploaded_file($tmp, $dest)) {
                $uploadedFilePath = 'videos/' . $uniqueName;
                $originalFilename = $orig;
                $fileSize = (int)filesize($dest);
            }
        }

        if (!empty($uploadedFilePath) || !empty($videoUrl) || !empty($taskInstructions) || !empty($data['description'])) {
            // 1. Create Module 1
            $mStmt = $this->pdo->prepare("
                INSERT INTO `modules` (`course_id`, `title`, `description`, `order_index`)
                VALUES (:cid, :title, :desc, 1)
            ");
            $mStmt->execute([
                ':cid' => $courseId,
                ':title' => 'Module 1: Practical Core & Implementation',
                ':desc' => 'Core foundational curriculum with video lesson and hands-on task.'
            ]);
            $moduleId = (int)$this->pdo->lastInsertId();

            // 2. Create Section 1
            $sStmt = $this->pdo->prepare("
                INSERT INTO `sections` (`module_id`, `title`, `description`, `order_index`, `is_free_preview`)
                VALUES (:mid, :title, :desc, 1, 0)
            ");
            $sStmt->execute([
                ':mid' => $moduleId,
                ':title' => $data['title'] . ' - Masterclass Lesson 1',
                ':desc' => $data['description'] ?? 'Step-by-step masterclass lesson.'
            ]);
            $sectionId = (int)$this->pdo->lastInsertId();

            // 3. Create Video Asset (Using the uploaded video if present!)
            $finalVideoPath = $uploadedFilePath ?: (!empty($videoUrl) ? $videoUrl : 'videos/academy_master_video.mp4');
            $vStmt = $this->pdo->prepare("
                INSERT INTO `video_assets` (`section_id`, `file_path`, `original_filename`, `file_size`, `duration_seconds`, `status`)
                VALUES (:sid, :path, :orig, :size, 240, 'ready')
            ");
            $vStmt->execute([
                ':sid' => $sectionId,
                ':path' => $finalVideoPath,
                ':orig' => $originalFilename,
                ':size' => $fileSize,
            ]);

            // 4. Create Task Assignment
            $taskTitle = !empty($data['task_title']) ? trim($data['task_title']) : ('Practical Task: ' . $data['title']);
            $finalTaskInst = !empty($taskInstructions) 
                ? $taskInstructions 
                : 'Watch the full video lesson sequentially. Complete all practical exercises discussed in the session and submit your deliverables (written campaign notes or file attachments) for instructor evaluation.';
            
            $aStmt = $this->pdo->prepare("
                INSERT INTO `assignments` (`section_id`, `title`, `description`, `instructions`, `submission_type`)
                VALUES (:sid, :title, :desc, :inst, 'both')
            ");
            $aStmt->execute([
                ':sid' => $sectionId,
                ':title' => $taskTitle,
                ':desc' => 'Mandatory practical task assigned by academy administrator.',
                ':inst' => $finalTaskInst
            ]);

            // 5. Automatically enroll all active students (e.g. ajith_developer) and unlock Section 1
            $students = $this->pdo->query("SELECT id FROM users WHERE role_id = 3 AND is_active = 1")->fetchAll(PDO::FETCH_COLUMN);
            foreach ($students as $stuId) {
                $this->pdo->prepare("
                    INSERT INTO course_enrollments (user_id, course_id, status)
                    VALUES (:uid, :cid, 'active')
                    ON DUPLICATE KEY UPDATE status = 'active'
                ")->execute([':uid' => $stuId, ':cid' => $courseId]);

                $this->pdo->prepare("
                    INSERT INTO section_unlocks (user_id, section_id, status, unlocked_by)
                    VALUES (:uid, :sid, 'UNLOCKED', 'SYSTEM')
                    ON DUPLICATE KEY UPDATE status = 'UNLOCKED'
                ")->execute([':uid' => $stuId, ':sid' => $sectionId]);

                $this->pdo->prepare("
                    INSERT INTO video_progress (user_id, section_id, last_watched_position, duration_seconds, watched_seconds, completion_percentage, status)
                    VALUES (:uid, :sid, 0.00, 240, 0, 0.00, 'AVAILABLE')
                    ON DUPLICATE KEY UPDATE status = 'AVAILABLE'
                ")->execute([':uid' => $stuId, ':sid' => $sectionId]);
            }
        }

        return $courseId;
    }

    public function isEnrolled(int $userId, int $courseId): bool
    {
        $stmt = $this->pdo->prepare("
            SELECT `id` FROM `course_enrollments` 
            WHERE `user_id` = :uid AND `course_id` = :cid AND `status` = 'active'
        ");
        $stmt->execute([':uid' => $userId, ':cid' => $courseId]);
        return (bool)$stmt->fetch();
    }

    public function enrollStudent(int $userId, int $courseId): bool
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `course_enrollments` (`user_id`, `course_id`, `status`)
            VALUES (:uid, :cid, 'active')
            ON DUPLICATE KEY UPDATE `status` = 'active'
        ");
        $enrolled = $stmt->execute([':uid' => $userId, ':cid' => $courseId]);

        // Unlock the very first section of this course for the student
        $firstSec = $this->getFirstSectionOfCourse($courseId);
        if ($firstSec) {
            $unlockStmt = $this->pdo->prepare("
                INSERT INTO `section_unlocks` (`user_id`, `section_id`, `status`, `unlocked_by`)
                VALUES (:uid, :sec_id, 'UNLOCKED', 'SYSTEM')
                ON DUPLICATE KEY UPDATE `status` = 'UNLOCKED'
            ");
            $unlockStmt->execute([':uid' => $userId, ':sec_id' => $firstSec['id']]);

            // Initialize progress entry
            $progStmt = $this->pdo->prepare("
                INSERT INTO `video_progress` (`user_id`, `section_id`, `duration_seconds`, `status`)
                VALUES (:uid, :sec_id, :dur, 'AVAILABLE')
                ON DUPLICATE KEY UPDATE `status` = IF(`status` = 'LOCKED', 'AVAILABLE', `status`)
            ");
            $progStmt->execute([':uid' => $userId, ':sec_id' => $firstSec['id'], ':dur' => $firstSec['duration_seconds'] ?? 0]);
        }

        return $enrolled;
    }

    public function getFirstSectionOfCourse(int $courseId): ?array
    {
        $stmt = $this->pdo->prepare("
            SELECT s.*, v.`duration_seconds`
            FROM `sections` s
            JOIN `modules` m ON s.`module_id` = m.`id`
            LEFT JOIN `video_assets` v ON v.`section_id` = s.`id`
            WHERE m.`course_id` = :cid
            ORDER BY m.`order_index` ASC, s.`order_index` ASC
            LIMIT 1
        ");
        $stmt->execute([':cid' => $courseId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getStudentCourses(int $userId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT c.*, ce.`enrolled_at`, ce.`status` as `enrollment_status`,
                   (SELECT COUNT(*) FROM `sections` s JOIN `modules` m ON s.`module_id` = m.`id` WHERE m.`course_id` = c.`id`) as `total_sections`,
                   (SELECT COUNT(*) FROM `submissions` sub 
                    JOIN `assignments` a ON sub.`assignment_id` = a.`id`
                    JOIN `sections` s ON a.`section_id` = s.`id`
                    JOIN `modules` m ON s.`module_id` = m.`id`
                    WHERE m.`course_id` = c.`id` AND sub.`user_id` = :uid1 AND sub.`status` = 'APPROVED') as `completed_sections`
            FROM `courses` c
            JOIN `course_enrollments` ce ON c.`id` = ce.`course_id`
            WHERE ce.`user_id` = :uid2 AND ce.`status` = 'active'
            ORDER BY c.`id` ASC
        ");
        $stmt->execute([':uid1' => $userId, ':uid2' => $userId]);
        $courses = $stmt->fetchAll();

        $firstCourseId = (int)$this->pdo->query("SELECT id FROM `courses` WHERE `is_published` = 1 ORDER BY `id` ASC LIMIT 1")->fetchColumn();

        foreach ($courses as &$c) {
            $total = (int)$c['total_sections'];
            $done = (int)$c['completed_sections'];
            $c['progress_percentage'] = $total > 0 ? round(($done / $total) * 100, 1) : 0.0;
            $hasAnyUnlockedSection = false;

            $sStmt = $this->pdo->prepare("
                SELECT s.id, s.title, s.order_index, v.duration_seconds,
                       a.id as assignment_id
                FROM `sections` s
                JOIN `modules` m ON s.`module_id` = m.`id`
                LEFT JOIN `video_assets` v ON v.`section_id` = s.`id`
                LEFT JOIN `assignments` a ON a.`section_id` = s.`id`
                WHERE m.`course_id` = :cid
                ORDER BY s.`order_index` ASC
            ");
            $sStmt->execute([':cid' => $c['id']]);
            $sections = $sStmt->fetchAll();

            foreach ($sections as &$sec) {
                $uStmt = $this->pdo->prepare("
                    SELECT `status` FROM `section_unlocks` 
                    WHERE `user_id` = :uid AND `section_id` = :sid
                ");
                $uStmt->execute([':uid' => $userId, ':sid' => $sec['id']]);
                $unlock = $uStmt->fetch();
                $isUnlocked = ($unlock && $unlock['status'] === 'UNLOCKED');

                if (!$isUnlocked && (int)$sec['order_index'] === 1 && (int)$c['id'] === $firstCourseId) {
                    $isUnlocked = true;
                }

                if ($isUnlocked) {
                    $hasAnyUnlockedSection = true;
                }

                $vpStmt = $this->pdo->prepare("
                    SELECT `completion_percentage`, `status`, `watched_seconds`
                    FROM `video_progress`
                    WHERE `user_id` = :uid AND `section_id` = :sid
                ");
                $vpStmt->execute([':uid' => $userId, ':sid' => $sec['id']]);
                $progress = $vpStmt->fetch();

                $subStmt = $this->pdo->prepare("
                    SELECT s.`id`, s.`status`
                    FROM `submissions` s
                    WHERE s.`user_id` = :uid AND s.`assignment_id` = :aid
                    ORDER BY s.`id` DESC LIMIT 1
                ");
                $subStmt->execute([':uid' => $userId, ':aid' => $sec['assignment_id'] ?? 0]);
                $sub = $subStmt->fetch();

                $status = 'LOCKED';
                if ($isUnlocked) {
                    if ($sub) {
                        $status = $sub['status']; // PENDING_REVIEW, APPROVED, REJECTED
                    } elseif ($progress && $progress['status'] === 'VIDEO_COMPLETED') {
                        $status = 'VIDEO_COMPLETED';
                    } elseif ($progress && $progress['watched_seconds'] > 0) {
                        $status = 'IN_PROGRESS';
                    } else {
                        $status = 'AVAILABLE';
                    }
                }

                $sec['is_unlocked'] = $isUnlocked;
                $sec['workflow_status'] = $status;
            }
            $c['sections'] = $sections;
            $c['is_course_unlocked'] = ((int)$c['id'] === $firstCourseId) || $hasAnyUnlockedSection;
        }

        return $courses;
    }

    public function updateCourse(int $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        if (isset($data['title'])) {
            $fields[] = "`title` = :title";
            $params[':title'] = trim((string)$data['title']);
        }
        if (isset($data['slug'])) {
            $fields[] = "`slug` = :slug";
            $params[':slug'] = trim((string)$data['slug']);
        }
        if (isset($data['subtitle'])) {
            $fields[] = "`subtitle` = :subtitle";
            $params[':subtitle'] = trim((string)$data['subtitle']);
        }
        if (isset($data['description'])) {
            $fields[] = "`description` = :desc";
            $params[':desc'] = trim((string)$data['description']);
        }
        if (isset($data['price'])) {
            $fields[] = "`price` = :price";
            $params[':price'] = (float)$data['price'];
        }
        if (isset($data['level'])) {
            $fields[] = "`level` = :level";
            $params[':level'] = (string)$data['level'];
        }
        if (isset($data['is_published'])) {
            $fields[] = "`is_published` = :pub";
            $params[':pub'] = (int)$data['is_published'];
        }

        $res = true;
        if (!empty($fields)) {
            $sql = "UPDATE `courses` SET " . implode(', ', $fields) . " WHERE `id` = :id";
            $stmt = $this->pdo->prepare($sql);
            $res = $stmt->execute($params);
        }

        // Handle video file upload for Section 1 if provided
        if (isset($_FILES['video_file']) && $_FILES['video_file']['error'] === UPLOAD_ERR_OK) {
            $sec = $this->getFirstSectionOfCourse($id);
            if ($sec) {
                $tmp = $_FILES['video_file']['tmp_name'];
                $orig = basename($_FILES['video_file']['name']);
                $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION)) ?: 'mp4';
                $uniqueName = 'course_' . $id . '_sec1_' . time() . '.' . $ext;
                $config = require dirname(__DIR__) . '/config/app.php';
                $dest = $config['storage']['videos'] . DIRECTORY_SEPARATOR . $uniqueName;
                if (move_uploaded_file($tmp, $dest)) {
                    $this->pdo->prepare("
                        UPDATE `video_assets`
                        SET `file_path` = :path,
                            `original_filename` = :orig,
                            `file_size` = :size
                        WHERE `section_id` = :sid
                    ")->execute([
                        ':path' => 'videos/' . $uniqueName,
                        ':orig' => $orig,
                        ':size' => (int)filesize($dest),
                        ':sid' => $sec['id']
                    ]);
                }
            }
        }

        // Handle task instructions update for Section 1 if provided
        if (!empty($data['task_instructions'])) {
            $sec = $this->getFirstSectionOfCourse($id);
            if ($sec) {
                $taskTitle = !empty($data['task_title']) ? trim((string)$data['task_title']) : '';
                $this->pdo->prepare("
                    UPDATE `assignments`
                    SET `instructions` = :inst,
                        `title` = IF(:tt != '', :tt, `title`)
                    WHERE `section_id` = :sid
                ")->execute([
                    ':inst' => trim((string)$data['task_instructions']),
                    ':tt' => $taskTitle,
                    ':sid' => $sec['id']
                ]);
            }
        }

        return $res;
    }

    public function deleteCourse(int $id): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM `courses` WHERE `id` = :id");
        return $stmt->execute([':id' => $id]);
    }
}
