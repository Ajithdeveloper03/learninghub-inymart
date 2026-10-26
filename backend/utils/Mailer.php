<?php
declare(strict_types=1);

namespace App\Utils;

use Exception;

class Mailer
{
    private string $host = 'smtp.gmail.com';
    private int $port = 465; // SSL port for Gmail (or 587 for TLS)
    private string $username = 'inymart@gmail.com';
    private string $password = 'cilktyahmvauqdsw'; // App password without spaces

    public function sendStudentWelcomeEmail(string $toEmail, string $fullName, string $username, string $password, ?string $phone = null): bool
    {
        $subject = "Welcome to Inymart Academy - Your Student Portal Login Credentials";
        
        $body = "
<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8'>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
  .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 800; }
  .header p { margin: 0; font-size: 13px; opacity: 0.9; }
  .content { padding: 32px 28px; line-height: 1.6; }
  .box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin: 24px 0; }
  .box table { width: 100%; border-collapse: collapse; }
  .box td { padding: 8px 4px; font-size: 14px; }
  .box td.label { font-weight: 700; color: #9a3412; width: 40%; }
  .box td.value { font-family: monospace; font-size: 15px; font-weight: 600; color: #0f172a; }
  .cta { text-align: center; margin: 30px 0; }
  .cta a { background: #ea580c; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; display: inline-block; }
  .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class='container'>
  <div class='header'>
    <h1>Inymart Academy</h1>
    <p>The Branding Fox &bull; ISO 9001:2015 Certified Institution</p>
  </div>
  <div class='content'>
    <h2 style='font-size: 18px; color: #0f172a; margin-top: 0;'>Welcome, {$fullName}!</h2>
    <p style='font-size: 14px; color: #475569;'>
      Your student account at Inymart Digital Marketing Academy has been successfully provisioned by the administration team.
    </p>
    
    <div class='box'>
      <div style='font-size: 12px; font-weight: 800; text-transform: uppercase; color: #ea580c; margin-bottom: 12px; letter-spacing: 0.5px;'>
        Student Portal Login Credentials
      </div>
      <table>
        <tr><td class='label'>Portal URL:</td><td class='value'><a href='http://localhost:3000/learninghub/login' style='color:#ea580c;'>http://localhost:3000/learninghub/login</a></td></tr>
        <tr><td class='label'>Username / Login ID:</td><td class='value'>{$username}</td></tr>
        <tr><td class='label'>Assigned Password:</td><td class='value'>{$password}</td></tr>
        " . ($phone ? "<tr><td class='label'>Registered Mobile:</td><td class='value'>{$phone}</td></tr>" : "") . "
      </table>
    </div>

    <div style='background: #f8fafc; border-left: 4px solid #ea580c; padding: 12px 16px; font-size: 12px; color: #475569; margin-bottom: 24px;'>
      <strong>Security Notice:</strong> The academy enforces a Single Active Device policy and anti-skip video progress verification. Please do not share these credentials with anyone.
    </div>

    <div class='cta'>
      <a href='http://localhost:3000/learninghub/login'>Access Student Portal &rarr;</a>
    </div>
  </div>
  <div class='footer'>
    &copy; " . date('Y') . " Inymart Academy (The Branding Fox). Chennai & Coimbatore, Tamil Nadu, India.<br>
    For assistance, contact admissions@inymart.com or call +91 98765 43210.
  </div>
</div>
</body>
</html>
";

        return $this->sendRawSmtp($toEmail, $fullName, $subject, $body);
    }

    public function sendRawSmtp(string $toEmail, string $toName, string $subject, string $htmlBody): bool
    {
        // Remove spaces from app password just in case user pasted with spaces
        $cleanPassword = str_replace(' ', '', $this->password);
        
        $socket = @fsockopen("ssl://{$this->host}", $this->port, $errno, $errstr, 15);
        if (!$socket) {
            // Try TLS on port 587 as fallback
            return $this->sendRawSmtpTls($toEmail, $toName, $subject, $htmlBody, $cleanPassword);
        }

        try {
            $this->readResponse($socket);

            $this->sendCommand($socket, "EHLO " . gethostname());
            $this->sendCommand($socket, "AUTH LOGIN");
            $this->sendCommand($socket, base64_encode($this->username));
            $this->sendCommand($socket, base64_encode($cleanPassword));

            $this->sendCommand($socket, "MAIL FROM: <{$this->username}>");
            $this->sendCommand($socket, "RCPT TO: <{$toEmail}>");
            $this->sendCommand($socket, "DATA");

            $headers = [
                "From: Inymart Academy <{$this->username}>",
                "To: {$toName} <{$toEmail}>",
                "Subject: {$subject}",
                "MIME-Version: 1.0",
                "Content-Type: text/html; charset=UTF-8",
                "Date: " . date('r'),
            ];

            $message = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
            $this->sendCommand($socket, $message);
            $this->sendCommand($socket, "QUIT");

            fclose($socket);
            return true;
        } catch (Exception $e) {
            if (is_resource($socket)) fclose($socket);
            error_log("SMTP Error (SSL:465): " . $e->getMessage());
            // Try TLS:587 as fallback
            return $this->sendRawSmtpTls($toEmail, $toName, $subject, $htmlBody, $cleanPassword);
        }
    }

    private function sendRawSmtpTls(string $toEmail, string $toName, string $subject, string $htmlBody, string $cleanPassword): bool
    {
        $socket = @fsockopen($this->host, 587, $errno, $errstr, 15);
        if (!$socket) {
            throw new Exception("Unable to connect to SMTP server: {$errstr} ({$errno})");
        }

        try {
            $this->readResponse($socket);
            $this->sendCommand($socket, "EHLO " . gethostname());
            $this->sendCommand($socket, "STARTTLS");

            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new Exception("Failed to start TLS encryption");
            }

            $this->sendCommand($socket, "EHLO " . gethostname());
            $this->sendCommand($socket, "AUTH LOGIN");
            $this->sendCommand($socket, base64_encode($this->username));
            $this->sendCommand($socket, base64_encode($cleanPassword));

            $this->sendCommand($socket, "MAIL FROM: <{$this->username}>");
            $this->sendCommand($socket, "RCPT TO: <{$toEmail}>");
            $this->sendCommand($socket, "DATA");

            $headers = [
                "From: Inymart Academy <{$this->username}>",
                "To: {$toName} <{$toEmail}>",
                "Subject: {$subject}",
                "MIME-Version: 1.0",
                "Content-Type: text/html; charset=UTF-8",
                "Date: " . date('r'),
            ];

            $message = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
            $this->sendCommand($socket, $message);
            $this->sendCommand($socket, "QUIT");

            fclose($socket);
            return true;
        } catch (Exception $e) {
            if (is_resource($socket)) fclose($socket);
            error_log("SMTP Error (TLS:587): " . $e->getMessage());
            throw $e;
        }
    }

    private function sendCommand($socket, string $command): string
    {
        fputs($socket, $command . "\r\n");
        return $this->readResponse($socket);
    }

    private function readResponse($socket): string
    {
        $response = "";
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) == " ") {
                break;
            }
        }
        $code = (int)substr($response, 0, 3);
        if ($code >= 400) {
            throw new Exception("SMTP Error {$code}: {$response}");
        }
        return $response;
    }
}
