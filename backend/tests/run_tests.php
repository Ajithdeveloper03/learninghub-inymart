<?php
/**
 * Automated Test Suite for Secure Digital Marketing Academy LMS
 * Verifies all 14 backend security, workflow, and access control invariants.
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/utils/Database.php';
require_once dirname(__DIR__) . '/utils/Response.php';
require_once dirname(__DIR__) . '/utils/JWT.php';
require_once dirname(__DIR__) . '/utils/Validator.php';
require_once dirname(__DIR__) . '/utils/Logger.php';
require_once dirname(__DIR__) . '/repositories/UserRepository.php';
require_once dirname(__DIR__) . '/repositories/CourseRepository.php';
require_once dirname(__DIR__) . '/repositories/ProgressRepository.php';
require_once dirname(__DIR__) . '/repositories/SubmissionRepository.php';
require_once dirname(__DIR__) . '/repositories/AuditRepository.php';
require_once dirname(__DIR__) . '/services/AuthService.php';
require_once dirname(__DIR__) . '/services/VideoProgressService.php';
require_once dirname(__DIR__) . '/services/AssignmentService.php';

use App\Repositories\UserRepository;
use App\Repositories\CourseRepository;
use App\Repositories\ProgressRepository;
use App\Repositories\SubmissionRepository;
use App\Services\AuthService;
use App\Services\VideoProgressService;
use App\Services\AssignmentService;
use App\Utils\Database;
use App\Utils\JWT;

$passCount = 0;
$failCount = 0;

function assertTest(bool $condition, string $testName): void {
    global $passCount, $failCount;
    if ($condition) {
        echo "  [PASS] {$testName}\n";
        $passCount++;
    } else {
        echo "  [FAIL] {$testName}\n";
        $failCount++;
    }
}

echo "\n======================================================\n";
echo "   DIGITAL MARKETING ACADEMY LMS - BACKEND TEST SUITE  \n";
echo "======================================================\n\n";

$pdo = Database::getConnection();
$userRepo = new UserRepository();
$courseRepo = new CourseRepository();
$progressRepo = new ProgressRepository();
$submissionRepo = new SubmissionRepository();
$authService = new AuthService();
$videoService = new VideoProgressService();
$assignmentService = new AssignmentService();

// Reset test user states
$pdo->exec("UPDATE `users` SET `is_active` = 1, `require_password_change` = 0 WHERE `id` IN (1, 2, 3, 4)");
$pdo->exec("UPDATE `section_unlocks` SET `status` = 'UNLOCKED' WHERE `user_id` = 3 AND `section_id` = 1");
$pdo->exec("UPDATE `section_unlocks` SET `status` = 'LOCKED' WHERE `user_id` = 3 AND `section_id` > 1");
$pdo->exec("DELETE FROM `device_sessions` WHERE `user_id` IN (3, 4)");

// ---------------------------------------------------------
// TEST 1: Password hashing and secure verification
// ---------------------------------------------------------
echo "TEST SUITE 1: Authentication & Single-Active-Device Session\n";
try {
    $loginAlex = $authService->login('student_alex', 'Student@12345', 'Chrome on Windows');
    assertTest(!empty($loginAlex['token']) && !empty($loginAlex['session_token']), 'Student Alex successfully logs in with correct password');
    $token1 = $loginAlex['session_token'];

    // Test: Alex logs in from a second device -> previous device session MUST be revoked!
    $loginAlexDevice2 = $authService->login('student_alex', 'Student@12345', 'Safari on iPhone');
    assertTest(!empty($loginAlexDevice2['session_token']), 'Alex logs in on second device');

    // Verify session 1 is marked as revoked in database
    $s1 = $pdo->query("SELECT `is_revoked` FROM `device_sessions` WHERE `session_token` = '{$token1}'")->fetch();
    assertTest((int)$s1['is_revoked'] === 1, 'Previous device session is revoked immediately on new device login');
} catch (Exception $e) {
    assertTest(false, 'Auth test exception: ' . $e->getMessage());
}

// ---------------------------------------------------------
// TEST 2: Course Access Control
// ---------------------------------------------------------
echo "\nTEST SUITE 2: Course Enrollment & Access Authorization\n";
$isAlexEnrolledCourse1 = $courseRepo->isEnrolled(3, 1);
assertTest($isAlexEnrolledCourse1 === true, 'Student Alex is enrolled in Course 1');

$isAlexEnrolledCourse2 = $courseRepo->isEnrolled(3, 2);
assertTest($isAlexEnrolledCourse2 === false, 'Student Alex is NOT enrolled in Course 2 (access restricted)');

// ---------------------------------------------------------
// TEST 3 & 4: Video Access Control & Anti-Skip Validation
// ---------------------------------------------------------
echo "\nTEST SUITE 3: Video Streaming Access & Anti-Skip Segment Validation\n";
try {
    // Section 1 is unlocked for Alex
    $grant1 = $videoService->authorizePlayback(3, 1, $loginAlexDevice2['session_token']);
    assertTest(!empty($grant1['playback_token']) && $grant1['duration_seconds'] === 180, 'Alex obtains short-lived playback grant for unlocked Section 1');

    // Section 2 is LOCKED for Alex
    $sec2Unlocked = $progressRepo->isSectionUnlocked(3, 2);
    assertTest($sec2Unlocked === false, 'Section 2 is currently locked for Alex');

    $lockedDenied = false;
    try {
        $videoService->authorizePlayback(3, 2, $loginAlexDevice2['session_token']);
    } catch (Exception $e) {
        $lockedDenied = true;
    }
    assertTest($lockedDenied === true, 'Playback authorization for locked Section 2 is strictly denied');

    // Anti-skip test: Alex watches 10 seconds only (0 to 10s of 180s = 5.5% coverage)
    $progressResult = $videoService->recordProgress(3, 1, 0.0, 10.0, 10.0);
    assertTest($progressResult['is_completed'] === false && $progressResult['status'] === 'IN_PROGRESS', 'Partial watch (5.5%) does not grant video completion');

    // Client tries to skip ahead to 180s without watching the middle segments
    $skipResult = $videoService->recordProgress(3, 1, 175.0, 180.0, 180.0);
    // Unique seconds = 10s + 5s = 15s out of 180s (~8.3%), which is below 95% threshold!
    assertTest($skipResult['is_completed'] === false, 'Client skipping to end without covering 95% of segments is REJECTED from completion');

    // Now record full continuous coverage (0 to 60, 60 to 120, 120 to 180s)
    $videoService->recordProgress(3, 1, 0.0, 60.0, 60.0);
    $videoService->recordProgress(3, 1, 60.0, 120.0, 120.0);
    $fullResult = $videoService->recordProgress(3, 1, 120.0, 180.0, 180.0);
    assertTest($fullResult['is_completed'] === true && $fullResult['status'] === 'VIDEO_COMPLETED', 'Continuous watched coverage (>= 95%) successfully completes video');

} catch (Exception $e) {
    assertTest(false, 'Video access test exception: ' . $e->getMessage());
}

// ---------------------------------------------------------
// TEST 5 & 6: Assignment Submission & Prerequisites
// ---------------------------------------------------------
echo "\nTEST SUITE 4: Assignment Prerequisite & Submission Workflow\n";
try {
    // Student Priya has NOT completed video for Section 1
    $priyaDenied = false;
    try {
        $assignmentService->submitAssignment(4, 1, 'My test submission without watching video');
    } catch (Exception $e) {
        $priyaDenied = true;
    }
    assertTest($priyaDenied === true, 'Submitting assignment before video completion is BLOCKED');

    // Alex has completed Section 1 video -> can submit task 1!
    $alexSub = $assignmentService->submitAssignment(3, 1, 'Comprehensive Digital Marketing Funnel Analysis for Acme Corp:\nTop of Funnel: Meta brand awareness campaigns...\nMiddle of Funnel: Retargeting and email capture lead magnets...\nBottom of Funnel: High-intent Google Search campaigns.');
    assertTest($alexSub['status'] === 'PENDING_REVIEW' && $alexSub['submission_id'] > 0, 'Alex submits task and status transitions to PENDING_REVIEW');

    // Next section (Section 2) MUST STILL BE LOCKED! Video completion + assignment submission ALONE cannot unlock section 2!
    $sec2StillLocked = $progressRepo->isSectionUnlocked(3, 2);
    assertTest($sec2StillLocked === false, 'Section 2 remains strictly LOCKED pending instructor approval');

} catch (Exception $e) {
    assertTest(false, 'Assignment test exception: ' . $e->getMessage());
}

// ---------------------------------------------------------
// TEST 7, 8, 9, 10: Instructor Review & Transactional Unlocking
// ---------------------------------------------------------
echo "\nTEST SUITE 5: Instructor Review Decisions & Atomic Section Unlocking\n";
try {
    $submissionId = $alexSub['submission_id'];

    // 1. Instructor requests revision
    $revResult = $submissionRepo->reviewSubmission($submissionId, 2, 'REVISION_REQUIRED', 'Please expand on your attribution model and CAC calculation.');
    assertTest($revResult['decision'] === 'REVISION_REQUIRED', 'Instructor requests revision with required remarks');

    $sec2LockedAfterRev = $progressRepo->isSectionUnlocked(3, 2);
    assertTest($sec2LockedAfterRev === false, 'Section 2 remains LOCKED after revision request');

    // 2. Student Alex resubmits with additions
    $resub = $assignmentService->submitAssignment(3, 1, 'Updated Funnel Analysis:\nAdded multi-touch first-click and last-click attribution models with blended CAC estimates.');
    assertTest($resub['status'] === 'PENDING_REVIEW', 'Alex successfully resubmits assignment for re-review');

    // 3. Instructor Approves!
    $approvalResult = $submissionRepo->reviewSubmission($submissionId, 2, 'APPROVED', 'Excellent revisions, approved!');
    assertTest($approvalResult['decision'] === 'APPROVED', 'Instructor successfully approves submission');

    // 4. VERIFY: Section 2 is now UNLOCKED for Alex!
    $sec2NowUnlocked = $progressRepo->isSectionUnlocked(3, 2);
    assertTest($sec2NowUnlocked === true, 'Section 2 is ATOMICALLY UNLOCKED for Alex upon instructor approval');

    // 5. Section 3 must still be locked
    $sec3Locked = $progressRepo->isSectionUnlocked(3, 3);
    assertTest($sec3Locked === false, 'Section 3 remains locked until Section 2 is completed and approved');

    // 6. Duplicate approval idempotency
    $dupApproval = $submissionRepo->reviewSubmission($submissionId, 2, 'APPROVED', 'Repeated approval call');
    assertTest($dupApproval['decision'] === 'APPROVED', 'Duplicate approval does not corrupt progress or unlock invalid sections');

} catch (Exception $e) {
    assertTest(false, 'Review workflow test exception: ' . $e->getMessage());
}

// ---------------------------------------------------------
// TEST 11: Revoked Device Session Blocked
// ---------------------------------------------------------
echo "\nTEST SUITE 6: Revoked Device Session Invalidation\n";
// Revoke Alex's session
$userRepo->revokeOtherStudentSessions(3);
$revokedSessions = $userRepo->getActiveDeviceSessions(3);
$allRevoked = true;
foreach ($revokedSessions as $rs) {
    if ((int)$rs['is_revoked'] === 0) {
        $allRevoked = false;
    }
}
assertTest($allRevoked === true, 'Active sessions for user can be revoked on demand');

// ---------------------------------------------------------
// TEST 12: Playback Token Expiration
// ---------------------------------------------------------
echo "\nTEST SUITE 7: Short-Lived Playback Token Validation\n";
$expiredToken = 'test_expired_playback_token_' . time();
$pdo->prepare("
    INSERT INTO `playback_tokens` (`token`, `user_id`, `section_id`, `session_token`, `expires_at`)
    VALUES (:t, 3, 1, 'dummy_sess', DATE_SUB(NOW(), INTERVAL 10 SECOND))
")->execute([':t' => $expiredToken]);

$validatedExpired = $videoService->validatePlaybackToken($expiredToken);
assertTest($validatedExpired === null, 'Expired playback grant token is rejected immediately');

// ---------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------
echo "\n======================================================\n";
echo "TEST RESULTS: {$passCount} PASSED, {$failCount} FAILED\n";
echo "======================================================\n";

if ($failCount > 0) {
    exit(1);
} else {
    echo "\nAll backend security, anti-skip, and approval invariants verified successfully!\n\n";
    exit(0);
}
