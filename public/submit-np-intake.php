<?php
// Start output buffering to prevent any unwanted output before JSON
ob_start();

// Add PHPMailer autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Configure error handling - disable display errors but log them
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Function to send JSON response and exit clearly
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

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
    http_response_code(200);
    exit;
}


try {
    // check if config file exists before requiring it
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

    // Check if this is an AJAX request or regular form submission
    $isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    $isAjax = $isAjax || (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false);

    // For our React app, we'll always treat it as AJAX and return JSON
    $isAjax = true;

    // Check for POST request
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $formData = $_POST;

        // Extract email for uniqueness check - use the same field name as in form submission
        $email = isset($formData['email']) ? trim($formData['email']) : '';

        if (empty($email)) {
            sendJsonResponse(false, 'Email address is required', [], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJsonResponse(false, 'Invalid email address format', [], 400);
        }
        
        // Connect to database
        $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);

        // Check connection
        if ($conn->connect_error) {
            error_log("Connection failed: " . $conn->connect_error);
            sendJsonResponse(false, 'Database connection error.', [], 500);
        }

        // Set charset to prevent encoding issues
        $conn->set_charset("utf8mb4");

        // Check if email already exists in the database
        $checkEmailSql = "SELECT id FROM np_intake WHERE email = ?";
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
            sendJsonResponse(false, 'This email address is already registered in our system. If you need to update your intake or have questions, please contact our support team.', ['error' => 'email_exists'], 409);
        }
        $checkStmt->close();

        // --- 2. Data Extraction and Validation from $_POST ---
        
        // Data is extracted from $_POST because the frontend uses FormData
        $firstName = trim($_POST['firstName'] ?? '');
        $lastName = trim($_POST['lastName'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $npi_number = trim($_POST['npi_number'] ?? '');
        $np_license_number = trim($_POST['np_license_number'] ?? ''); 
        $years_experience = filter_var($_POST['years_experience'] ?? '', FILTER_VALIDATE_INT) ?? null;
        
        // Basic Validation
        if (empty($firstName) || empty($lastName) || empty($email) || empty($npi_number) || empty($np_license_number)) {
            sendJsonResponse(false, 'Missing required fields (First Name, Last Name, Email, NPI Number, NP License Number).', [], 400);
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJsonResponse(false, 'Invalid email format.', [], 400);
        }

        // --- 3. SQL INSERT Query ---
        
        $status = 'Pending';
        $application_type = 'NP Quick Intake';
        
        // Insert into the 'np_intake' table
        $sql = "INSERT INTO np_intake (
                    firstName, 
                    lastName, 
                    email, 
                    phone, 
                    npi_number, 
                    np_license_number, 
                    years_experience, 
                    status 
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                
        $stmt = $conn->prepare($sql);
        
        // Define parameter types: s=string, i=integer, d=double, b=blob
        $stmt->bind_param("ssssssis", 
            $firstName, 
            $lastName, 
            $email, 
            $phone, 
            $npi_number, 
            $np_license_number, 
            $years_experience, 
            $status
        );

        if (!$stmt->execute()) {
            $error_message = "Database error: " . $stmt->error;
            error_log($error_message);
            $stmt->close();
            $conn->close();
            sendJsonResponse(false, 'Failed to save application to the database. ' . $error_message, [], 500);
        }

        $insertId = $conn->insert_id;
        $stmt->close();

        // --- 4. Email Notification ---
        $emailSuccess = true;
        $emailError = '';
        
        try {
            // Recipient for the intake team
            $toEmail = 'customerservice@rushhealthc.com';
            $toName = 'R.U.S.H. Intake Team';

            // Email Template Content
            $templatePath = __DIR__ . '/email_template_np_intake.html';
            $emailBodyTemplate = file_get_contents($templatePath);

            // Dynamic Data for Template
            $summary = "New Nurse Practitioner Quick Intake submission received for $firstName $lastName (ID: $insertId).";
            
            $providerData = "<ul style='list-style: none; padding: 0;'>
                <li><strong>Name:</strong> $firstName $lastName</li>
                <li><strong>Email:</strong> $email</li>
                <li><strong>Phone:</strong> $phone</li>
                <li><strong>NPI Number:</strong> $npi_number</li>
                <li><strong>License Number:</strong> $np_license_number</li>
                <li><strong>Years Experience:</strong> $years_experience</li>
                <li><strong>Intake ID:</strong> $insertId</li>
            </ul>";

            $emailBody = str_replace(
                ['{SUMMARY}', '{PROVIDER_DATA}', '{email}'],
                [$summary, $providerData, $email],
                $emailBodyTemplate
            );

            // PHPMailer Configuration (Use your SMTP settings)
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = $config['SMTP_HOST'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $config['SMTP_USER'];
            $mail->Password   = $config['SMTP_PASS'];
            $mail->SMTPSecure = $config['SMTP_SECURE'];
            $mail->Port       = $config['SMTP_PORT'];
            
            $mail->setFrom($config['SMTP_USER'], 'R.U.S.H. Intake System'); 
            $mail->addAddress($toEmail, $toName);            
            $mail->isHTML(true);
            $mail->Subject = "R.U.S.H. NP Quick Intake Submission: $firstName $lastName";
            $mail->Body    = $emailBody;

            $mail->send();

        } catch (Exception $e) {
            $emailSuccess = false;
            $emailError = $e->getMessage();
            error_log("Email error: " . $emailError);
        }

        $conn->close();

        // --- 5. SUCCESS Response ---
        if ($emailSuccess) {
            sendJsonResponse(true, 'NP intake submitted successfully!', [
                'redirect' => 'https://rushhealthc.com/thank-you-np-intake',
                'application_id' => $insertId
            ]);
        } else {
            // Still report success for the form, but log email failure
            sendJsonResponse(true, 'Intake saved successfully, but email notification failed: ' . $emailError, [
                'redirect' => 'https://rushhealthc.com/thank-you-np-intake',
                'application_id' => $insertId,
                'email_failed' => true
            ]);
        }
        
    } else {
        // Handle non-POST requests
        sendJsonResponse(false, 'Invalid request method', [], 405);
    }
    
} catch (Exception $e) {
    // Log fatal error
    error_log("Fatal error in submit-np-intake.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    error_log("POST data: " . print_r($_POST, true));

    // Send JSON error response
    sendJsonResponse(false, 'An unexpected server error occurred. Please try again later.', [
        'error' => 'server_error',
    ], 500);
}

// Ensure no other output
ob_end_flush();
?>