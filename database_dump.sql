-- Inymart Academy Production Database Dump
-- Ready for phpMyAdmin / MySQL Import
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `approval_logs`;
CREATE TABLE `approval_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `reviewed_by` int(11) NOT NULL,
  `decision` enum('APPROVED','REVISION_REQUIRED','REJECTED') NOT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_approvals_submission` (`submission_id`),
  KEY `fk_approvals_reviewer` (`reviewed_by`),
  KEY `idx_approvals_user` (`user_id`),
  KEY `idx_approvals_section` (`section_id`),
  CONSTRAINT `fk_approvals_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_approvals_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_approvals_submission` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_approvals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `instructions` text NOT NULL,
  `submission_type` enum('text','file','both') DEFAULT 'both',
  `allowed_file_types` varchar(150) DEFAULT 'pdf,png,jpg,jpeg,zip,docx',
  `max_file_size_bytes` bigint(20) DEFAULT 20971520,
  `deadline_days` int(11) DEFAULT 7,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `section_id` (`section_id`),
  CONSTRAINT `fk_assignments_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `assignments` (`id`, `section_id`, `title`, `description`, `instructions`, `submission_type`, `allowed_file_types`, `max_file_size_bytes`, `deadline_days`, `created_at`, `updated_at`) VALUES ('1', '1', 'Task 1: Digital Marketing Ecosystem Analysis', 'Map out an end-to-end digital marketing funnel for a chosen e-commerce or B2B brand.', '1. Select a real business or product brand.\n2. Detail their Top of Funnel (Awareness), Middle of Funnel (Consideration), and Bottom of Funnel (Conversion) channels.\n3. Submit a written breakdown (minimum 250 words) along with a diagram/PDF if available.', 'both', 'pdf,png,jpg,jpeg,zip,docx', '20971520', '7', '2026-10-24 09:47:37', '2026-10-24 09:47:37');
INSERT INTO `assignments` (`id`, `section_id`, `title`, `description`, `instructions`, `submission_type`, `allowed_file_types`, `max_file_size_bytes`, `deadline_days`, `created_at`, `updated_at`) VALUES ('11', '11', 'Practical Task: development', 'Mandatory practical task assigned by academy administrator.', 'no', 'both', 'pdf,png,jpg,jpeg,zip,docx', '20971520', '7', '2026-10-26 11:38:58', '2026-10-26 11:38:58');

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(80) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `details_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details_json`)),
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('1', '1', 'SYSTEM_SEEDED', 'system', '1', '127.0.0.1', NULL, '{\"message\": \"Initial Digital Marketing Academy LMS schema and seed data loaded successfully\"}', '2026-10-24 09:47:37');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('5', NULL, 'LOGIN_FAILED_UNKNOWN_USER', 'user', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"username\":\"ajith_developer\"}', '2026-10-24 09:51:30');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('6', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"ip\":\"127.0.0.1\",\"device\":\"Browser on Desktop\"}', '2026-10-24 09:57:23');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('13', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:34:01');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('14', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:34:01');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('15', '5', 'LOGOUT', 'device_session', '7', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-24 10:34:18');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('16', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:34:25');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('17', '1', 'LOGOUT', 'device_session', '8', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-24 10:36:13');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('18', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:36:19');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('19', '5', 'VIDEO_COMPLETED', 'section', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"coverage_percentage\":100,\"unique_seconds\":38}', '2026-10-24 10:39:10');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('20', '5', 'ASSIGNMENT_SUBMITTED', 'submission', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"assignment_id\":1,\"section_id\":1}', '2026-10-24 10:39:35');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('21', '5', 'LOGOUT', 'device_session', '9', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-24 10:39:56');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('22', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:40:04');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('23', '1', 'SUBMISSION_APPROVED', 'submission', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"feedback\":\"\",\"next_section_id\":2}', '2026-10-24 10:40:41');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('24', '1', 'LOGOUT', 'device_session', '10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-24 10:40:56');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('25', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:41:01');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('26', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"revoked_count\":1,\"new_session_device\":\"Browser on Desktop\"}', '2026-10-24 10:47:08');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('27', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"ip\":\"127.0.0.1\",\"device\":\"Browser on Desktop\"}', '2026-10-24 10:47:08');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('28', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"revoked_count\":1,\"new_session_device\":\"Browser on Desktop\"}', '2026-10-24 10:47:19');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('29', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"ip\":\"127.0.0.1\",\"device\":\"Browser on Desktop\"}', '2026-10-24 10:47:19');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('30', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"revoked_count\":1,\"new_session_device\":\"Browser on Desktop\"}', '2026-10-24 10:47:28');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('31', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"ip\":\"127.0.0.1\",\"device\":\"Browser on Desktop\"}', '2026-10-24 10:47:28');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('32', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"revoked_count\":1,\"new_session_device\":\"Browser on Desktop\"}', '2026-10-24 10:47:37');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('33', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"ip\":\"127.0.0.1\",\"device\":\"Browser on Desktop\"}', '2026-10-24 10:47:37');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('34', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"revoked_count\":1,\"new_session_device\":\"Browser on Desktop\"}', '2026-10-24 10:47:47');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('35', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"ip\":\"127.0.0.1\",\"device\":\"Browser on Desktop\"}', '2026-10-24 10:47:47');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('36', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"revoked_count\":1,\"new_session_device\":\"Browser on Desktop\"}', '2026-10-24 10:48:12');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('37', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"ip\":\"127.0.0.1\",\"device\":\"Browser on Desktop\"}', '2026-10-24 10:48:12');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('38', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"revoked_count\":1,\"new_session_device\":\"Browser on Desktop\"}', '2026-10-24 10:48:22');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('39', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', '{\"ip\":\"127.0.0.1\",\"device\":\"Browser on Desktop\"}', '2026-10-24 10:48:22');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('40', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:51:07');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('41', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:51:07');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('42', '5', 'VIDEO_COMPLETED', 'section', '2', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"coverage_percentage\":100,\"unique_seconds\":35}', '2026-10-24 10:51:39');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('43', '5', 'ASSIGNMENT_SUBMITTED', 'submission', '2', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"assignment_id\":2,\"section_id\":2}', '2026-10-24 10:52:10');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('44', '5', 'ASSIGNMENT_SUBMITTED', 'submission', '2', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"assignment_id\":2,\"section_id\":2}', '2026-10-24 10:52:18');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('45', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:52:34');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('46', '1', 'SUBMISSION_REJECTED', 'submission', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"feedback\":\"\"}', '2026-10-24 10:54:07');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('47', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:54:51');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('48', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 10:54:51');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('49', NULL, 'LOGIN_FAILED_UNKNOWN_USER', 'user', NULL, '127.0.0.1', '', '{\"username\":\"student_alex\"}', '2026-10-24 11:25:42');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('50', '5', 'VIDEO_COMPLETED', 'section', '6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"coverage_percentage\":100,\"unique_seconds\":36}', '2026-10-24 11:31:21');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('51', '5', 'ASSIGNMENT_SUBMITTED', 'submission', '3', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"assignment_id\":6,\"section_id\":6}', '2026-10-24 11:31:48');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('52', '5', 'LOGOUT', 'device_session', '21', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-24 11:31:58');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('53', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 11:32:07');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('54', '1', 'SUBMISSION_APPROVED', 'submission', '3', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"feedback\":\"good\",\"next_section_id\":7}', '2026-10-24 11:32:51');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('55', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 11:34:34');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('56', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 11:41:13');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('57', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 11:52:25');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('58', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 11:52:25');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('59', '5', 'VIDEO_COMPLETED', 'section', '2', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"coverage_percentage\":100,\"unique_seconds\":35}', '2026-10-24 11:53:14');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('60', '5', 'ASSIGNMENT_SUBMITTED', 'submission', '4', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"assignment_id\":2,\"section_id\":2}', '2026-10-24 12:07:33');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('61', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 12:07:59');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('62', '1', 'SUBMISSION_REJECTED', 'submission', '4', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"feedback\":\"\"}', '2026-10-24 12:08:34');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('63', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 12:08:49');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('64', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 12:08:49');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('65', '5', 'VIDEO_COMPLETED', 'section', '2', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"coverage_percentage\":100,\"unique_seconds\":35}', '2026-10-24 12:09:42');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('66', '5', 'ASSIGNMENT_SUBMITTED', 'submission', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"assignment_id\":2,\"section_id\":2}', '2026-10-24 12:13:44');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('67', '5', 'LOGOUT', 'device_session', '27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-24 12:14:10');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('68', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 12:14:18');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('69', '1', 'SUBMISSION_APPROVED', 'submission', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"feedback\":\"\",\"next_section_id\":3}', '2026-10-24 12:14:37');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('70', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 12:36:11');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('71', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-24 12:38:38');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('72', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"Local Chrome\"}', '2026-10-26 11:03:38');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('73', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"Local Chrome\"}', '2026-10-26 11:03:46');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('74', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"Local Chrome\"}', '2026-10-26 11:03:46');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('75', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"Local Chrome\"}', '2026-10-26 11:03:54');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('76', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"Local Chrome\"}', '2026-10-26 11:03:54');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('77', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"Local Chrome\"}', '2026-10-26 11:04:01');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('78', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"Local Chrome\"}', '2026-10-26 11:04:01');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('79', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"Local Chrome\"}', '2026-10-26 11:04:12');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('80', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"Local Chrome\"}', '2026-10-26 11:04:12');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('81', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"Local Chrome\"}', '2026-10-26 11:04:19');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('82', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"Local Chrome\"}', '2026-10-26 11:04:19');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('83', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:05:21');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('84', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:05:21');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('85', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"Local Chrome\"}', '2026-10-26 11:15:59');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('86', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"Local Chrome\"}', '2026-10-26 11:15:59');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('87', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:17:06');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('88', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:17:06');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('89', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"Local Chrome\"}', '2026-10-26 11:17:21');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('90', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"Local Chrome\"}', '2026-10-26 11:17:21');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('91', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"Local Chrome\"}', '2026-10-26 11:17:39');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('92', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"Local Chrome\"}', '2026-10-26 11:17:39');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('93', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"Local Chrome\"}', '2026-10-26 11:17:50');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('94', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"Local Chrome\"}', '2026-10-26 11:17:50');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('95', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:19:14');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('96', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:19:14');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('97', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"test\"}', '2026-10-26 11:27:47');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('98', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"test\"}', '2026-10-26 11:27:47');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('99', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:28:13');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('100', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:28:13');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('101', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'node', '{\"revoked_count\":1,\"new_session_device\":\"test\"}', '2026-10-26 11:33:25');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('102', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'node', '{\"ip\":\"127.0.0.1\",\"device\":\"test\"}', '2026-10-26 11:33:25');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('103', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:37:09');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('104', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:37:09');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('105', '5', 'LOGOUT', 'device_session', '47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-26 11:37:57');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('106', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:38:06');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('107', '1', 'COURSE_CREATED', 'course', '3', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"title\":\"development\"}', '2026-10-26 11:38:58');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('108', '1', 'LOGOUT', 'device_session', '48', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-26 11:39:04');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('109', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:39:12');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('110', '5', 'LOGOUT', 'device_session', '49', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-26 11:55:19');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('111', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 11:55:28');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('112', '1', 'COURSE_DELETED', 'course', '2', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"title\":\"Advanced Search Engine Optimization (SEO)\"}', '2026-10-26 11:57:35');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('113', '1', 'COURSE_UPDATED', 'course', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"title\":\"Digital Marketing Masterclass 2026\"}', '2026-10-26 11:59:04');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('114', '1', 'COURSE_UPDATED', 'course', '3', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"title\":\"development\"}', '2026-10-26 11:59:14');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('115', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 12:00:09');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('116', '1', 'STUDENT_CREATED', 'user', '6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"username\":\"saravanan_2003\",\"assigned_courses\":[1],\"credentials_emailed_to\":\"saravanan.palaniswamybca@gmail.com\"}', '2026-10-26 12:08:03');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('117', '1', 'STUDENT_PASSWORD_RESET', 'user', '6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-26 12:09:34');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('118', '1', 'STUDENT_STATUS_TOGGLED', 'user', '6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"new_status\":0}', '2026-10-26 12:09:41');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('119', '1', 'STUDENT_STATUS_TOGGLED', 'user', '6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"new_status\":1}', '2026-10-26 12:09:44');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('120', '1', 'LOGIN_SUCCESS', 'user', '1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 12:11:03');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('121', '1', 'STUDENT_STATUS_TOGGLED', 'user', '6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"new_status\":0}', '2026-10-26 12:21:38');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('122', '1', 'LOGOUT', 'device_session', '50', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-26 12:21:41');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('123', '6', 'LOGIN_BLOCKED_SUSPENDED', 'user', '6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', NULL, '2026-10-26 12:22:13');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('124', '5', 'PREVIOUS_SESSIONS_REVOKED', 'device_session', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"revoked_count\":1,\"new_session_device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 12:22:27');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `details_json`, `created_at`) VALUES ('125', '5', 'LOGIN_SUCCESS', 'user', '5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', '{\"ip\":\"127.0.0.1\",\"device\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWeb\"}', '2026-10-26 12:22:27');

DROP TABLE IF EXISTS `course_enrollments`;
CREATE TABLE `course_enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `status` enum('active','completed','suspended') DEFAULT 'active',
  `enrolled_at` datetime DEFAULT current_timestamp(),
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course` (`user_id`,`course_id`),
  KEY `fk_enrollments_course` (`course_id`),
  KEY `idx_enrollment_status` (`status`),
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `course_enrollments` (`id`, `user_id`, `course_id`, `status`, `enrolled_at`, `completed_at`) VALUES ('7', '5', '1', 'active', '2026-10-26 11:15:31', NULL);
INSERT INTO `course_enrollments` (`id`, `user_id`, `course_id`, `status`, `enrolled_at`, `completed_at`) VALUES ('8', '5', '3', 'active', '2026-10-26 11:38:58', NULL);
INSERT INTO `course_enrollments` (`id`, `user_id`, `course_id`, `status`, `enrolled_at`, `completed_at`) VALUES ('9', '6', '1', 'active', '2026-10-26 12:07:57', NULL);

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `level` enum('beginner','intermediate','advanced','all') DEFAULT 'all',
  `is_published` tinyint(1) DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_courses_created_by` (`created_by`),
  KEY `idx_courses_published` (`is_published`),
  CONSTRAINT `fk_courses_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `courses` (`id`, `title`, `slug`, `subtitle`, `description`, `thumbnail_url`, `price`, `level`, `is_published`, `created_by`, `created_at`, `updated_at`) VALUES ('1', 'Digital Marketing Masterclass 2026', 'digital-marketing-masterclass-2026', 'From Fundamentals to High-ROI Growth Marketing Strategies', 'Master performance marketing, SEO, Google Ads, Meta Ads, funnel architecture, and analytics with real client campaign workflows. Designed by senior growth marketers for aspiring academy professionals.', '/images/course-dm-mastery.jpg', '499.00', 'all', '1', '1', '2026-10-24 09:47:37', '2026-10-24 09:47:37');
INSERT INTO `courses` (`id`, `title`, `slug`, `subtitle`, `description`, `thumbnail_url`, `price`, `level`, `is_published`, `created_by`, `created_at`, `updated_at`) VALUES ('3', 'development', 'development', '', 'java,php', NULL, '499.00', 'all', '1', '1', '2026-10-26 11:38:58', '2026-10-26 11:38:58');

DROP TABLE IF EXISTS `device_sessions`;
CREATE TABLE `device_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(128) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text NOT NULL,
  `device_name` varchar(150) DEFAULT NULL,
  `is_revoked` tinyint(1) DEFAULT 0,
  `revoked_at` datetime DEFAULT NULL,
  `last_activity_at` datetime DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `idx_session_token` (`session_token`),
  KEY `idx_device_user_revoked` (`user_id`,`is_revoked`),
  CONSTRAINT `fk_device_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('3', '5', '1ebb7f231b442d7f939089d7f9005b6b50e246d32c22831eb3df9a23f1acaed6', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', 'Browser on Desktop', '1', '2026-10-24 10:34:01', '2026-10-24 09:57:23', '2026-10-31 04:27:23', '2026-10-24 09:57:23');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('7', '5', '1104d795cdc4da677f4cc80e158cde0e9cfced90421ec547ea62104981206dae', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-24 10:34:18', '2026-10-24 10:34:18', '2026-10-31 05:04:01', '2026-10-24 10:34:01');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('8', '1', '7c6e38777052321a6325bd5e17895a984b841add09c0c477b575bb798431d37c', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-24 10:36:13', '2026-10-24 10:36:13', '2026-10-31 05:04:25', '2026-10-24 10:34:25');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('9', '5', '8a6f472512c47b39e5cc09e1a77e855275def9ba11765ca9b6c34a20b57cae04', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-24 10:39:56', '2026-10-24 10:39:56', '2026-10-31 05:06:19', '2026-10-24 10:36:19');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('10', '1', 'e9c950f5aa617eaf91eb4f8f47d24d33900cc087d8f90dbc0c0b2804fac38fa9', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-24 10:40:56', '2026-10-24 10:40:56', '2026-10-31 05:10:04', '2026-10-24 10:40:04');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('11', '5', '17784db6977540fa779bed68b74dbf15ea8fd1b3a678edeec8592ae878e31f5e', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-24 10:47:08', '2026-10-24 10:44:50', '2026-10-31 05:11:01', '2026-10-24 10:41:01');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('12', '5', 'b0ac5eae11391dc73461990d7611f7540d01d7d75287ecdfe59cab3f533a3d69', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', 'Browser on Desktop', '1', '2026-10-24 10:47:19', '2026-10-24 10:47:08', '2026-10-31 05:17:08', '2026-10-24 10:47:08');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('13', '5', 'da60f4b7ede4fc7e9eecfee95acf10a50cb190fa270f145530d5fe3f24a763d6', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', 'Browser on Desktop', '1', '2026-10-24 10:47:28', '2026-10-24 10:47:19', '2026-10-31 05:17:19', '2026-10-24 10:47:19');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('14', '5', 'bce35df4ff59d9f6eab5c5dc9b4e3fb2dfbd42b4f01af6698369c763d96d4fb5', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', 'Browser on Desktop', '1', '2026-10-24 10:47:37', '2026-10-24 10:47:29', '2026-10-31 05:17:28', '2026-10-24 10:47:28');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('15', '5', 'e9b9bc49b28ab98d16fd27fe69a44154bbef4677fd3f43bf0ac2689fc3c35fd1', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', 'Browser on Desktop', '1', '2026-10-24 10:47:47', '2026-10-24 10:47:37', '2026-10-31 05:17:37', '2026-10-24 10:47:37');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('16', '5', 'c3df1eead1df82050a36f9d0ba4f801aae4a07014109823a5cf1ccdffe1bb4be', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', 'Browser on Desktop', '1', '2026-10-24 10:48:12', '2026-10-24 10:47:47', '2026-10-31 05:17:47', '2026-10-24 10:47:47');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('17', '5', 'efc6e5698a97688bcec3ca24794b1d8f4b49b9c4d2af25c5cf519b06e9c25322', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', 'Browser on Desktop', '1', '2026-10-24 10:48:22', '2026-10-24 10:48:12', '2026-10-31 05:18:12', '2026-10-24 10:48:12');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('18', '5', '1833fa838a16e72ddc8a5724e283e9d1269444c240a93e7f9c000176121bbddf', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', 'Browser on Desktop', '1', '2026-10-24 10:51:07', '2026-10-24 10:48:22', '2026-10-31 05:18:22', '2026-10-24 10:48:22');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('19', '5', '3dc141cf58c256c0f012901bf15759adbe410289ca0a88de30f91c4c4156c128', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-24 10:54:51', '2026-10-24 10:52:26', '2026-10-31 05:21:07', '2026-10-24 10:51:07');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('20', '1', 'a67da5165e20eb320b9e6439395768ac498ef867293cfa4d69eeb8b32d3830d1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '0', NULL, '2026-10-24 10:54:46', '2026-10-31 05:22:34', '2026-10-24 10:52:34');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('21', '5', '9aee10f21023db676ab942d30d9d0fca20ed4ec9311944c4c885feaae22f394d', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-24 11:31:58', '2026-10-24 11:31:58', '2026-10-31 05:24:51', '2026-10-24 10:54:51');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('22', '1', '70e1a4073bb0e831f10eea9d933d4174a1d192287597551a39d031d1d0edf574', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '0', NULL, '2026-10-24 11:34:28', '2026-10-31 06:02:07', '2026-10-24 11:32:07');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('23', '5', 'd82645fcb4918cb09af8969d07fe278cb0857b1a0f3710de10866130772a25eb', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-24 11:52:25', '2026-10-24 11:41:04', '2026-10-31 06:04:34', '2026-10-24 11:34:34');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('24', '1', 'd50a0eca14855fb52dd95eace9a7a95070e75c38292f5082b656eda521d3ea3b', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '0', NULL, '2026-10-24 11:52:19', '2026-10-31 06:11:13', '2026-10-24 11:41:13');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('25', '5', 'a2d3949c59c7021d6b52ab2d2277af021a6bc132b60e57ee21838ef48894181e', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-24 12:08:49', '2026-10-24 12:07:42', '2026-10-31 06:22:25', '2026-10-24 11:52:25');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('26', '1', '017303fe41e94107495ba16e570c67112eb9a5e867b61590b0bbc5396162697f', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '0', NULL, '2026-10-24 12:08:38', '2026-10-31 06:37:59', '2026-10-24 12:07:59');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('27', '5', 'b3ea59707bfffc8d78ddfef2c9dbdce7fd7d79bd7174e260ce288c25c9612345', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-24 12:14:10', '2026-10-24 12:14:10', '2026-10-31 06:38:49', '2026-10-24 12:08:49');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('28', '1', 'bc9d26b5f8a2e3667b8f7fb69dc7db28feae09773d7d0c897f20f14fe8e21de2', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '0', NULL, '2026-10-24 12:15:30', '2026-10-31 06:44:18', '2026-10-24 12:14:18');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('29', '5', '5d2c4e243f71b53a0d9f81981c6b2a762704042769a72aa7de4db731aa4ca84e', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-26 11:03:46', '2026-10-24 12:38:35', '2026-10-31 07:06:11', '2026-10-24 12:36:11');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('30', '1', '8252c0da82734eb1513bdc8906cd76154903e1c0b5ccd2bd9a4b704c84459bd8', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '0', NULL, '2026-10-26 11:59:50', '2026-10-31 07:08:38', '2026-10-24 12:38:38');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('31', '1', '06f52ac3880867231e51dca4811b0572eba64331466b5ae61bb41c4ec29c4c7c', '127.0.0.1', 'node', 'Local Chrome', '0', NULL, '2026-10-26 11:03:38', '2026-11-02 05:33:38', '2026-10-26 11:03:38');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('32', '5', '9ebc3f94ac75c9f3dd274dbfa0143b951516df21b4ac6a354c8354a4c8f4a4f2', '127.0.0.1', 'node', 'Local Chrome', '1', '2026-10-26 11:03:54', '2026-10-26 11:03:46', '2026-11-02 05:33:46', '2026-10-26 11:03:46');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('33', '5', 'ff9f99a86d8dd9e0da778a70504b3ca96549287516f22aa3691f92655e086a1c', '127.0.0.1', 'node', 'Local Chrome', '1', '2026-10-26 11:04:01', '2026-10-26 11:03:54', '2026-11-02 05:33:54', '2026-10-26 11:03:54');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('34', '5', '2062b93c774cf7cda80a413df44c324660947c94cc127975502fad09f973b57b', '127.0.0.1', 'node', 'Local Chrome', '1', '2026-10-26 11:04:12', '2026-10-26 11:04:01', '2026-11-02 05:34:01', '2026-10-26 11:04:01');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('35', '5', '4ccee2c4a8bf137c85bb3d3eae42419bac56f59355e8f40205ce31916a044036', '127.0.0.1', 'node', 'Local Chrome', '1', '2026-10-26 11:04:19', '2026-10-26 11:04:12', '2026-11-02 05:34:12', '2026-10-26 11:04:12');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('36', '5', '078e4db1e8188f8feb4652d902762c6f37132dc7c89520277e5b4f68c1c3494c', '127.0.0.1', 'node', 'Local Chrome', '1', '2026-10-26 11:05:21', '2026-10-26 11:04:19', '2026-11-02 05:34:19', '2026-10-26 11:04:19');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('37', '5', 'bdb9344dc6949d532eb00ef2ff013a07a9d1f84abd7ad5516575e560ce70b68b', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-26 11:15:59', '2026-10-26 11:15:27', '2026-11-02 05:35:21', '2026-10-26 11:05:21');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('38', '5', 'af9c33a3bdc042c69a2f741118bb468ba4de2ff92e3e382e8525a3319fec10ec', '127.0.0.1', 'node', 'Local Chrome', '1', '2026-10-26 11:17:06', '2026-10-26 11:15:59', '2026-11-02 05:45:59', '2026-10-26 11:15:59');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('39', '5', '8bf0f450cfcdf8e5fda45f75d7a8d891eff39f6b7479ee4fc3b24eaf5960944b', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-26 11:17:21', '2026-10-26 11:17:09', '2026-11-02 05:47:06', '2026-10-26 11:17:06');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('40', '5', 'f87b58273816d50e9ca9b9a86efcfa6096df5acf6c6426a28ecc898bb6ab47f3', '127.0.0.1', 'node', 'Local Chrome', '1', '2026-10-26 11:17:39', '2026-10-26 11:17:21', '2026-11-02 05:47:21', '2026-10-26 11:17:21');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('41', '5', '34faf9a5f36fff10af782a74f8e03565dca040dfa6cb3b556fe145da2f986c10', '127.0.0.1', 'node', 'Local Chrome', '1', '2026-10-26 11:17:50', '2026-10-26 11:17:39', '2026-11-02 05:47:39', '2026-10-26 11:17:39');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('42', '5', 'edf58684be9342441cf8f85d3edfa2f55addb9de7bf05a0c0c5e08f96b2f8014', '127.0.0.1', 'node', 'Local Chrome', '1', '2026-10-26 11:19:14', '2026-10-26 11:17:50', '2026-11-02 05:47:50', '2026-10-26 11:17:50');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('43', '5', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-26 11:27:47', '2026-10-26 11:27:34', '2026-11-02 05:49:14', '2026-10-26 11:19:14');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('44', '5', '815e3cb1603734ba9957dcd26f5337a6ce6b75d3e4b036c4e05aa68a04f946dd', '127.0.0.1', 'node', 'test', '1', '2026-10-26 11:28:13', '2026-10-26 11:27:47', '2026-11-02 05:57:47', '2026-10-26 11:27:47');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('45', '5', '7e95e95f7443fd14dff9c70a6cedd96a9b8a37246672d54d66b32e151d99c37d', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-26 11:33:25', '2026-10-26 11:30:27', '2026-11-02 05:58:13', '2026-10-26 11:28:13');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('46', '5', '1c15a82a73f58ab965d119943932a69e73afc53d8a173c8b754599c2187c4fb6', '127.0.0.1', 'node', 'test', '1', '2026-10-26 11:37:09', '2026-10-26 11:33:25', '2026-11-02 06:03:25', '2026-10-26 11:33:25');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('47', '5', 'eee018cf1152ec48b56d71025dfcdfaa49c2137e868c1d456e958d5f6ea9f4ce', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-26 11:37:57', '2026-10-26 11:37:57', '2026-11-02 06:07:09', '2026-10-26 11:37:09');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('48', '1', 'f131e2be2f9ff5d1c541841a877b57664b70eab146e6bb80fe4f5beee21a707c', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-26 11:39:04', '2026-10-26 11:39:04', '2026-11-02 06:08:06', '2026-10-26 11:38:06');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('49', '5', '2a37522792c05a9ceae9d76140b065c0ad3af3ba8bd1172b78d81ae51033d4e6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-26 11:55:19', '2026-10-26 11:55:19', '2026-11-02 06:09:12', '2026-10-26 11:39:12');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('50', '1', '518de929a51b45faff1b330c2936cd66191d721d8f93e27f9c671c5b6cb80423', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-26 12:21:41', '2026-10-26 12:21:41', '2026-11-02 06:25:28', '2026-10-26 11:55:28');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('51', '5', 'd7399a813f58430bd94e490e3a82e4c26e4b365161e083e1b759f85075ed727e', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '1', '2026-10-26 12:22:27', '2026-10-26 12:10:36', '2026-11-02 06:30:09', '2026-10-26 12:00:09');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('52', '1', '95ba3e55f3960c3dcefbcc971f7c87482e38c6a99705fb58acc01712bccd193f', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '0', NULL, '2026-10-26 12:12:15', '2026-11-02 06:41:03', '2026-10-26 12:11:03');
INSERT INTO `device_sessions` (`id`, `user_id`, `session_token`, `ip_address`, `user_agent`, `device_name`, `is_revoked`, `revoked_at`, `last_activity_at`, `expires_at`, `created_at`) VALUES ('53', '5', '3058c3565d89ddb1b3172c1cf96c9023b901c0b379f5b45a8766326d01785e84', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWeb', '0', NULL, '2026-10-26 12:22:27', '2026-11-02 06:52:27', '2026-10-26 12:22:27');

DROP TABLE IF EXISTS `modules`;
CREATE TABLE `modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_modules_course_order` (`course_id`,`order_index`),
  CONSTRAINT `fk_modules_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `modules` (`id`, `course_id`, `title`, `description`, `order_index`, `created_at`, `updated_at`) VALUES ('1', '1', 'Course Curriculum: Practical Core & Implementation', 'Complete sequential masterclass curriculum with hands-on tasks and instructor validation.', '1', '2026-10-24 09:47:37', '2026-10-26 11:25:37');
