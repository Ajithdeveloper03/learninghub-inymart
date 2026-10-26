<?php
declare(strict_types=1);

$envFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
$env = [];
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (str_contains($line, '=')) {
            [$k, $v] = explode('=', $line, 2);
            $env[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
        }
    }
}

return [
    'host' => $env['DB_HOST'] ?? (getenv('DB_HOST') ?: '127.0.0.1'),
    'port' => (int)($env['DB_PORT'] ?? (getenv('DB_PORT') ?: 3306)),
    'database' => $env['DB_NAME'] ?? (getenv('DB_NAME') ?: 'dm_academy_lms'),
    'username' => $env['DB_USER'] ?? (getenv('DB_USER') ?: 'root'),
    'password' => $env['DB_PASS'] ?? (getenv('DB_PASS') !== false ? getenv('DB_PASS') : ''),
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
];
