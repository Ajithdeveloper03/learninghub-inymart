<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Database.php';

use App\Utils\Database;

$pdo = Database::getConnection();

// 1. Add phone column if not exists
try {
    $pdo->exec("ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(25) NULL AFTER `email`");
    echo "Added phone column to users table.\n";
} catch (Exception $e) {
    echo "Phone column already exists or skipped: " . $e->getMessage() . "\n";
}

// 2. Set superadmin password to Admin@123456
$hashAdmin = password_hash('Admin@123456', PASSWORD_BCRYPT);
$stmt = $pdo->prepare("UPDATE `users` SET `password_hash` = :p WHERE `username` = 'superadmin'");
$stmt->execute([':p' => $hashAdmin]);
echo "Updated superadmin password to Admin@123456.\n";

// 3. Set student_alex password to Student@123
$hashStudent = password_hash('Student@123', PASSWORD_BCRYPT);
$stmt = $pdo->prepare("UPDATE `users` SET `password_hash` = :p WHERE `username` = 'student_alex'");
$stmt->execute([':p' => $hashStudent]);
echo "Updated student_alex password to Student@123.\n";

// 4. Truncate rate limits
$pdo->exec("TRUNCATE TABLE `rate_limits`");
echo "Cleared rate limits.\n";

echo "ALL UPDATES COMPLETE.\n";
