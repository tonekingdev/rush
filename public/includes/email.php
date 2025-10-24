<?php
/**
 * Email functions for Rush Healthcare Admin
 */

// Load configuration if not already loaded
if (!isset($config)) {
    $config = require_once dirname(__FILE__) . '/config.php';
}

/**
 * Send an email using PHPMailer
 * 
 * @param string $to Recipient email
 * @param string $subject Email subject
 * @param string $body Email body (HTML)
 * @param string $altBody Plain text alternative
 * @param array $attachments Optional array of attachments
 * @return array Result with success status and message
 */
function send_email($to, $subject, $body, $altBody = '', $attachments = []) {
    global $config;
    
    // Check if PHPMailer is installed
    if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        if (file_exists(dirname(__FILE__) . '/../vendor/autoload.php')) {
            require_once dirname(__FILE__) . '/../vendor/autoload.php';
        } else {
            return [
                'success' => false,
                'message' => 'PHPMailer not found. Please install it using Composer.'
            ];
        }
    }
    
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = $config['SMTP_HOST'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['SMTP_USER'];
        $mail->Password = $config['SMTP_PASS'];
        $mail->SMTPSecure = $config['SMTP_SECURE'];
        $mail->Port = $config['SMTP_PORT'];
        
        // Recipients
        $mail->setFrom($config['SMTP_USER'], 'RUSH Healthcare');
        $mail->addAddress($to);
        $mail->addReplyTo($config['SMTP_USER'], 'RUSH Healthcare');
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = $altBody ?: strip_tags($body);
        
        // Attachments
        if (!empty($attachments)) {
            foreach ($attachments as $attachment) {
                if (is_array($attachment) && isset($attachment['path']) && isset($attachment['name'])) {
                    $mail->addAttachment($attachment['path'], $attachment['name']);
                } elseif (is_string($attachment) && file_exists($attachment)) {
                    $mail->addAttachment($attachment);
                }
            }
        }
        
        $mail->send();
        
        return [
            'success' => true,
            'message' => 'Email sent successfully'
        ];
    } catch (Exception $e) {
        // Log the error using the existing log_error function
        log_error([
            'message' => 'Email sending failed',
            'error' => $mail->ErrorInfo,
            'to' => $to,
            'subject' => $subject
        ]);
        
        return [
            'success' => false,
            'message' => 'Email could not be sent: ' . $mail->ErrorInfo
        ];
    }
}

/**
 * Send a notification email to admin
 * 
 * @param string $subject Email subject
 * @param string $message Email message
 * @return array Result with success status and message
 */
function send_admin_notification($subject, $message) {
    global $config;
    
    // Default admin email if not set in config
    $adminEmail = $config['ADMIN_EMAIL'] ?? $config['SMTP_USER'];
    
    $body = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1586D6; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>RUSH Healthcare Notification</h2>
            </div>
            <div class="content">
                <h3>' . $subject . '</h3>
                <p>' . $message . '</p>
            </div>
            <div class="footer">
                <p>This is an automated message from RUSH Healthcare.</p>
                <p>Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    ';
    
    return send_email($adminEmail, $subject, $body);
}

/**
 * Send a password reset email
 * 
 * @param string $email User email
 * @param string $resetToken Reset token
 * @param string $username Username
 * @return array Result with success status and message
 */
function send_password_reset_email($email, $resetToken, $username) {
    global $config;
    
    // Base URL for the application
    $appUrl = isset($config['APP_URL']) ? $config['APP_URL'] : 
             (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
    
    $resetUrl = $appUrl . '/admin/reset-password.php?token=' . urlencode($resetToken) . '&email=' . urlencode($email);
    
    $subject = 'Password Reset Request - RUSH Healthcare';
    
    $body = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1586D6; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #1586D6; color: #ffffff; text-decoration: none; border-radius: 4px; }
            .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Password Reset Request</h2>
            </div>
            <div class="content">
                <p>Hello ' . $username . ',</p>
                <p>We received a request to reset your password for your RUSH Healthcare account.</p>
                <p>To reset your password, click the button below:</p>
                <p style="text-align: center;">
                    <a href="' . $resetUrl . '" class="button">Reset Password</a>
                </p>
                <p>If you did not request a password reset, please ignore this email or contact the administrator.</p>
                <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
                <p>This is an automated message from RUSH Healthcare.</p>
                <p>Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    ';
    
    return send_email($email, $subject, $body);
}