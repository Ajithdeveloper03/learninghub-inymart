# Secure Digital Marketing Academy LMS

A full-stack, secure, production-ready Learning Management System (LMS) built from scratch for a Digital Marketing Academy.

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, custom secure HTML5 video player with anti-forward seek, dynamic floating watermark, and deliverable submission interface.
- **Backend:** Native Plain PHP (zero third-party web frameworks) organized into clean configuration, routing, middleware, controllers, services, repositories, validators, and utility layers.
- **Database:** MySQL relational schema with foreign keys, cascading/restrict integrity, transactional approval workflows, interval-based anti-skip tracking, and audit logging.
- **Content Protection:** Private video storage outside the public web root, short-lived playback grants, RFC 7233 byte-range chunk streaming, dynamic student session watermark, and strict single-active-device session binding.

---

## 1. System Architecture

```
DM Team/
├── backend/
│   ├── config/
│   │   ├── app.php                      # Application secrets, thresholds (95% watch coverage), storage paths
│   │   └── database.php                 # MySQL PDO connection configuration
│   ├── controllers/
│   │   ├── ApprovalController.php       # Instructor review decisions: Approve, Request Revision, Reject
│   │   ├── AssignmentController.php     # Task instructions, student submissions, and secure file downloads
│   │   ├── AuthController.php           # Login, me, logout, password change, brute-force rate limiting
│   │   ├── CourseController.php         # Public course catalog & syllabus hierarchy
│   │   ├── DeviceSessionController.php  # Active device session tracking and revocation
│   │   ├── NotificationController.php   # In-app alert notifications inbox
│   │   ├── ReportController.php         # Analytics dashboard stats and live CSV export
│   │   ├── SectionController.php        # Section access eligibility and manual unlock
│   │   ├── StudentController.php        # Admin student creation, course assignment, status toggle, device reset
│   │   └── VideoController.php          # Playback token authorization, byte-range streaming, segment progress
│   ├── middleware/
│   │   ├── AuthMiddleware.php           # Token extraction, device session validation, revocation check
│   │   ├── CorsMiddleware.php           # CORS headers and HTTP OPTIONS preflight
│   │   ├── RateLimitMiddleware.php      # Database-backed brute force defense
│   │   └── RoleMiddleware.php           # Granular RBAC (super_admin, admin, student)
│   ├── migrations/
│   │   ├── 001_create_tables.sql        # 18 relational tables, foreign keys, indexes
│   │   ├── 002_seed_data.sql            # Initial roles, users, courses, modules, sections, assignments
│   │   └── migrate.php                  # Database migration execution script
│   ├── public/
│   │   ├── .htaccess                    # Apache rewrite configuration
│   │   └── index.php                    # Central API Front Controller and routing registry
│   ├── repositories/
│   │   ├── AuditRepository.php          # Analytics, KPI metrics, and system audit logs
│   │   ├── CourseRepository.php         # Course hierarchy, module/section syllabus, student enrollments
│   │   ├── ProgressRepository.php       # Watched segments interval merging and section unlocks
│   │   ├── SubmissionRepository.php     # Assignments, deliverable attachments, atomic approval logs
│   │   └── UserRepository.php           # Student CRUD, session management, password hashing
│   ├── routes/
│   │   └── Router.php                   # Fast regex-based plain PHP REST API router
│   ├── services/
│   │   ├── AssignmentService.php        # Video completion prerequisite check and file upload security
│   │   ├── AuthService.php              # Single active device enforcement and JWT session issuance
│   │   └── VideoProgressService.php     # Playback token grants, interval union engine, anti-skip verification
│   ├── storage/
│   │   ├── logs/                        # Application error and audit file logs
│   │   ├── submissions/                 # Uploaded student assignments (outside public web root)
│   │   └── videos/                      # Private video media files (outside public web root)
│   ├── tests/
│   │   └── run_tests.php                # Automated test runner covering all 23 security & workflow invariants
│   ├── utils/
│   │   ├── Database.php                 # Singleton PDO connection with prepared statements
│   │   ├── JWT.php                      # HMAC-SHA256 stateless / session-linked token engine
│   │   ├── Logger.php                   # Database audit logger
│   │   ├── Response.php                 # Standardized JSON response envelope
│   │   └── Validator.php                # Input validation, password complexity, file MIME/extension checks
│   ├── .env                             # Local environment variables
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx                     # Academy Public Homepage (Hero, Methodology, Courses, FAQs, CTA)
│   │   ├── about/page.tsx               # About the Academy & Faculty
│   │   ├── contact/page.tsx             # Contact Us with interactive inquiry form
│   │   ├── courses/
│   │   │   ├── page.tsx                 # Public Courses Catalog with search and level filters
│   │   │   └── [id]/page.tsx            # Course Syllabus & Curriculum Breakdown
│   │   ├── login/page.tsx               # Student & Administrator Login with Quick-Fill demo accounts
│   │   ├── privacy/page.tsx             # Privacy Policy (Watermarking and Device Binding Disclosures)
│   │   ├── terms/page.tsx               # Terms & Academic Progression Conditions
│   │   ├── student/
│   │   │   ├── dashboard/page.tsx       # Enrolled courses, resume learning, active device session
│   │   │   ├── courses/[id]/page.tsx    # Interactive Learning Workspace (Video Player + Assignment Card)
│   │   │   ├── notifications/page.tsx   # In-app Notifications Inbox
│   │   │   └── profile/page.tsx         # Password Update and Session Management
│   │   └── admin/
│   │       ├── dashboard/page.tsx       # System KPIs, recent submissions review modal, security audits
│   │       ├── students/page.tsx        # Searchable student directory, add student modal, device reset
│   │       ├── courses/page.tsx         # Course creation modal, modules & sections syllabus stats
│   │       ├── approvals/page.tsx       # Dedicated pending submission review queue & download attachments
│   │       └── reports/page.tsx         # Student progress report and live CSV export
│   ├── components/
│   │   ├── AssignmentCard.tsx           # Task instructions, response textarea, file upload, status alerts
│   │   ├── CustomVideoPlayer.tsx        # HTML5 player with anti-forward seek, watermark, and segment heartbeats
│   │   ├── Footer.tsx                   # Academy footer links and accreditation badge
│   │   ├── Navbar.tsx                   # Responsive header with role badges and unread notification counter
│   │   └── StatusBadge.tsx              # Color-coded workflow badges (LOCKED, AVAILABLE, IN_PROGRESS, etc.)
│   ├── lib/
│   │   ├── api.ts                       # Typed fetch client with Bearer auth and revocation handling
│   │   └── auth-context.tsx             # React AuthProvider with single-device revocation listener
│   ├── types/
│   │   └── index.ts                     # TypeScript interfaces
│   └── next.config.ts                   # Next.js configuration with proxy rewrites to PHP API
└── README.md
```

