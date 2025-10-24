<?php
session_start();
require_once '../includes/email-templates.php';

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Content-Type: text/plain');
    echo 'Unauthorized access';
    exit;
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: text/plain');
    echo 'Invalid request method';
    exit;
}

// Get POST data
$template = isset($_POST['template']) ? $_POST['template'] : 'custom';
$recipientName = isset($_POST['recipientName']) ? $_POST['recipientName'] : 'Provider';
$emailSubject = isset($_POST['emailSubject']) ? $_POST['emailSubject'] : 'RUSH Healthcare';
$emailMessage = isset($_POST['emailMessage']) ? $_POST['emailMessage'] : '';

// Convert line breaks to <br> tags for HTML display
$emailMessageHtml = nl2br($emailMessage);

// Prepare replacements
$replacements = [
    '{APPLICANT_NAME}' => $recipientName,
    '{RECIPIENT_NAME}' => $recipientName,
    '{EMAIL_SUBJECT}' => $emailSubject,
    '{EMAIL_CONTENT}' => $emailMessageHtml,
    '{YEAR}' => date('Y')
];

// Generate HTML based on template
$html = '';
switch ($template) {
    case 'application_received':
        $html = process_email_template(get_applicant_thank_you_template(), $replacements);
        break;
        
    case 'application_approved':
        $replacements['{APPLICATION_STATUS}'] = 'Approved';
        $replacements['{STATUS_DETAILS}'] = $emailMessageHtml;
        $html = process_email_template(get_application_status_template(), $replacements);
        break;
        
    case 'application_rejected':
        $replacements['{APPLICATION_STATUS}'] = 'Not Approved';
        $replacements['{STATUS_DETAILS}'] = $emailMessageHtml;
        $html = process_email_template(get_application_status_template(), $replacements);
        break;
        
    case 'documents_required':
        $replacements['{DOCUMENT_LIST}'] = $emailMessageHtml;
        $html = process_email_template(get_document_request_template(), $replacements);
        break;
        
    case 'interview_request':
    case 'custom':
    default:
        $html = process_email_template(get_custom_email_template(), $replacements);
        break;
}

// Output the HTML
header('Content-Type: text/html');
echo $html;