<?php
// Set error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Load configuration
$config = require __DIR__ . '/../includes/config.php';

// Add the PHPMailer includes
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Function to log messages - renamed to avoid conflicts
function send_email_log($message) {
    $logFile = __DIR__ . '/email_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

try {
    send_email_log("Starting provider email process");
    
    // Connect to the database - using correct config keys
    $mysqli = new mysqli(
        $config['DB_HOST'],
        $config['DB_USER'],
        $config['DB_PASS'],
        $config['DB_NAME']
    );

    if ($mysqli->connect_error) {
        throw new Exception("Database connection failed: " . $mysqli->connect_error);
    }
    
    send_email_log("Database connection successful");

    // Check if provider_emails table exists
    $tableCheck = $mysqli->query("SHOW TABLES LIKE 'provider_emails'");
    if ($tableCheck->num_rows == 0) {
        send_email_log("provider_emails table does not exist. Running create_provider_group.php");
        
        // Include the create_provider_group.php script to create/populate the table
        include __DIR__ . '/create_provider_group.php';
        
        send_email_log("Finished running create_provider_group.php");
    }

    // Get provider emails from the database - using the correct table name
    $query = "SELECT email FROM provider_emails WHERE status = 'active'";
    $result = $mysqli->query($query);

    if (!$result) {
        throw new Exception("Database query failed: " . $mysqli->error);
    }

    // Collect all emails
    $provider_emails = [];
    while ($row = $result->fetch_assoc()) {
        // Only add unique emails
        if (!in_array($row['email'], $provider_emails)) {
            $provider_emails[] = $row['email'];
        }
    }

    // Close database connection
    $mysqli->close();

    // Check if we have any emails to send
    if (empty($provider_emails)) {
        send_email_log("No provider emails found in the database.");
        exit;
    }

    send_email_log("Found " . count($provider_emails) . " unique provider emails.");

    // Load email template
    $template_path = __DIR__ . '/provider_email_template.html';
    if (!file_exists($template_path)) {
        throw new Exception("Email template not found at: $template_path");
    }

    $html_template = file_get_contents($template_path);

    // Replace placeholders
    $html_template = str_replace('{YEAR}', date('Y'), $html_template);
    $html_template = str_replace('{BUSINESS_PHONE}', '(586) 344-4567', $html_template);

    // Create a new PHPMailer instance
    $mail = new PHPMailer(true);

    // Configure SMTP settings - using correct config keys
    $mail->isSMTP();
    $mail->Host = $config['SMTP_HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['SMTP_USER'];
    $mail->Password = $config['SMTP_PASS'];
    $mail->SMTPSecure = $config['SMTP_SECURE'];
    $mail->Port = $config['SMTP_PORT'];

    // Set email content
    $mail->isHTML(true);
    $mail->Subject = 'Big News, RUSH Providers!';
    $mail->Body = $html_template;
    $mail->AltBody = strip_tags(str_replace('<br>', "\n", $html_template));

    // Set sender - using SMTP_USER as from_email since it's not in config
    $mail->setFrom($config['SMTP_USER'], 'RUSH Healthcare');
    
    // Add reply-to address
    $mail->addReplyTo('credentialing@rushhealthc.com', 'RUSH Credentialing Team');

    // Attach PDF files - directly from root directory
    $backgroundCheckPdf = __DIR__ . '/Background_Check_Instructions.pdf';
    $malpracticePdf = __DIR__ . '/Malpractice_Insurance_Worksheet.pdf';

    if (file_exists($backgroundCheckPdf)) {
        $mail->addAttachment($backgroundCheckPdf, 'Background Check Instructions.pdf');
        send_email_log("Background Check PDF attached from: $backgroundCheckPdf");
    } else {
        send_email_log("Warning: Background check PDF not found at: $backgroundCheckPdf");
    }

    if (file_exists($malpracticePdf)) {
        $mail->addAttachment($malpracticePdf, 'Malpractice Insurance Worksheet.pdf');
        send_email_log("Malpractice Insurance PDF attached from: $malpracticePdf");
    } else {
        send_email_log("Warning: Malpractice insurance PDF not found at: $malpracticePdf");
    }

    // Send emails to each provider
    $success_count = 0;
    $failure_count = 0;

    foreach ($provider_emails as $email) {
        try {
            // Clear previous recipients
            $mail->clearAddresses();
            
            // Add this provider's email
            $mail->addAddress($email);
            
            // Send the email
            $mail->send();
            
            send_email_log("Email sent successfully to: $email");
            $success_count++;
            
            // Add a small delay to avoid overwhelming the SMTP server
            usleep(500000); // 0.5 seconds
            
        } catch (Exception $e) {
            send_email_log("Failed to send email to $email: " . $e->getMessage());
            $failure_count++;
        }
    }

    // Log summary
    send_email_log("Email sending complete. Successfully sent: $success_count, Failed: $failure_count");

} catch (Exception $e) {
    send_email_log("Error: " . $e->getMessage());
}
?>