<?php
// Start output buffering to prevent any unwanted output before JSON
ob_start();

// Configure error handling - disable display errors but log them
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Function to send JSON response and exit cleanly
function sendJsonResponse($success, $message, $data = [], $httpCode = 200) {
    // Clean any output buffer to prevent HTML before JSON
    if (ob_get_level()) {
        ob_clean();
    }
    
    // Set headers
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
    http_response_code($httpCode);
    
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if (!empty($data)) {
        $response = array_merge($response, $data);
    }
    
    echo json_encode($response);
    exit;
}

function validateSpamProtection($name, $occupation, $email, $website, $formStartTime, $submissionTime) {
    $errors = [];
    
    // Honeypot validation - website field should be empty
    if (!empty($website)) {
        $errors[] = 'Spam detected - honeypot field filled';
    }
    
    // Time-based validation - form should take at least 3 seconds
    $timeTaken = ($submissionTime - $formStartTime) / 1000; // Convert to seconds
    if ($timeTaken < 3) {
        $errors[] = 'Form submitted too quickly';
    }
    
    // Name validation
    if (strlen($name) < 2 || strlen($name) > 100) {
        $errors[] = 'Invalid name length';
    }
    
    if (!preg_match('/^[a-zA-Z\s\'-]+$/', $name)) {
        $errors[] = 'Invalid characters in name';
    }
    
    // Occupation validation
    if (strlen($occupation) < 2 || strlen($occupation) > 100) {
        $errors[] = 'Invalid occupation length';
    }
    
    // Check for suspicious patterns
    $suspiciousPatterns = [
        '/\b(viagra|cialis|casino|poker|loan|debt|credit|bitcoin|crypto)\b/i',
        '/\b(click here|visit now|buy now|act now)\b/i',
        '/[^\w\s@.-]/', // Unusual characters
        '/(.)\1{4,}/', // Repeated characters
    ];
    
    $fullText = $name . ' ' . $occupation . ' ' . $email;
    foreach ($suspiciousPatterns as $pattern) {
        if (preg_match($pattern, $fullText)) {
            $errors[] = 'Suspicious content detected';
            break;
        }
    }
    
    return $errors;
}

function checkRateLimit($conn, $email, $ip) {
    // Check email rate limit (1 submission per email per day)
    $emailCheckSql = "SELECT created_at FROM email_connections WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)";
    $emailStmt = $conn->prepare($emailCheckSql);
    $emailStmt->bind_param("s", $email);
    $emailStmt->execute();
    $emailResult = $emailStmt->get_result();
    
    if ($emailResult->num_rows > 0) {
        $emailStmt->close();
        return 'This email address has already submitted a request today. Please wait 24 hours before submitting again.';
    }
    $emailStmt->close();
    
    // Check IP rate limit (3 submissions per IP per hour)
    $ipCheckSql = "SELECT created_at FROM email_connections WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)";
    $ipStmt = $conn->prepare($ipCheckSql);
    $ipStmt->bind_param("s", $ip);
    $ipStmt->execute();
    $ipResult = $ipStmt->get_result();
    
    if ($ipResult->num_rows >= 3) {
        $ipStmt->close();
        return 'Too many requests from this location. Please try again later.';
    }
    $ipStmt->close();
    
    return null;
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
    http_response_code(200);
    exit;
}

