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
    $to = 'info@rushhealthc.com'; // Recipient email address

    // Validate email address
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email address']);
        exit;
    }

    $subject = 'RUSH Platform Launch Notification Signup';
    $message = "Email address for launch notifications: $email";
    $headers = "From: $email\r\nReply-To: $email\r\nContent-type: text/plain";

    if (mail($to, $subject, $message, $headers)) {
        http_response_code(200);
        echo json_encode(['message' => 'Thank you! We\'ll notify you when RUSH launches.']);
    } else {
        // Log the error (if you have a logging mechanism)
        error_log("Failed to send email: " . error_get_last()['message']);
        http_response_code(500);
        echo json_encode(['error' => 'Error sending email. Please try again later.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Invalid request method']);
}
?>