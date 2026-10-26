<?php
declare(strict_types=1);

namespace App\Utils;

class Validator
{
    private array $errors = [];

    public function validate(array $data, array $rules): bool
    {
        $this->errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;

            foreach ($fieldRules as $rule) {
                if ($rule === 'required') {
                    if ($value === null || (is_string($value) && trim($value) === '')) {
                        $this->addError($field, "The {$field} field is required.");
                        break;
                    }
                } elseif (str_starts_with($rule, 'min:')) {
                    $min = (int)substr($rule, 4);
                    if ($value !== null && strlen((string)$value) < $min) {
                        $this->addError($field, "The {$field} must be at least {$min} characters.");
                    }
                } elseif (str_starts_with($rule, 'max:')) {
                    $max = (int)substr($rule, 4);
                    if ($value !== null && strlen((string)$value) > $max) {
                        $this->addError($field, "The {$field} may not exceed {$max} characters.");
                    }
                } elseif ($rule === 'email') {
                    if ($value !== null && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $this->addError($field, "The {$field} must be a valid email address.");
                    }
                } elseif ($rule === 'numeric') {
                    if ($value !== null && !is_numeric($value)) {
                        $this->addError($field, "The {$field} must be a number.");
                    }
                } elseif ($rule === 'password_strong') {
                    if ($value !== null) {
                        if (strlen((string)$value) < 8 ||
                            !preg_match('/[A-Z]/', (string)$value) ||
                            !preg_match('/[a-z]/', (string)$value) ||
                            !preg_match('/[0-9]/', (string)$value)) {
                            $this->addError($field, "The {$field} must be at least 8 characters and contain uppercase, lowercase, and numbers.");
                        }
                    }
                } elseif (str_starts_with($rule, 'in:')) {
                    $options = explode(',', substr($rule, 3));
                    if ($value !== null && !in_array((string)$value, $options, true)) {
                        $this->addError($field, "The selected {$field} is invalid.");
                    }
                }
            }
        }

        return empty($this->errors);
    }

    public function validateFile(array $file, array $allowedExtensions, int $maxBytes): ?string
    {
        if (!isset($file['error']) || is_array($file['error'])) {
            return 'Invalid file upload parameters.';
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            return match ($file['error']) {
                UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File exceeds maximum upload size limit.',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded.',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
                default => 'File upload failed with error code ' . $file['error'],
            };
        }

        if ($file['size'] > $maxBytes) {
            return sprintf('File size (%0.2f MB) exceeds allowed limit of %0.2f MB.', $file['size'] / (1024 * 1024), $maxBytes / (1024 * 1024));
        }

        $filename = $file['name'];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (!in_array($ext, $allowedExtensions, true)) {
            return 'File extension .' . htmlspecialchars($ext) . ' is not permitted. Allowed: ' . implode(', ', $allowedExtensions);
        }

        // Additional MIME check
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        $disallowedMimes = ['application/x-php', 'text/x-php', 'application/x-httpd-php', 'application/javascript', 'application/x-executable', 'application/x-msdos-program'];
        if (in_array($mime, $disallowedMimes, true)) {
            return 'Executable or script files are strictly forbidden.';
        }

        return null;
    }

    private function addError(string $field, string $message): void
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public static function sanitize(mixed $data): mixed
    {
        if (is_array($data)) {
            foreach ($data as $k => $v) {
                $data[$k] = self::sanitize($v);
            }
            return $data;
        }
        if (is_string($data)) {
            return htmlspecialchars(trim($data), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        }
        return $data;
    }
}