---

## 2. Seed Accounts & Credentials

The database migration seeds the system with 4 default accounts:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `Admin@12345` | System-wide settings, user management, audit logs |
| **Admin / Instructor** | `instructor_sarah` | `Instructor@12345` | Course management, submission review & approvals |
| **Student** | `student_alex` | `Student@12345` | Enrolled in *Digital Marketing Masterclass 2026* |
| **Student** | `student_priya` | `Student@12345` | Enrolled with password change required on first login |

---

## 3. Mandatory Sequential Learning Workflow

Every section follows an exact 9-step progression pipeline:

```
[Section 1: Available]
       │
       ▼
[Step 1: Start Video] ──► Validates enrollment & active device session
       │
       ▼
[Step 2: Watch Video] ──► Forward-seek disabled; sends segment heartbeats [start, end]
       │
       ▼
[Step 3: Server Verification] ──► Backend interval union checks coverage >= 95%
       │
       ▼
[Step 4: VIDEO_COMPLETED] ──► Video status marked complete; unlocks assignment
       │
       ▼
[Step 5: Submit Assignment] ──► Student uploads text/file; status -> PENDING_REVIEW
       │                        (Next section remains strictly LOCKED)
       ▼
[Step 6: Notify Instructor] ──► In-app alert notification created for administrators
       │
       ▼
[Step 7: Instructor Review]
       │
       ├──► [Request Revision] ──► Remarks stored; section remains locked; student can resubmit
       ├──► [Reject]           ──► Remarks stored; section remains locked
       └──► [Approve]
              │
              ▼
[Step 8: Atomic Next Section Unlock] ──► Transaction unlocks the subsequent section in sequence!
```

---

## 4. Video Protection & Anti-Skip Segment Tracking

1. **Storage Isolation:** Video assets are kept in `backend/storage/videos/` outside the web root (`backend/public/`). Direct file requests from web browsers are physically impossible.
2. **Short-Lived Playback Grants:** Students request authorization via `POST /api/videos/{id}/playback-authorize`. The server verifies enrollment, section unlock status, and active device session, returning a short-lived token expiring in 300 seconds.
3. **HTTP Range Chunk Streaming:** `GET /api/videos/stream?token=...` handles RFC 7233 partial content chunk delivery (`206 Partial Content`), preventing caching and allowing HTML5 video players to stream smoothly.
4. **Interval Union Coverage Validation:** As the student watches, the player sends periodic intervals (`[0, 10]`, `[10, 20]`, etc.). The server merges overlapping intervals and computes total unique seconds. Skipping ahead does not grant completion; video completion is awarded only when unique coverage reaches 95%+.
5. **Dynamic Floating Watermark:** An animated, floating watermark overlay continuously renders the student's ID, username, session token snippet, and IP address over the video player to deter screen recording and content leakage.
6. **Browser Deterrents:** Right-click context menus are disabled, `controlsList="nodownload"` prevents native browser download prompts, and picture-in-picture is restricted.

