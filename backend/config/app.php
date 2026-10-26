<?php
declare(strict_types=1);

return [
    'name' => 'Secure Digital Marketing Academy LMS',
    'env' => getenv('APP_ENV') ?: 'development',
    'debug' => (bool)(getenv('APP_DEBUG') ?: true),
    'url' => getenv('APP_URL') ?: 'http://localhost:8000',
    'frontend_url' => getenv('FRONTEND_URL') ?: 'http://localhost:3000',
    'jwt_secret' => getenv('JWT_SECRET') ?: 'dm-academy-secure-super-secret-key-32chars-2026',
    'jwt_expires_in' => 86400 * 7, // 7 days
    'playback_token_lifetime' => 300, // 5 minutes short-lived playback grant
    'watch_completion_threshold' => 95.0, // 95% watched segments required
    'storage' => [
        'base' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage',
        'videos' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'videos',
        'submissions' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'submissions',
        'logs' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'logs',
    ],
    'rate_limits' => [
        'login_max_attempts' => 5,
        'login_lockout_seconds' => 300, // 5 min lockout
    ],
    'max_upload_size' => 25 * 1024 * 1024, // 25 MB
];
