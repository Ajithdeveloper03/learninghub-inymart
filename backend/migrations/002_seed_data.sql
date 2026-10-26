-- Seed Initial Roles, Users, Courses, Modules, Sections, Videos, and Assignments

SET FOREIGN_KEY_CHECKS = 0;

-- Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'super_admin', 'Super Administrator with system-wide access and security configuration'),
(2, 'admin', 'Administrator / Instructor managing courses, students, and approvals'),
(3, 'student', 'Enrolled student attending courses and submitting assignments')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Initial Users (Password: Admin@12345, Instructor@12345, Student@12345)
INSERT INTO `users` (`id`, `username`, `email`, `full_name`, `password_hash`, `role_id`, `is_active`, `require_password_change`) VALUES
(1, 'superadmin', 'superadmin@inymart.com', 'Academy Super Administrator', '$2y$10$OaTlQL5IXmm4hPYmhIOA5OBOJOe4B/q2O/RrP2J49d.pGqdEkhv6q', 1, 1, 0),
(2, 'instructor_sarah', 'sarah@inymart.com', 'Sarah Jenkins (Lead Instructor)', '$2y$10$3uVmaP36Ip/8FUC8hHwJMeNZlJsn2MKHaxy.JvWi/tDqx/.igpiPy', 2, 1, 0),
(3, 'ajith_developer', 'ajith@inymart.com', 'Ajith Developer', '$2y$10$D2pL4c2W78fIxzNg6fCsE.Kx2P3t0ZhyuOUyBk0BujwHYu2xQ4Mxa', 3, 1, 0)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- Course: Digital Marketing Mastery 2026
INSERT INTO `courses` (`id`, `title`, `slug`, `subtitle`, `description`, `thumbnail_url`, `price`, `level`, `is_published`, `created_by`) VALUES
(1, 'Digital Marketing Masterclass 2026', 'digital-marketing-masterclass-2026', 'From Fundamentals to High-ROI Growth Marketing Strategies', 'Master performance marketing, SEO, Google Ads, Meta Ads, funnel architecture, and analytics with real client campaign workflows. Designed by senior growth marketers for aspiring academy professionals.', '/images/course-dm-mastery.jpg', 499.00, 'all', 1, 1),
(2, 'Advanced Search Engine Optimization (SEO)', 'advanced-seo-mastery', 'Dominate organic search rankings with technical SEO and intent-driven content strategy', 'Comprehensive deep dive into modern Google algorithm updates, crawl budget optimization, semantic entity indexing, schema graphs, and white-hat link acquisition strategies.', '/images/course-seo.jpg', 349.00, 'intermediate', 1, 2)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Modules for Course 1
INSERT INTO `modules` (`id`, `course_id`, `title`, `description`, `order_index`) VALUES
(1, 1, 'Module 1: Digital Marketing Fundamentals & Strategy', 'Core pillars of modern digital marketing, consumer psychology, and market research.', 1),
(2, 1, 'Module 2: Search Engine Optimization & Keyword Intent', 'Technical and on-page optimization principles to capture high-converting search intent.', 2),
(3, 1, 'Module 3: Paid Advertising & Multi-Channel Funnels', 'Meta Ads, Google Performance Max, creative testing frameworks, and ROAS optimization.', 3)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Sections for Module 1
INSERT INTO `sections` (`id`, `module_id`, `title`, `description`, `learning_objectives`, `order_index`, `is_free_preview`) VALUES
(1, 1, 'Section 1: Introduction to Digital Marketing Ecosystem', 'Understanding how owned, earned, and paid media synchronize to build scalable sales funnels.', '1. Understand the modern digital landscape.\n2. Map the digital marketing funnel stages.\n3. Analyze digital attribution models.', 1, 1),
(2, 1, 'Section 2: Customer Personas and Journey Mapping', 'Building data-backed customer profiles, identifying pain points, and mapping awareness-to-purchase stages.', '1. Define accurate buyer personas.\n2. Map multi-touch customer journeys.\n3. Identify high-friction drop-off points.', 2, 0),
(3, 1, 'Section 3: Competitive Analysis & Value Proposition Design', 'Evaluating competitor ad libraries, SEO footprint, and crafting an irresistible value proposition.', '1. Perform reverse-engineering on competitor ad funnels.\n2. Formulate unique value propositions (UVP).\n3. Establish core performance KPIs.', 3, 0),
-- Sections for Module 2
(4, 2, 'Section 4: Technical SEO & Site Architecture', 'Optimizing Core Web Vitals, crawl paths, canonicalization, and structured data.', '1. Audit site crawlability and indexation.\n2. Implement Schema.org JSON-LD.\n3. Resolve redirect loops and 404 errors.', 1, 0),
(5, 2, 'Section 5: High-Intent Keyword Research & Cluster Mapping', 'Uncovering commercial and transactional search terms, topic clustering, and search intent targeting.', '1. Conduct search volume and CPC analysis.\n2. Build topic clusters and pillar pages.\n3. Map keywords to specific conversion funnels.', 2, 0)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Video Assets for Sections
INSERT INTO `video_assets` (`id`, `section_id`, `file_path`, `original_filename`, `file_size`, `duration_seconds`, `mime_type`, `status`) VALUES
(1, 1, 'videos/sec1_intro_digital_marketing.mp4', 'sec1_intro_digital_marketing.mp4', 15728640, 180, 'video/mp4', 'ready'),
(2, 2, 'videos/sec2_customer_journey.mp4', 'sec2_customer_journey.mp4', 20971520, 240, 'video/mp4', 'ready'),
(3, 3, 'videos/sec3_competitive_analysis.mp4', 'sec3_competitive_analysis.mp4', 18874368, 210, 'video/mp4', 'ready'),
(4, 4, 'videos/sec4_technical_seo.mp4', 'sec4_technical_seo.mp4', 25165824, 300, 'video/mp4', 'ready'),
(5, 5, 'videos/sec5_keyword_research.mp4', 'sec5_keyword_research.mp4', 23068672, 270, 'video/mp4', 'ready')
ON DUPLICATE KEY UPDATE `original_filename` = VALUES(`original_filename`);