---

## 5. Single Active Device Enforcement

To prevent account and credential sharing:
1. When a student logs in, a unique cryptographic session token is generated and recorded in the `device_sessions` table with user agent and IP metadata.
2. If the student logs in from another computer, mobile device, or browser, **all previous sessions for that student are immediately marked `is_revoked = 1`**.
3. Protected endpoints and video streams validate session status on every single request. If a request is received from a revoked session, it is immediately rejected with HTTP 401 and code `SESSION_REVOKED`.
4. The frontend listens for revocation events and displays a prominent security banner notifying the user that another device signed into their account.
5. Administrators can also reset a student's device binding with one click from the Student Management console.

---

## 6. Automated Test Suite

The automated test runner (`backend/tests/run_tests.php`) directly verifies the 23 security, authorization, and workflow invariants:

```bash
php backend/tests/run_tests.php
```

### Verified Test Cases:
1. Student Alex successfully logs in with password verification.
2. Alex logs in from a second device -> previous device session is immediately revoked.
3. Enrolled course access is granted; unenrolled course access is strictly denied.
4. Short-lived playback token generated for unlocked Section 1.
5. Direct playback authorization for locked Section 2 is blocked.
6. Partial watch (5.5%) does not grant completion.
7. Skipping to end without covering 95% of segments is rejected from completion.
8. Continuous watched coverage (>= 95%) completes video (`VIDEO_COMPLETED`).
9. Submitting assignment before video completion is blocked.
10. Assignment submission successfully sets status to `PENDING_REVIEW`.
11. Video completion and submission alone cannot unlock Section 2 (remains locked).
12. Instructor revision request preserves lock and accepts resubmission.
13. Instructor approval atomically unlocks Section 2 for Alex.
14. Section 3 remains locked until Section 2 is completed and approved.
15. Duplicate approvals do not corrupt progress or unlock invalid sections.
16. Revoked device session cannot access protected video or student endpoints.
17. Expired playback grant tokens are rejected immediately.

---

## 7. Local Setup & Running Instructions

### Prerequisites
- PHP 8.2+ with `pdo_mysql`, `mbstring`, `fileinfo`, `curl`, and `openssl` enabled.
- Node.js 18+ and npm.
- MySQL 8.0+ running on `127.0.0.1:3306`.

### 1. Database Setup
```bash
# Run database migration and seed data script
php backend/migrations/migrate.php

# Generate sample playable video files
php backend/storage/create_sample_videos.php
```

### 2. Start Plain PHP Backend API Server
```bash
# Starts PHP development server on port 8000
php -S 127.0.0.1:8000 -t backend/public backend/public/index.php
```

### 3. Start Next.js Frontend Server
```bash
cd frontend
npm install
npm run dev -- -p 3000
```

Open `http://localhost:3000` in your web browser.

---

## 8. Production Deployment Guide

### Nginx Configuration (Unified Reverse Proxy)
```nginx
# /etc/nginx/sites-available/dm_academy.conf

server {
    listen 80;
    server_name academy.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name academy.example.com;

    ssl_certificate /etc/letsencrypt/live/academy.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/academy.example.com/privkey.pem;

    # Next.js Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # PHP REST API
    location /api {
        root /var/www/dm_academy/backend/public;
        try_files $uri /index.php$is_args$args;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_pass unix:/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/dm_academy/backend/public/index.php;
            fastcgi_read_timeout 300;
            fastcgi_buffers 16 16k;
            fastcgi_buffer_size 32k;
        }
    }

    # Deny direct access to storage or hidden files
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## 9. Database Backup & Restore Procedures

### Database Backup
```bash
# Automated MySQL dump with gzip compression
mysqldump -u root -p dm_academy_lms | gzip > backup_dm_academy_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Database Restore
```bash
# Restore database from compressed backup
gunzip < backup_dm_academy_YYYYMMDD_HHMMSS.sql.gz | mysql -u root -p dm_academy_lms
```

---

## 10. Security Limitations & Content Protection Disclosure

While the academy implements strict server-side authorization, short-lived playback tokens, RFC 7233 byte-range streaming, floating watermarks, and disabled context menus:
- **No browser-based technology can guarantee 100% prevention of external capture tools, HDMI capture devices, or smartphone camera recording.**
- If enterprise grade hardware-encrypted content protection is required, the video delivery layer can be integrated with Widevine Modular, Apple FairPlay, or Microsoft PlayReady DRM via an encrypted HLS (CENC) packager and DRM key server.
#   l e a r n i n g h u b - i n y m a r t  
 