INSERT INTO `modules` (`id`, `course_id`, `title`, `description`, `order_index`, `created_at`, `updated_at`) VALUES ('7', '3', 'Module 1: Practical Core & Implementation', 'Core foundational curriculum with video lesson and hands-on task.', '1', '2026-10-26 11:38:58', '2026-10-26 11:38:58');

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('ASSIGNMENT_SUBMITTED','ASSIGNMENT_APPROVED','REVISION_REQUESTED','SYSTEM_ALERT','SECURITY','COURSE_ENROLLED') NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `data_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data_json`)),
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notif_user_read` (`user_id`,`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('1', '1', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 1: Digital Marketing Ecosystem Analysis.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":1,\"student_id\":5,\"assignment_id\":1}', '2026-10-24 10:39:35');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('2', '2', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 1: Digital Marketing Ecosystem Analysis.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":1,\"student_id\":5,\"assignment_id\":1}', '2026-10-24 10:39:35');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('3', '5', 'Assignment Approved!', 'Your submission for \"Task 1: Digital Marketing Ecosystem Analysis\" in \"Section 1: Introduction to Digital Marketing Ecosystem\" was reviewed: APPROVED.', 'ASSIGNMENT_APPROVED', '1', '{\"submission_id\":1,\"section_id\":1,\"decision\":\"APPROVED\",\"next_section_id\":2}', '2026-10-24 10:40:41');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('4', '1', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 2: Detailed Buyer Persona & Journey Canvas.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":2,\"student_id\":5,\"assignment_id\":2}', '2026-10-24 10:52:10');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('5', '2', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 2: Detailed Buyer Persona & Journey Canvas.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":2,\"student_id\":5,\"assignment_id\":2}', '2026-10-24 10:52:10');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('6', '1', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 2: Detailed Buyer Persona & Journey Canvas.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":2,\"student_id\":5,\"assignment_id\":2}', '2026-10-24 10:52:18');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('7', '2', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 2: Detailed Buyer Persona & Journey Canvas.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":2,\"student_id\":5,\"assignment_id\":2}', '2026-10-24 10:52:18');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('8', '5', 'Assignment Submission Update', 'Your submission for \"Task 2: Detailed Buyer Persona & Journey Canvas\" in \"Section 2: Customer Personas and Journey Mapping\" was reviewed: REJECTED.', 'SYSTEM_ALERT', '1', '{\"submission_id\":2,\"section_id\":2,\"decision\":\"REJECTED\",\"next_section_id\":null}', '2026-10-24 10:54:07');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('9', '1', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 1: Comprehensive Technical SEO Audit & Robots Setup.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":3,\"student_id\":5,\"assignment_id\":6}', '2026-10-24 11:31:48');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('10', '2', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 1: Comprehensive Technical SEO Audit & Robots Setup.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":3,\"student_id\":5,\"assignment_id\":6}', '2026-10-24 11:31:48');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('11', '5', 'Assignment Approved!', 'Your submission for \"Task 1: Comprehensive Technical SEO Audit & Robots Setup\" in \"Section 1: Technical Site Architecture, Robots & Canonicalization\" was reviewed: APPROVED. Remarks: good', 'ASSIGNMENT_APPROVED', '1', '{\"submission_id\":3,\"section_id\":6,\"decision\":\"APPROVED\",\"next_section_id\":7}', '2026-10-24 11:32:51');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('12', '1', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 2: Detailed Buyer Persona & Journey Canvas.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":4,\"student_id\":5,\"assignment_id\":2}', '2026-10-24 12:07:33');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('13', '2', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 2: Detailed Buyer Persona & Journey Canvas.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":4,\"student_id\":5,\"assignment_id\":2}', '2026-10-24 12:07:33');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('14', '5', 'Task Rejected - Re-watch Video Required', 'Your submission for \"Task 2: Detailed Buyer Persona & Journey Canvas\" in \"Section 2: Customer Personas and Journey Mapping\" was reviewed: REJECTED.', 'SYSTEM_ALERT', '1', '{\"submission_id\":4,\"section_id\":2,\"decision\":\"REJECTED\",\"next_section_id\":null}', '2026-10-24 12:08:34');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('15', '1', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 2: Detailed Buyer Persona & Journey Canvas.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":5,\"student_id\":5,\"assignment_id\":2}', '2026-10-24 12:13:44');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('16', '2', 'New Student Assignment Submitted', 'Student Ajith Developer (@ajith_developer) submitted task: Task 2: Detailed Buyer Persona & Journey Canvas.', 'ASSIGNMENT_SUBMITTED', '0', '{\"submission_id\":5,\"student_id\":5,\"assignment_id\":2}', '2026-10-24 12:13:44');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data_json`, `created_at`) VALUES ('17', '5', 'Assignment Approved!', 'Your submission for \"Task 2: Detailed Buyer Persona & Journey Canvas\" in \"Section 2: Customer Personas and Journey Mapping\" was reviewed: APPROVED.', 'ASSIGNMENT_APPROVED', '0', '{\"submission_id\":5,\"section_id\":2,\"decision\":\"APPROVED\",\"next_section_id\":3}', '2026-10-24 12:14:37');

DROP TABLE IF EXISTS `playback_tokens`;
CREATE TABLE `playback_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(128) NOT NULL,
  `user_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `session_token` varchar(128) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `fk_playback_user` (`user_id`),
  KEY `fk_playback_section` (`section_id`),
  KEY `idx_playback_token` (`token`),
  KEY `idx_playback_expires` (`expires_at`),
  CONSTRAINT `fk_playback_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_playback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('58', 'ce432341b5915f0948868b7d25c14bd20a4c1158aaa55b9571f59c02df72cfc6', '5', '1', '8bf0f450cfcdf8e5fda45f75d7a8d891eff39f6b7479ee4fc3b24eaf5960944b', '2026-10-26 05:52:09', '2026-10-26 11:17:09');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('59', '70e97c0d24385d9ac52562208f756a35ef6ef56e00e1082d571b14e1963da10f', '5', '1', '8bf0f450cfcdf8e5fda45f75d7a8d891eff39f6b7479ee4fc3b24eaf5960944b', '2026-10-26 05:52:09', '2026-10-26 11:17:09');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('60', '120684ccbd15459b83a3edeeda452b3dee1f55ce1a695361818db3b602ff714d', '5', '1', 'edf58684be9342441cf8f85d3edfa2f55addb9de7bf05a0c0c5e08f96b2f8014', '2026-10-26 05:52:50', '2026-10-26 11:17:50');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('61', 'd8766fd0c89851af8f57b4e932ea0aab56f4abf310689d1432ff0d1cf8558c1a', '5', '1', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '2026-10-26 05:54:24', '2026-10-26 11:19:24');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('62', '614b3e91002b83d45bdf41bfc2dc5d4ee8af0ee24112d2e2dd06d25061dd6369', '5', '1', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '2026-10-26 05:54:24', '2026-10-26 11:19:24');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('63', 'c3a48c61c66888ba004213a7aa2778b1321188715f6fb69a945c547da80a4e63', '5', '1', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '2026-10-26 05:55:42', '2026-10-26 11:20:42');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('64', 'c9593ff87dd6f13f1bb791724cac0f45080cef564dc2ce0a5d057192fe0eb1da', '5', '1', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '2026-10-26 05:55:42', '2026-10-26 11:20:42');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('65', 'd9adf2e639b5f6104b56dc7b2d8bb8897ebc57116533e5adb0bc86791b7e1d6d', '5', '1', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '2026-10-26 05:59:07', '2026-10-26 11:24:07');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('66', '91bab81042b0a01559868585e45089751103e23ebb3bb9df5cc178336a42975e', '5', '1', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '2026-10-26 05:59:07', '2026-10-26 11:24:07');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('67', '2b7fc279a38acc1068bfde42e605722ceb88140f8e1e7874f2796d3bd598a883', '5', '1', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '2026-10-26 06:01:47', '2026-10-26 11:26:47');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('68', '36b3cfc49141f5c456e2ec54086ac9f97310087e94092aa773cfbe0c9d6aad4b', '5', '1', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '2026-10-26 06:01:47', '2026-10-26 11:26:47');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('69', 'edc736bdf68f2f8718899bc44bd803e2ff51675e9b4cb71d1c60c4f7ca1c80a7', '5', '1', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '2026-10-26 06:02:34', '2026-10-26 11:27:34');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('70', '5ee9982a69deb1ba28c86f252aa34cf306a2f01a5c24ecd0179f684af0de7dd6', '5', '1', '5c5b61993a96cdc8d7100ad66e63f99cf7c48226641c3a233f0a5ef16a885cde', '2026-10-26 06:02:34', '2026-10-26 11:27:34');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('71', '74b7e6794b805e5f367e37346297b0dd8c8b5bfdd9a119a07880975ed2942c80', '5', '1', '7e95e95f7443fd14dff9c70a6cedd96a9b8a37246672d54d66b32e151d99c37d', '2026-10-26 06:03:37', '2026-10-26 11:28:37');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('72', 'd606e1f6dd67cb63071f193255f59c449b102230f39f7254b8d993b5cc7b6843', '5', '1', '7e95e95f7443fd14dff9c70a6cedd96a9b8a37246672d54d66b32e151d99c37d', '2026-10-26 06:03:37', '2026-10-26 11:28:37');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('73', 'dc5220985f52595064fb709ff86d27a5ad64d6ca684af3373e1acd27386b5c80', '5', '1', '7e95e95f7443fd14dff9c70a6cedd96a9b8a37246672d54d66b32e151d99c37d', '2026-10-26 06:04:29', '2026-10-26 11:29:29');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('74', 'd0aa517599a07ef0891118563211fce8b0b53835e581c56bad31cce95b952434', '5', '1', '7e95e95f7443fd14dff9c70a6cedd96a9b8a37246672d54d66b32e151d99c37d', '2026-10-26 06:04:29', '2026-10-26 11:29:29');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('75', 'ffd45b58adbddea2757e98b18adf80b41070ea04622b4fafc3fcbca373430e8d', '5', '1', 'eee018cf1152ec48b56d71025dfcdfaa49c2137e868c1d456e958d5f6ea9f4ce', '2026-10-26 06:12:25', '2026-10-26 11:37:25');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('76', 'cbab58e27c5bfaa17030c223d257e6820673b7264584453036c6f610274cb4cd', '5', '1', 'eee018cf1152ec48b56d71025dfcdfaa49c2137e868c1d456e958d5f6ea9f4ce', '2026-10-26 06:12:25', '2026-10-26 11:37:25');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('77', 'e1c012291c90da0e830d84e41e989285b2784f9a0c537c85345be3cd03fe6e3b', '5', '11', '2a37522792c05a9ceae9d76140b065c0ad3af3ba8bd1172b78d81ae51033d4e6', '2026-10-26 06:14:23', '2026-10-26 11:39:23');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('78', '1ce594f1f0a20a7b4e53f4f9d904e60eae45ed6160de2338cc4d0e7e1566d124', '5', '11', '2a37522792c05a9ceae9d76140b065c0ad3af3ba8bd1172b78d81ae51033d4e6', '2026-10-26 06:14:23', '2026-10-26 11:39:23');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('79', '9f548e6c640a0977d220018d2cd977b9d2232a1b9c2c54291845610ad606c439', '5', '1', '2a37522792c05a9ceae9d76140b065c0ad3af3ba8bd1172b78d81ae51033d4e6', '2026-10-26 06:29:00', '2026-10-26 11:54:00');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('80', '6dd04240cd1f54021c82ace5ddc048f51413d75fc495d86d3376566091437123', '5', '1', '2a37522792c05a9ceae9d76140b065c0ad3af3ba8bd1172b78d81ae51033d4e6', '2026-10-26 06:29:00', '2026-10-26 11:54:00');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('81', '957f30ab8cb3376462ecaebbfaf3e0600ee50a9f65b8f3fba83f28ffd14cf858', '5', '1', 'd7399a813f58430bd94e490e3a82e4c26e4b365161e083e1b759f85075ed727e', '2026-10-26 06:35:35', '2026-10-26 12:00:35');
INSERT INTO `playback_tokens` (`id`, `token`, `user_id`, `section_id`, `session_token`, `expires_at`, `created_at`) VALUES ('82', 'c694c002ed3b0f0270a06534390c8dc7284cd9732de4733120a4bd62de58ad13', '5', '1', 'd7399a813f58430bd94e490e3a82e4c26e4b365161e083e1b759f85075ed727e', '2026-10-26 06:35:35', '2026-10-26 12:00:35');

DROP TABLE IF EXISTS `rate_limits`;
CREATE TABLE `rate_limits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(100) NOT NULL,
  `action` varchar(50) NOT NULL,
  `hit_count` int(11) NOT NULL DEFAULT 1,
  `first_hit_at` datetime DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rate_id_action` (`identifier`,`action`),
  KEY `idx_rate_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `rate_limits` (`id`, `identifier`, `action`, `hit_count`, `first_hit_at`, `expires_at`) VALUES ('2', 'login_127.0.0.1_saravanan.palaniswamybca@gmail.com', 'login', '1', '2026-10-26 12:22:13', '2026-10-26 06:55:13');

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES ('1', 'super_admin', 'Super Administrator with system-wide access and security configuration', '2026-10-24 09:47:37');
INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES ('2', 'admin', 'Administrator / Instructor managing courses, students, and approvals', '2026-10-24 09:47:37');
INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES ('3', 'student', 'Enrolled student attending courses and submitting assignments', '2026-10-24 09:47:37');

DROP TABLE IF EXISTS `section_unlocks`;
CREATE TABLE `section_unlocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `status` enum('LOCKED','UNLOCKED') DEFAULT 'UNLOCKED',
  `unlocked_by` enum('SYSTEM','ADMIN') DEFAULT 'SYSTEM',
  `unlocked_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_section_unlock` (`user_id`,`section_id`),
  KEY `fk_unlocks_section` (`section_id`),
  KEY `idx_unlock_status` (`status`),
  CONSTRAINT `fk_unlocks_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_unlocks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `section_unlocks` (`id`, `user_id`, `section_id`, `status`, `unlocked_by`, `unlocked_at`, `updated_at`) VALUES ('14', '5', '1', 'UNLOCKED', 'SYSTEM', '2026-10-26 11:25:37', '2026-10-26 11:25:37');
INSERT INTO `section_unlocks` (`id`, `user_id`, `section_id`, `status`, `unlocked_by`, `unlocked_at`, `updated_at`) VALUES ('19', '5', '11', 'LOCKED', 'SYSTEM', '2026-10-26 11:38:58', '2026-10-26 11:46:45');
INSERT INTO `section_unlocks` (`id`, `user_id`, `section_id`, `status`, `unlocked_by`, `unlocked_at`, `updated_at`) VALUES ('22', '6', '1', 'UNLOCKED', 'SYSTEM', '2026-10-26 12:07:57', '2026-10-26 12:07:57');

DROP TABLE IF EXISTS `sections`;
CREATE TABLE `sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `learning_objectives` text DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 1,
  `is_free_preview` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sections_module_order` (`module_id`,`order_index`),
  CONSTRAINT `fk_sections_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sections` (`id`, `module_id`, `title`, `description`, `learning_objectives`, `order_index`, `is_free_preview`, `created_at`, `updated_at`) VALUES ('1', '1', 'Section 1: Introduction to Digital Marketing Ecosystem', 'Understanding how owned, earned, and paid media synchronize to build scalable sales funnels.', '1. Understand the modern digital landscape.\n2. Map the digital marketing funnel stages.\n3. Analyze digital attribution models.', '1', '1', '2026-10-24 09:47:37', '2026-10-24 09:47:37');
INSERT INTO `sections` (`id`, `module_id`, `title`, `description`, `learning_objectives`, `order_index`, `is_free_preview`, `created_at`, `updated_at`) VALUES ('11', '7', 'development - Masterclass Lesson 1', 'java,php', NULL, '1', '0', '2026-10-26 11:38:58', '2026-10-26 11:38:58');

DROP TABLE IF EXISTS `submission_attachments`;
CREATE TABLE `submission_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL DEFAULT 0,
  `mime_type` varchar(100) NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_attachments_submission` (`submission_id`),
  CONSTRAINT `fk_attachments_submission` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `submission_text` longtext DEFAULT NULL,
  `status` enum('PENDING_REVIEW','REVISION_REQUIRED','APPROVED','REJECTED') DEFAULT 'PENDING_REVIEW',
  `admin_feedback` text DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `submitted_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_submissions_assignment` (`assignment_id`),
  KEY `fk_submissions_reviewer` (`reviewed_by`),
  KEY `idx_submissions_status` (`status`),
  KEY `idx_submissions_user_assignment` (`user_id`,`assignment_id`),
  CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `full_name` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `require_password_change` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role_id`),
  KEY `idx_users_active` (`is_active`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `username`, `email`, `phone`, `full_name`, `password_hash`, `role_id`, `is_active`, `require_password_change`, `created_at`, `updated_at`) VALUES ('1', 'superadmin', 'superadmin@inymart.com', NULL, 'Academy Super Administrator', '$2y$10$XK/y9M5SGlzn42xne0dNnOaj61r2CXSiMMYwVLhMbLxrGi8m5x/c2', '1', '1', '0', '2026-10-24 09:47:37', '2026-10-26 12:04:40');
INSERT INTO `users` (`id`, `username`, `email`, `phone`, `full_name`, `password_hash`, `role_id`, `is_active`, `require_password_change`, `created_at`, `updated_at`) VALUES ('2', 'instructor_sarah', 'sarah@inymart.com', NULL, 'Sarah Jenkins (Lead Instructor)', '$2y$10$3uVmaP36Ip/8FUC8hHwJMeNZlJsn2MKHaxy.JvWi/tDqx/.igpiPy', '2', '1', '0', '2026-10-24 09:47:37', '2026-10-24 09:47:37');
INSERT INTO `users` (`id`, `username`, `email`, `phone`, `full_name`, `password_hash`, `role_id`, `is_active`, `require_password_change`, `created_at`, `updated_at`) VALUES ('5', 'ajith_developer', 'ajith@inymart.com', NULL, 'Ajith Developer', '$2y$10$56Fm//ogAtBJPSh5nGHvwePyjhSoiY2DiO1DJE513bpwKAkq0yCve', '3', '1', '0', '2026-10-24 09:56:28', '2026-10-26 12:22:27');
INSERT INTO `users` (`id`, `username`, `email`, `phone`, `full_name`, `password_hash`, `role_id`, `is_active`, `require_password_change`, `created_at`, `updated_at`) VALUES ('6', 'saravanan_2003', 'saravanan.palaniswamybca@gmail.com', '+918428684874', 'Saravanan Palaniswamy', '$2y$10$5WU9oQOQji1UJfiMLPX3VuGxD/3Qlz4CFHxfiWjP.T3NEM29Zc7hq', '3', '0', '1', '2026-10-26 12:07:57', '2026-10-26 12:21:38');

DROP TABLE IF EXISTS `video_assets`;
CREATE TABLE `video_assets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL DEFAULT 0,
  `duration_seconds` int(11) NOT NULL DEFAULT 0,
  `mime_type` varchar(80) NOT NULL DEFAULT 'video/mp4',
  `hls_playlist_path` varchar(255) DEFAULT NULL,
  `status` enum('processing','ready','failed') DEFAULT 'ready',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `section_id` (`section_id`),
  CONSTRAINT `fk_videos_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `video_assets` (`id`, `section_id`, `file_path`, `original_filename`, `file_size`, `duration_seconds`, `mime_type`, `hls_playlist_path`, `status`, `created_at`, `updated_at`) VALUES ('1', '1', 'videos/dm_class.mp4', 'dm class.mp4', '39236052', '180', 'video/mp4', NULL, 'ready', '2026-10-24 09:47:37', '2026-10-26 11:02:03');
INSERT INTO `video_assets` (`id`, `section_id`, `file_path`, `original_filename`, `file_size`, `duration_seconds`, `mime_type`, `hls_playlist_path`, `status`, `created_at`, `updated_at`) VALUES ('11', '11', 'videos/course_3_sec1_1792994938.mp4', 'WhatsApp Video 2026-10-24 at 10.09.46 AM.mp4', '741952', '240', 'video/mp4', NULL, 'ready', '2026-10-26 11:38:58', '2026-10-26 11:38:58');

DROP TABLE IF EXISTS `video_progress`;
CREATE TABLE `video_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `last_watched_position` decimal(8,2) NOT NULL DEFAULT 0.00,
  `duration_seconds` int(11) NOT NULL DEFAULT 0,
  `watched_seconds` int(11) NOT NULL DEFAULT 0,
  `completion_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `status` enum('AVAILABLE','IN_PROGRESS','VIDEO_COMPLETED') DEFAULT 'AVAILABLE',
  `completed_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_progress_user_section` (`user_id`,`section_id`),
  KEY `fk_progress_section` (`section_id`),
  KEY `idx_progress_status` (`status`),
  CONSTRAINT `fk_progress_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `video_progress` (`id`, `user_id`, `section_id`, `last_watched_position`, `duration_seconds`, `watched_seconds`, `completion_percentage`, `status`, `completed_at`, `updated_at`) VALUES ('9', '5', '1', '5.22', '180', '40', '2.88', 'IN_PROGRESS', NULL, '2026-10-26 11:54:26');
INSERT INTO `video_progress` (`id`, `user_id`, `section_id`, `last_watched_position`, `duration_seconds`, `watched_seconds`, `completion_percentage`, `status`, `completed_at`, `updated_at`) VALUES ('10', '5', '11', '0.00', '240', '0', '0.00', 'AVAILABLE', NULL, '2026-10-26 11:38:58');
INSERT INTO `video_progress` (`id`, `user_id`, `section_id`, `last_watched_position`, `duration_seconds`, `watched_seconds`, `completion_percentage`, `status`, `completed_at`, `updated_at`) VALUES ('11', '6', '1', '0.00', '180', '0', '0.00', 'AVAILABLE', NULL, '2026-10-26 12:07:57');

DROP TABLE IF EXISTS `watched_segments`;
CREATE TABLE `watched_segments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `video_progress_id` int(11) NOT NULL,
  `segment_start` decimal(8,2) NOT NULL,
  `segment_end` decimal(8,2) NOT NULL,
  `recorded_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_segments_progress` (`video_progress_id`,`segment_start`),
  CONSTRAINT `fk_segments_progress` FOREIGN KEY (`video_progress_id`) REFERENCES `video_progress` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `watched_segments` (`id`, `video_progress_id`, `segment_start`, `segment_end`, `recorded_at`) VALUES ('87', '9', '0.00', '5.14', '2026-10-26 11:24:40');
INSERT INTO `watched_segments` (`id`, `video_progress_id`, `segment_start`, `segment_end`, `recorded_at`) VALUES ('88', '9', '5.14', '10.19', '2026-10-26 11:24:45');
INSERT INTO `watched_segments` (`id`, `video_progress_id`, `segment_start`, `segment_end`, `recorded_at`) VALUES ('89', '9', '10.19', '15.23', '2026-10-26 11:24:50');
INSERT INTO `watched_segments` (`id`, `video_progress_id`, `segment_start`, `segment_end`, `recorded_at`) VALUES ('90', '9', '15.23', '20.33', '2026-10-26 11:26:34');
INSERT INTO `watched_segments` (`id`, `video_progress_id`, `segment_start`, `segment_end`, `recorded_at`) VALUES ('91', '9', '20.33', '25.52', '2026-10-26 11:26:34');
INSERT INTO `watched_segments` (`id`, `video_progress_id`, `segment_start`, `segment_end`, `recorded_at`) VALUES ('92', '9', '25.52', '30.55', '2026-10-26 11:26:34');
INSERT INTO `watched_segments` (`id`, `video_progress_id`, `segment_start`, `segment_end`, `recorded_at`) VALUES ('93', '9', '30.55', '35.60', '2026-10-26 11:26:38');
INSERT INTO `watched_segments` (`id`, `video_progress_id`, `segment_start`, `segment_end`, `recorded_at`) VALUES ('94', '9', '35.60', '40.65', '2026-10-26 11:26:43');
INSERT INTO `watched_segments` (`id`, `video_progress_id`, `segment_start`, `segment_end`, `recorded_at`) VALUES ('95', '9', '0.00', '5.22', '2026-10-26 11:54:26');

SET FOREIGN_KEY_CHECKS = 1;