-- Assignments for Each Section (Prerequisite to unlock the subsequent section!)
INSERT INTO `assignments` (`id`, `section_id`, `title`, `description`, `instructions`, `submission_type`, `allowed_file_types`, `max_file_size_bytes`, `deadline_days`) VALUES
(1, 1, 'Task 1: Digital Marketing Ecosystem Analysis', 'Map out an end-to-end digital marketing funnel for a chosen e-commerce or B2B brand.', '1. Select a real business or product brand.\n2. Detail their Top of Funnel (Awareness), Middle of Funnel (Consideration), and Bottom of Funnel (Conversion) channels.\n3. Submit a written breakdown (minimum 250 words) along with a diagram/PDF if available.', 'both', 'pdf,png,jpg,jpeg,zip,docx', 20971520, 7),
(2, 2, 'Task 2: Detailed Buyer Persona & Journey Canvas', 'Create two comprehensive customer personas including demographics, psychographics, objections, and journey triggers.', '1. Create Buyer Persona A (Primary decision maker) and Persona B (Influencer).\n2. Detail the exact triggers causing them to search for a solution.\n3. Outline email and retargeting touchpoints.\n4. Upload your canvas as a PDF or image.', 'both', 'pdf,png,jpg,jpeg', 20971520, 7),
(3, 3, 'Task 3: Competitor Ad & Funnel Audit Report', 'Use Facebook Ad Library and Google Search to audit 2 direct competitors.', '1. Identify 3 active ad creatives run by your competitors.\n2. Analyze their copy hook, visual format, and destination landing page offer.\n3. Recommend 2 unique angles where your brand can outperform them.', 'both', 'pdf,png,jpg,jpeg,docx', 20971520, 7),
(4, 4, 'Task 4: Technical SEO Audit & Schema Markup', 'Run a technical audit on a designated test website and author valid JSON-LD schema.', '1. Identify at least 3 technical SEO issues (e.g. missing canonicals, alt tags, LCP bottlenecks).\n2. Provide corrected JSON-LD Schema markup for Course or Organization.\n3. Submit code snippets and analysis report.', 'both', 'pdf,docx,zip', 20971520, 7),
(5, 5, 'Task 5: Keyword Clustering Matrix', 'Build a 30-keyword cluster matrix grouped by informational, commercial, and transactional intent.', '1. Group keywords into 3 clusters.\n2. Define target page URL and meta title/description for each cluster.\n3. Submit spreadsheet or PDF file.', 'both', 'pdf,xlsx,csv,docx', 20971520, 7)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Enroll ajith_developer in Course 1
INSERT INTO `course_enrollments` (`id`, `user_id`, `course_id`, `status`) VALUES
(1, 3, 1, 'active')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Unlock Section 1 for ajith_developer (First section of enrolled course is unlocked)
INSERT INTO `section_unlocks` (`user_id`, `section_id`, `status`, `unlocked_by`) VALUES
(1, 3, 1, 'UNLOCKED', 'SYSTEM')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Initialize Progress for Section 1
INSERT INTO `video_progress` (`user_id`, `section_id`, `last_watched_position`, `duration_seconds`, `watched_seconds`, `completion_percentage`, `status`) VALUES
(3, 1, 0.00, 180, 0, 0.00, 'AVAILABLE')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Initial Audit Log
INSERT INTO `audit_logs` (`user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `details_json`) VALUES
(1, 'SYSTEM_SEEDED', 'system', 1, '127.0.0.1', '{"message": "Initial Digital Marketing Academy LMS schema and seed data loaded successfully"}');

SET FOREIGN_KEY_CHECKS = 1;
