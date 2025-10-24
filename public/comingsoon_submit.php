<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);

    // Validate email address
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email address']);
        exit;
    }

    // Load configuration and PHPMailer
    $config = require 'config.php';
    require 'vendor/autoload.php';

    // Load email template
    $html_template = file_get_contents(__DIR__ . '/comingsoon_email_template.html');

    // Replace placeholders in template
    $html_content = str_replace(
        ['{EMAIL}', '{DATE}', '{YEAR}'],
        [$email, date('F j, Y, g:i a'), date('Y')],
        $html_template
    );

    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $config['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $config['SMTP_USER'];
        $mail->Password   = $config['SMTP_PASS'];
        $mail->SMTPSecure = $config['SMTP_SECURE'];
        $mail->Port       = $config['SMTP_PORT'];

        $mail->setFrom('noreply@rushhealthc.com', 'RUSH Platform');
        $mail->addAddress('info@rushhealthc.com');
        $mail->isHTML(true);
        $mail->Subject = "New RUSH Platform Launch Notification Signup";
        $mail->Body    = $html_content;
        $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $html_content));

        if ($mail->send()) {
            http_response_code(200);
            echo json_encode(['message' => 'Thank you! We\'ll notify you when RUSH launches.']);
        } else {
            throw new Exception('Failed to send email');
        }
    } catch (Exception $e) {
        error_log("Failed to send email: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error sending email. Please try again later.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Invalid request method']);
}