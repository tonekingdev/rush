<?php
$config = require __DIR__ . '/../includes/config.php';

// Add these lines to properly include PHPMailer - IMPORTANT!
require __DIR__ . '/vendor/autoload.php';
// If the above doesn't work, try these alternative includes:
// require __DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php';
// require __DIR__ . '/vendor/phpmailer/phpmailer/src/SMTP.php';
// require __DIR__ . '/vendor/phpmailer/phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Set up error display for testing
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Provider Email Test</h1>";

try {
    // Check if PDF files exist
    $backgroundCheckPDF = __DIR__ . '/Background_Check_Instructions.pdf';
    $malpracticePDF = __DIR__ . '/Malpractice_Insurance_Worksheet.pdf';
    
    echo "<h2>Checking PDF Files:</h2>";
    
    if (file_exists($backgroundCheckPDF)) {
        echo "<p style='color:green'>✓ Background Check PDF found at: $backgroundCheckPDF</p>";
        echo "<p>File size: " . round(filesize($backgroundCheckPDF) / 1024) . " KB</p>";
    } else {
        echo "<p style='color:red'>✗ Background Check PDF NOT found at: $backgroundCheckPDF</p>";
    }
    
    if (file_exists($malpracticePDF)) {
        echo "<p style='color:green'>✓ Malpractice PDF found at: $malpracticePDF</p>";
        echo "<p>File size: " . round(filesize($malpracticePDF) / 1024) . " KB</p>";
    } else {
        echo "<p style='color:red'>✗ Malpractice PDF NOT found at: $malpracticePDF</p>";
    }
    
    // Check email template
    $template_path = __DIR__ . '/provider_email_template.html';
    echo "<h2>Checking Email Template:</h2>";
    
    if (file_exists($template_path)) {
        echo "<p style='color:green'>✓ Email template found at: $template_path</p>";
        $html_template = file_get_contents($template_path);
        $html_template = str_replace('{YEAR}', date('Y'), $html_template);
    } else {
        echo "<p style='color:red'>✗ Email template NOT found at: $template_path</p>";
        $html_template = "<html><body><h1>Test Email</h1><p>This is a test email.</p></body></html>";
    }
    
    // Check if PHPMailer class exists
    echo "<h2>Checking PHPMailer:</h2>";
    if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        echo "<p style='color:green'>✓ PHPMailer class found</p>";
    } else {
        echo "<p style='color:red'>✗ PHPMailer class NOT found. Please check your includes.</p>";
        
        // Try to find PHPMailer files
        $possible_paths = [
            __DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php',
            __DIR__ . '/PHPMailer/PHPMailer.php',
            __DIR__ . '/includes/PHPMailer/PHPMailer.php'
        ];
        
        echo "<p>Searching for PHPMailer in common locations:</p>";
        echo "<ul>";
        foreach ($possible_paths as $path) {
            if (file_exists($path)) {
                echo "<li style='color:green'>Found at: $path</li>";
            } else {
                echo "<li style='color:red'>Not found at: $path</li>";
            }
        }
        echo "</ul>";
        
        throw new Exception("PHPMailer class not found. Please check your includes.");
    }
    
    // Test sending an email to yourself
    echo "<h2>Send Test Email:</h2>";
    echo "<form method='post'>";
    echo "Send test email to: <input type='email' name='test_email' value='pastoryouthtone@gmail.com' required>";
    echo "<input type='submit' value='Send Test Email'>";
    echo "</form>";
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['test_email'])) {
        $test_email = $_POST['test_email'];
        
        $mail = new PHPMailer(true);
        
        // Server settings
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->isSMTP();
        $mail->Host       = $config['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $config['SMTP_USER'];
        $mail->Password   = $config['SMTP_PASS'];
        $mail->SMTPSecure = $config['SMTP_SECURE'];
        $mail->Port       = $config['SMTP_PORT'];

        // Additional SMTP settings for Hostinger
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );

        // Recipients
        $mail->setFrom($config['SMTP_USER'], 'RUSH Healthcare');
        $mail->addAddress($test_email, 'Test User');

        // Attachments
        if (file_exists($backgroundCheckPDF)) {
            $mail->addAttachment($backgroundCheckPDF, 'Background_Check_Instructions.pdf');
        }
        
        if (file_exists($malpracticePDF)) {
            $mail->addAttachment($malpracticePDF, 'Malpractice_Insurance_Worksheet.pdf');
        }

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'TEST - RUSH Providers Email';
        $mail->Body    = $html_template;
        $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $html_template));

        echo "<div style='background-color:#f0f0f0; padding:10px; margin-top:10px;'>";
        echo "<h3>SMTP Debug Output:</h3>";
        echo "<pre>";
        $mail->send();
        echo "</pre>";
        echo "<p style='color:green; font-weight:bold;'>✓ Test email sent successfully to $test_email!</p>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red; font-weight:bold;'>Error: " . $e->getMessage() . "</p>";
    
    if (isset($mail) && $mail instanceof PHPMailer) {
        echo "<p>Mailer Error: " . $mail->ErrorInfo . "</p>";
    }
}
?>