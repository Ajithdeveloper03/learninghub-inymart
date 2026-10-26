<?php
/**
 * Database Migration Script
 * Creates `dm_academy_lms` database and executes schema and seed data.
 */

declare(strict_types=1);

$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbPort = getenv('DB_PORT') ?: '3306';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$dbName = getenv('DB_NAME') ?: 'dm_academy_lms';

echo "=== DM Academy LMS Database Migration ===\n";
echo "Connecting to MySQL server at {$dbHost}:{$dbPort}...\n";

try {
    $pdo = new PDO("mysql:host={$dbHost};port={$dbPort};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    echo "Ensuring database `{$dbName}` exists...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `{$dbName}`;");

    echo "Running 001_create_tables.sql...\n";
    $schemaSql = file_get_contents(__DIR__ . '/001_create_tables.sql');
    if ($schemaSql === false) {
        throw new RuntimeException("Could not read 001_create_tables.sql");
    }
    $pdo->exec($schemaSql);
    echo "Tables created successfully.\n";

    echo "Running 002_seed_data.sql...\n";
    $seedSql = file_get_contents(__DIR__ . '/002_seed_data.sql');
    if ($seedSql === false) {
        throw new RuntimeException("Could not read 002_seed_data.sql");
    }
    $pdo->exec($seedSql);
    echo "Seed data inserted successfully.\n";

    // Verify row counts
    $tables = ['roles', 'users', 'courses', 'modules', 'sections', 'video_assets', 'assignments', 'course_enrollments', 'section_unlocks'];
    echo "\nVerification of created tables:\n";
    foreach ($tables as $t) {
        $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM `{$t}`");
        $row = $stmt->fetch();
        echo "  - Table `{$t}`: {$row['cnt']} rows\n";
    }

    echo "\n[SUCCESS] Database migration completed successfully!\n";
} catch (Exception $e) {
    echo "\n[ERROR] Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
