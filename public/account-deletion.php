<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get the raw POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
if (!$data || !isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

$firstName = trim($data['firstName']);
$lastName = trim($data['lastName']);
$email = trim($data['email']);

// Basic validation
if (empty($firstName) || empty($lastName) || empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

try {
    // Email configuration
    $adminEmail = 'customerservice@rushhealthc.com';
    $fromEmail = 'noreply@rushhealthc.com';
    $fromName = 'RUSH Healthcare';
    
    // Load email templates
    $adminTemplate = file_get_contents(__DIR__ . '/email_template_account_deletion_admin.html');
    $userTemplate = file_get_contents(__DIR__ . '/email_template_account_deletion_user.html');
    
    if ($adminTemplate === false || $userTemplate === false) {
        throw new Exception('Failed to load email templates');
    }
    
    // Replace placeholders in admin email
    $adminEmailContent = str_replace(
        ['{FIRST_NAME}', '{LAST_NAME}', '{EMAIL}', '{FULL_NAME}', '{YEAR}'],
        [$firstName, $lastName, $email, $firstName . ' ' . $lastName, date('Y')],
        $adminTemplate
    );
    
    // Replace placeholders in user email
    $userEmailContent = str_replace(
        ['{FIRST_NAME}', '{LAST_NAME}', '{EMAIL}', '{FULL_NAME}', '{YEAR}'],
        [$firstName, $lastName, $email, $firstName . ' ' . $lastName, date('Y')],
        $userTemplate
    );
    
    // Email headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $fromName . ' <' . $fromEmail . '>',
        'Reply-To: ' . $fromEmail,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    $headerString = implode("\r\n", $headers);
    
    // Send email to admin
    $adminSubject = 'Account Deletion Request - ' . $firstName . ' ' . $lastName;
    $adminSent = mail($adminEmail, $adminSubject, $adminEmailContent, $headerString);
    
    // Send confirmation email to user
    $userSubject = 'Account Deletion Request Confirmation - RUSH Healthcare';
    $userSent = mail($email, $userSubject, $userEmailContent, $headerString);
    
    if (!$adminSent || !$userSent) {
        throw new Exception('Failed to send email notifications');
    }
    
    // Log the request (optional - you can implement database logging here)
    error_log("Account deletion request: $firstName $lastName ($email) - " . date('Y-m-d H:i:s'));
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Account deletion request submitted successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Account deletion error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while processing your request. Please try again later.'
    ]);
}
?>