<?php
session_start();

// Include necessary files with absolute paths
$rootPath = dirname(dirname(__FILE__));
$config = require_once $rootPath . '/config.php';
require_once $rootPath . '/includes/email-templates.php';

// Define the send_email function if it doesn't exist
if (!function_exists('send_email')) {
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
            if (file_exists(dirname(dirname(__FILE__)) . '/vendor/autoload.php')) {
                require_once dirname(dirname(__FILE__)) . '/vendor/autoload.php';
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
            if (function_exists('log_error')) {
                log_error([
                    'message' => 'Email sending failed',
                    'error' => $mail->ErrorInfo,
                    'to' => $to,
                    'subject' => $subject
                ]);
            }
            
            return [
                'success' => false,
                'message' => 'Email could not be sent: ' . $mail->ErrorInfo
            ];
        }
    }
}

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Connect to database
$conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $applicationId = isset($_POST['applicationId']) ? (int)$_POST['applicationId'] : 0;
    $recipientName = isset($_POST['recipientName']) ? trim($_POST['recipientName']) : '';
    $recipientEmail = isset($_POST['recipientEmail']) ? trim($_POST['recipientEmail']) : '';
    $emailSubject = isset($_POST['emailSubject']) ? trim($_POST['emailSubject']) : '';
    $emailTemplate = isset($_POST['emailTemplate']) ? trim($_POST['emailTemplate']) : '';
    $emailMessage = isset($_POST['emailMessage']) ? trim($_POST['emailMessage']) : '';
    $adminName = $_SESSION['admin_username'] ?? 'RUSH Healthcare Admin';
    
    // Validate required fields
    $errors = [];
    if (empty($recipientEmail)) {
        $errors[] = "Recipient email is required.";
    } elseif (!filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format.";
    }
    
    if (empty($emailSubject)) {
        $errors[] = "Email subject is required.";
    }
    
    if (empty($emailMessage)) {
        $errors[] = "Email message is required.";
    }
    
    // If no errors, send email
    if (empty($errors)) {
        // Prepare email content based on template
        $htmlContent = '';
        $replacements = [
            '{APPLICANT_NAME}' => $recipientName,
            '{RECIPIENT_NAME}' => $recipientName,
            '{EMAIL_SUBJECT}' => $emailSubject,
            '{EMAIL_CONTENT}' => nl2br($emailMessage),
            '{YEAR}' => date('Y')
        ];
        
        switch ($emailTemplate) {
            case 'application_received':
                $htmlContent = process_email_template(get_applicant_thank_you_template(), $replacements);
                break;
                
            case 'application_approved':
                $replacements['{APPLICATION_STATUS}'] = 'Approved';
                $replacements['{STATUS_DETAILS}'] = nl2br($emailMessage);
                $htmlContent = process_email_template(get_application_status_template(), $replacements);
                break;
                
            case 'application_rejected':
                $replacements['{APPLICATION_STATUS}'] = 'Not Approved';
                $replacements['{STATUS_DETAILS}'] = nl2br($emailMessage);
                $htmlContent = process_email_template(get_application_status_template(), $replacements);
                break;
                
            case 'documents_required':
                $replacements['{DOCUMENT_LIST}'] = nl2br($emailMessage);
                $htmlContent = process_email_template(get_document_request_template(), $replacements);
                break;
                
            case 'weekly_survey':
                $replacements['{SUMMARY}'] = '<p><strong>Weekly Survey Summary</strong></p>' . nl2br($emailMessage);
                $replacements['{SURVEY_DATA}'] = ''; // This would be populated with actual survey data
                $htmlContent = process_email_template(get_weekly_survey_template(), $replacements);
                break;
                
            case 'provider_application':
                $replacements['{SUMMARY}'] = '<p><strong>New Provider Application</strong></p>';
                $replacements['{PROVIDER_DATA}'] = nl2br($emailMessage);
                $htmlContent = process_email_template(get_provider_application_template(), $replacements);
                break;
                
            case 'interview_request':
            case 'custom':
            default:
                $htmlContent = process_email_template(get_custom_email_template(), $replacements);
                break;
        }
        
        // Create plain text version
        $plainTextContent = strip_tags(str_replace('<br>', "\n", $htmlContent));
        
        // Send email
        $result = send_email($recipientEmail, $emailSubject, $htmlContent, $plainTextContent);
        
        if ($result['success']) {
            // Log the email in the database
            $stmt = $conn->prepare("INSERT INTO provider_communications (application_id, recipient_name, recipient_email, subject, message, sent_by) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("isssss", $applicationId, $recipientName, $recipientEmail, $emailSubject, $emailMessage, $adminName);
            $stmt->execute();
            $stmt->close();
            
            // Set success message and redirect
            $_SESSION['success_message'] = "Email sent successfully to $recipientName.";
            header('Location: communications.php');
            exit;
        } else {
            $errors[] = "Failed to send email: " . $result['message'];
        }
    }
    
    // If there are errors, store them in session and redirect back
    if (!empty($errors)) {
        $_SESSION['error_messages'] = $errors;
        $_SESSION['form_data'] = $_POST; // Store form data for repopulation
        header('Location: communications.php');
        exit;
    }
} else {
    // Not a POST request, redirect to communications page
    header('Location: communications.php');
    exit;
}

$conn->close();
