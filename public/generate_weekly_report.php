<?php
require __DIR__ . '/vendor/autoload.php';
$config = require __DIR__ . '/../includes/config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Set up error logging
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log.txt');
error_reporting(E_ALL);

function logMessage($message) {
    error_log(date('[Y-m-d H:i:s] ') . $message . "\n", 3, __DIR__ . '/weekly_report_log.txt');
}

logMessage("Script started");

try {
    // Database connection
    $servername = "localhost";
    $username = $config['DB_USER'];
    $password = $config['DB_PASS'];
    $dbname = $config['DB_NAME'];

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    logMessage("Database connection successful");

    // Get surveys from the previous week
    $sql = "SELECT 'patient' as type, id, full_name, date_of_birth, email, phone_number, zip_code, 
               interest_reasons, anticipated_services, medical_conditions, has_pcp, 
               taking_medications, has_insurance, insurance_provider, 
               interested_in_payment_plans, accessibility_needs, additional_info, submitted_at 
        FROM patient_surveys 
        WHERE submitted_at >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 1 WEEK)
          AND submitted_at < DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        UNION ALL
        SELECT 'provider' as type, id, name as full_name, '' as date_of_birth, email, phone, 
               '' as zip_code, '' as interest_reasons, '' as anticipated_services, 
               '' as medical_conditions, '' as has_pcp, '' as taking_medications, 
               '' as has_insurance, '' as insurance_provider, 
               '' as interested_in_payment_plans, '' as accessibility_needs, 
               additional_comments as additional_info, submitted_at
        FROM provider_surveys 
        WHERE submitted_at >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 1 WEEK)
          AND submitted_at < DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)";

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    logMessage("Query executed successfully. Found " . $result->num_rows . " surveys");

    // Prepare report content
    $survey_data = "";
    while ($row = $result->fetch_assoc()) {
        $survey_data .= '<div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 20px; margin-bottom: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';
        $survey_data .= '<h2 style="color: #1586D6; margin-top: 0; font-size: 18px; font-weight: 600;">Survey Type: ' . ucfirst($row['type']) . '</h2>';
        $survey_data .= '<div style="margin-bottom: 10px;"><strong>Submitted At:</strong> ' . date('F j, Y g:i a', strtotime($row['submitted_at'])) . '</div>';
        
        foreach ($row as $key => $value) {
            if ($key != 'type' && $key != 'submitted_at' && $value !== '') {
                $label = ucwords(str_replace('_', ' ', $key));
                $survey_data .= '<div style="margin-bottom: 8px;"><strong>' . $label . ':</strong> ' . htmlspecialchars($value) . '</div>';
            }
        }
        $survey_data .= '</div>';
    }

    $conn->close();
    logMessage("Database connection closed");

    // Load HTML template
    $html_template = file_get_contents(__DIR__ . '/email_template.html');

    // Create Summary
    $summary = '<div style="font-size: 14px; line-height: 1.6;">';
    $summary .= '<div style="margin-bottom: 10px;"><strong>New surveys from last week:</strong> ' . $result->num_rows . '</div>';
    $summary .= '<div style="margin-bottom: 10px;"><strong>Report period:</strong> ' . date('F j', strtotime('last week monday')) . ' - ' . date('F j, Y', strtotime('last week sunday')) . '</div>';
    $summary .= '<div style="margin-bottom: 10px;"><strong>Report generated on:</strong> ' . date('F j, Y, g:i a') . '</div>';
    $summary .= '</div>';

    // Replace placeholders in the template
    $html_content = str_replace(
        ['{SUMMARY}', '{SURVEY_DATA}', '{YEAR}'],
        [$summary, $survey_data, date('Y')],
        $html_template
    );

    // Send email with more detailed error reporting
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->isSMTP();
        $mail->Host       = $config['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $config['SMTP_USER'];
        $mail->Password   = $config['SMTP_PASS'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
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
        $mail->addAddress('reports@rushhealthc.com');

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'RUSH Healthcare Weekly Survey Report';
        $mail->Body    = $html_content;
        $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $html_content));

        logMessage("Attempting to send email");
        $mail->send();
        logMessage("Weekly report sent successfully");
        echo "Weekly report sent successfully";
    } catch (Exception $e) {
        logMessage("Detailed Mailer Error: " . $mail->ErrorInfo);
        throw new Exception("Email could not be sent. Mailer Error: " . $mail->ErrorInfo);
    }

} catch (Exception $e) {
    logMessage("Error: " . $e->getMessage());
    echo "Failed to generate or send weekly report. Check the log file for details.";
}