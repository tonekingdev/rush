<?php
// Display errors for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Load configuration
$config = require __DIR__ . '/../includes/config.php';

// Add the PHPMailer includes
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Function to log messages
function logMessage($message) {
    echo "$message<br>";
}

try {
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

    // Configure SMTP settings - using your config file keys
    $mail->isSMTP();
    $mail->Host = $config['SMTP_HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['SMTP_USER'];
    $mail->Password = $config['SMTP_PASS'];
    $mail->SMTPSecure = $config['SMTP_SECURE'];
    $mail->Port = $config['SMTP_PORT'];

    // Set email content
    $mail->isHTML(true);
    $mail->Subject = 'Big News, RUSH Providers! (TEST EMAIL)';
    $mail->Body = $html_template;
    $mail->AltBody = strip_tags(str_replace('<br>', "\n", $html_template));

    // Set sender - using the noreply address from your config
    $mail->setFrom($config['SMTP_USER'], 'RUSH Healthcare');
    
    // Add reply-to address
    $mail->addReplyTo('credentialing@rushhealthc.com', 'RUSH Credentialing Team');

    // Attach PDF files - using exact case-sensitive filenames
    $backgroundCheckPdf = __DIR__ . '/Background_Check_Instructions.pdf';
    $malpracticePdf = __DIR__ . '/Malpractice_Insurance_Worksheet.pdf';

    if (file_exists($backgroundCheckPdf)) {
        $mail->addAttachment($backgroundCheckPdf, 'Background Check Instructions.pdf');
        logMessage("✓ Background Check PDF attached");
    } else {
        logMessage("✗ Background check PDF not found at: $backgroundCheckPdf");
    }

    if (file_exists($malpracticePdf)) {
        $mail->addAttachment($malpracticePdf, 'Malpractice Insurance Worksheet.pdf');
        logMessage("✓ Malpractice Insurance PDF attached");
    } else {
        logMessage("✗ Malpractice insurance PDF not found at: $malpracticePdf");
    }

    // ===== TEST EMAIL SETTINGS =====
    // Enter the email addresses you want to send the test to
    $test_emails = [
        'pastoryouthtone@gmail.com',  // Replace with your email
        'realestatern2@gmail.com'  // Uncomment and replace with owner's email if desired
    ];

    // Send test emails
    foreach ($test_emails as $email) {
        try {
            // Clear previous recipients
            $mail->clearAddresses();
            
            // Add this test email
            $mail->addAddress($email);
            
            // Send the email
            $mail->send();
            
            logMessage("✓ Test email sent successfully to: $email");
            
        } catch (Exception $e) {
            logMessage("✗ Failed to send test email to $email: " . $e->getMessage());
        }
    }

    echo "<h2>Test Email Summary</h2>";
    echo "<p>The test email has been sent with the following updates:</p>";
    echo "<ul>";
    echo "<li>Correct domain: rushhealthc.com</li>";
    echo "<li>Business phone number: (586) 344-4567</li>";
    echo "<li>Removed app download information</li>";
    echo "<li>Updated PDF attachment names</li>";
    echo "</ul>";

} catch (Exception $e) {
    logMessage("Error: " . $e->getMessage());
}
?>