try {
    // Check if config file exists before requiring it
    if (!file_exists(__DIR__ . '/config.php')) {
        throw new Exception('Configuration file not found');
    }
    
    // Load configuration
    $config = require_once __DIR__ . '/config.php';
    
    // Validate required config keys
    $requiredConfig = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
    foreach ($requiredConfig as $key) {
        if (!isset($config[$key])) {
            throw new Exception("Missing configuration: $key");
        }
    }

    // Set CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $name = isset($_POST['name']) ? trim($_POST['name']) : '';
        $occupation = isset($_POST['occupation']) ? trim($_POST['occupation']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $website = isset($_POST['website']) ? trim($_POST['website']) : '';
        $formStartTime = isset($_POST['form_start_time']) ? intval($_POST['form_start_time']) : 0;
        $submissionTime = isset($_POST['submission_time']) ? intval($_POST['submission_time']) : time() * 1000;
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        
        // Validate required fields
        if (empty($name)) {
            sendJsonResponse(false, 'Name is required', [], 400);
        }
        
        if (empty($occupation)) {
            sendJsonResponse(false, 'Occupation is required', [], 400);
        }
        
        if (empty($email)) {
            sendJsonResponse(false, 'Email address is required', [], 400);
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJsonResponse(false, 'Invalid email address format', [], 400);
        }
        
        $spamErrors = validateSpamProtection($name, $occupation, $email, $website, $formStartTime, $submissionTime);
        if (!empty($spamErrors)) {
            sendJsonResponse(false, 'Submission blocked: ' . implode(', ', $spamErrors), [], 400);
        }
        
        // Connect to database
        $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);

        if ($conn->connect_error) {
            throw new Exception('Connection failed: ' . $conn->connect_error);
        }
        
        // Set charset to prevent encoding issues
        $conn->set_charset("utf8mb4");
        
        $rateLimitError = checkRateLimit($conn, $email, $ipAddress);
        if ($rateLimitError) {
            $conn->close();
            sendJsonResponse(false, $rateLimitError, [], 429);
        }
        
        // Check if email already exists in the database
        $checkEmailSql = "SELECT id FROM email_connections WHERE email = ?";
        $checkStmt = $conn->prepare($checkEmailSql);
        if (!$checkStmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $checkStmt->bind_param("s", $email);
        $checkStmt->execute();
        $checkStmt->store_result();
        
        if ($checkStmt->num_rows > 0) {
            $checkStmt->close();
            $conn->close();
            sendJsonResponse(false, 'This email address has already submitted a connection request. Sonita Lewis will respond within 2-5 business days.', ['error' => 'email_exists'], 409);
        }
        $checkStmt->close();

        $sql = "INSERT INTO email_connections (name, occupation, email, ip_address, form_start_time, submission_time, status) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?), FROM_UNIXTIME(?), 'pending')";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        $formStartTimeSeconds = $formStartTime / 1000;
        $submissionTimeSeconds = $submissionTime / 1000;
        $stmt->bind_param("ssssii", $name, $occupation, $email, $ipAddress, $formStartTimeSeconds, $submissionTimeSeconds);

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $insertId = $conn->insert_id;

        // Send email notifications with PHPMailer
        $emailSuccess = false;
        $emailError = '';
        
        try {
            // Check if PHPMailer is available
            if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
                throw new Exception('PHPMailer not found - please run composer install');
            }
            
            require __DIR__ . '/vendor/autoload.php';

            // Load email templates
            $visitor_template_path = __DIR__ . '/email_template_visitor_receipt.html';
            $sonita_template_path = __DIR__ . '/email_template_sonita_notification.html';
            
            if (!file_exists($visitor_template_path)) {
                throw new Exception('Visitor email template not found');
            }
            
            if (!file_exists($sonita_template_path)) {
                throw new Exception('Sonita email template not found');
            }
            
            $visitor_template = file_get_contents($visitor_template_path);
            $sonita_template = file_get_contents($sonita_template_path);

            // Replace placeholders in visitor template
            $visitor_html_content = str_replace(
                ['{VISITOR_NAME}', '{YEAR}'],
                [$name, date('Y')],
                $visitor_template
            );

            // Replace placeholders in Sonita template
            $sonita_html_content = str_replace(
                ['{VISITOR_NAME}', '{VISITOR_OCCUPATION}', '{VISITOR_EMAIL}', '{SUBMISSION_DATE}', '{YEAR}'],
                [$name, $occupation, $email, date('F j, Y, g:i a'), date('Y')],
                $sonita_template
            );

            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = $config['SMTP_HOST'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $config['SMTP_USER'];
            $mail->Password   = $config['SMTP_PASS'];
            $mail->SMTPSecure = $config['SMTP_SECURE'];
            $mail->Port       = $config['SMTP_PORT'];

            // Send notification email to Sonita
            $mail->setFrom('noreply@rushhealthc.com', 'RUSH Healthcare');
            $mail->addAddress('slewis@rushhealthc.com', 'Sonita Lewis');
            $mail->isHTML(true);
            $mail->Subject = "New Email Connection Request from " . $name;
            $mail->Body    = $sonita_html_content;
            $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $sonita_html_content));

            $sonitaEmailSent = $mail->send();
            
            // Clear recipients for the visitor email
            $mail->clearAddresses();
            
            // Send receipt email to visitor
            $mail->setFrom('noreply@rushhealthc.com', 'RUSH Healthcare');
            $mail->addAddress($email, $name);
            $mail->Subject = "Your Email Connection Request - RUSH Healthcare";
            $mail->Body    = $visitor_html_content;
            $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $visitor_html_content));
            
            $visitorEmailSent = $mail->send();
            $emailSuccess = $sonitaEmailSent && $visitorEmailSent;
            
        } catch (Exception $e) {
            $emailError = $e->getMessage();
            error_log("Email error: " . $emailError);
        }

        $stmt->close();
        $conn->close();

        // SUCCESS - Return JSON response
        if ($emailSuccess) {
            sendJsonResponse(true, 'Thank you! Your request to connect with Sonita Lewis has been sent. Please allow 2-5 business days for a response.', [
                'connection_id' => $insertId
            ]);
        } else {
            sendJsonResponse(true, 'Your connection request was saved, but email notification failed: ' . $emailError, [
                'connection_id' => $insertId
            ]);
        }
        
    } else {
        sendJsonResponse(false, 'Invalid request method', [], 405);
    }
    
} catch (Exception $e) {
    // Log the exception with full details
    error_log("Fatal error in submit-email-connect.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    error_log("POST data: " . print_r($_POST, true));

    // Send JSON error response
    sendJsonResponse(false, 'An unexpected error occurred. Please try again later.', [
        'error' => 'server_error',
        'debug_message' => $e->getMessage() // Remove this in production
    ], 500);
}

// Clean any remaining output buffer
if (ob_get_level() > 0) {
    ob_end_flush();
}
?>