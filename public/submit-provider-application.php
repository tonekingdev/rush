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

    // Check if this is an AJAX request or regular form submission
    $isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    $isAjax = $isAjax || (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false);

    // For our React app, we'll always treat it as AJAX and return JSON
    $isAjax = true;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $formData = $_POST;
        $files = $_FILES;

        // Extract email for uniqueness check
        $email = isset($formData['username']) ? trim($formData['username']) : '';
        
        if (empty($email)) {
            sendJsonResponse(false, 'Email address is required', [], 400);
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJsonResponse(false, 'Invalid email address format', [], 400);
        }
        
        // Connect to database
        $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);

        if ($conn->connect_error) {
            throw new Exception('Connection failed: ' . $conn->connect_error);
        }
        
        // Set charset to prevent encoding issues
        $conn->set_charset("utf8mb4");
        
        // Check if email already exists in the database
        $checkEmailSql = "SELECT id FROM provider_applications WHERE email = ?";
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
            sendJsonResponse(false, 'This email address is already registered in our system. If you need to update your application or have questions, please contact our support team.', ['error' => 'email_exists'], 409);
        }
        $checkStmt->close();

        // Process file uploads
        $uploadDir = __DIR__ . '/uploads/';
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                throw new Exception('Failed to create upload directory');
            }
        }
        
        $fileUrls = [];
        foreach ($files as $key => $file) {
            if ($file['error'] === UPLOAD_ERR_OK) {
                // Basic file validation
                $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
                $maxSize = 10 * 1024 * 1024; // 10MB
                
                if (!in_array($file['type'], $allowedTypes)) {
                    error_log("Invalid file type for $key: " . $file['type']);
                    continue;
                }
                
                if ($file['size'] > $maxSize) {
                    error_log("File too large for $key: " . $file['size']);
                    continue;
                }
                
                $fileName = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', basename($file['name']));
                $targetFile = $uploadDir . $fileName;
                if (move_uploaded_file($file['tmp_name'], $targetFile)) {
                    $fileUrls[$key] = $targetFile;
                } else {
                    error_log("Failed to move uploaded file: $key");
                }
            } elseif ($file['error'] !== UPLOAD_ERR_NO_FILE) {
                error_log("Upload error for $key: " . $file['error']);
            }
        }

        // Extract specific fields from form data with proper defaults
        $firstName = isset($formData['firstName']) ? trim($formData['firstName']) : '';
        $lastName = isset($formData['lastName']) ? trim($formData['lastName']) : '';
        $fullName = trim($firstName . ' ' . $lastName);
        $phone = isset($formData['phone']) ? trim($formData['phone']) : '';
        $address = isset($formData['fullAddress']) && $formData['fullAddress'] !== '' ? trim($formData['fullAddress']) : null;
        $isCNAHHACaregiver = isset($formData['isCNAHHACaregiver']) && $formData['isCNAHHACaregiver'] === 'true' ? 1 : 0;
        $isSitterApplicant = isset($formData['isSitterApplicant']) && $formData['isSitterApplicant'] === 'true' ? 1 : 0;
        
        // Professional credentials
        $workEthic = isset($formData['workEthic']) && $formData['workEthic'] !== '' ? trim($formData['workEthic']) : null;
        $education = isset($formData['education']) && $formData['education'] !== '' ? trim($formData['education']) : null;
        $licenses = isset($formData['licenses']) && $formData['licenses'] !== '' ? trim($formData['licenses']) : null;
        $yearsExperience = isset($formData['yearsExperience']) && $formData['yearsExperience'] !== '' ? intval($formData['yearsExperience']) : null;
        $licenseType = isset($formData['licenseType']) && $formData['licenseType'] !== '' ? trim($formData['licenseType']) : null;
        $specialty = isset($formData['specialty']) && $formData['specialty'] !== '' ? trim($formData['specialty']) : null;
        $licenseNumber = isset($formData['licenseNumber']) && $formData['licenseNumber'] !== '' ? trim($formData['licenseNumber']) : null;
        $malpracticeProvider = isset($formData['malpracticeInsuranceProvider']) && $formData['malpracticeInsuranceProvider'] !== '' ? trim($formData['malpracticeInsuranceProvider']) : null;
        
        // File paths - use null if empty
        $profileImagePath = !empty($fileUrls['profileImage']) ? $fileUrls['profileImage'] : null;
        $educationImagePath = !empty($fileUrls['educationImage']) ? $fileUrls['educationImage'] : null;
        $licenseImagePath = !empty($fileUrls['licenseImage']) ? $fileUrls['licenseImage'] : null;
        $driversLicenseImagePath = !empty($fileUrls['driversLicenseImage']) ? $fileUrls['driversLicenseImage'] : null;
        $blsCprImagePath = !empty($fileUrls['blsCprImage']) ? $fileUrls['blsCprImage'] : null;
        $tbTestImagePath = !empty($fileUrls['tbTestImage']) ? $fileUrls['tbTestImage'] : null;
        $woundCareImagePath = !empty($fileUrls['woundCareImage']) ? $fileUrls['woundCareImage'] : null;
        $liabilityPdfPath = !empty($fileUrls['liabilityPDF']) ? $fileUrls['liabilityPDF'] : null;
        $exclusionPdfPath = !empty($fileUrls['exclusionPDF']) ? $fileUrls['exclusionPDF'] : null;
        $drugAlcoholPdfPath = !empty($fileUrls['drugAlcoholPDF']) ? $fileUrls['drugAlcoholPDF'] : null;
        $citizenshipPdfPath = !empty($fileUrls['citizenshipPDF']) ? $fileUrls['citizenshipPDF'] : null;
        $nonCompetePdfPath = !empty($fileUrls['nonCompetePDF']) ? $fileUrls['nonCompetePDF'] : null;
        
        // Store complex data as JSON
        $workHistory = isset($formData['workHistory']) && $formData['workHistory'] !== '' ? $formData['workHistory'] : null;
        $references = isset($formData['references']) && $formData['references'] !== '' ? $formData['references'] : null;
        
        // Agreements
        $liabilityFormSigned = isset($formData['liabilityFormSigned']) && $formData['liabilityFormSigned'] === 'true' ? 1 : 0;
        $liabilitySignature = isset($formData['liabilitySignature']) && $formData['liabilitySignature'] !== '' ? $formData['liabilitySignature'] : null;
        $backgroundCheckAcknowledged = isset($formData['backgroundCheckAcknowledged']) && $formData['backgroundCheckAcknowledged'] === 'true' ? 1 : 0;
        $malpracticeInsuranceAcknowledged = isset($formData['malpracticeInsuranceAcknowledged']) && $formData['malpracticeInsuranceAcknowledged'] === 'true' ? 1 : 0;
        
        // Exclusion Screening Policy
        $exclusionScreeningSigned = isset($formData['exclusionScreeningSigned']) && $formData['exclusionScreeningSigned'] === 'true' ? 1 : 0;
        $exclusionScreeningSignature = isset($formData['exclusionScreeningSignature']) && $formData['exclusionScreeningSignature'] !== '' ? $formData['exclusionScreeningSignature'] : null;
        $exclusionScreeningSignatureDate = isset($formData['exclusionScreeningSignatureDate']) && $formData['exclusionScreeningSignatureDate'] !== '' ? $formData['exclusionScreeningSignatureDate'] : null;
        
        // Drug and Alcohol-Free Workplace Acknowledgment
        $drugAlcoholFormSigned = isset($formData['drugAlcoholFormSigned']) && $formData['drugAlcoholFormSigned'] === 'true' ? 1 : 0;
        $drugAlcoholSignature = isset($formData['drugAlcoholSignature']) && $formData['drugAlcoholSignature'] !== '' ? $formData['drugAlcoholSignature'] : null;
        $drugAlcoholSignatureDate = isset($formData['drugAlcoholSignatureDate']) && $formData['drugAlcoholSignatureDate'] !== '' ? $formData['drugAlcoholSignatureDate'] : null;

        // Citizenship Attestation
        $citizenshipAttestationSigned = isset($formData['citizenshipAttestationSigned']) && $formData['citizenshipAttestationSigned'] === 'true' ? 1 : 0;
        $citizenshipSignature = isset($formData['citizenshipSignature']) && $formData['citizenshipSignature'] !== '' ? $formData['citizenshipSignature'] : null;
        $citizenshipSignatureDate = isset($formData['citizenshipSignatureDate']) && $formData['citizenshipSignatureDate'] !== '' ? $formData['citizenshipSignatureDate'] : null;
        $dateOfBirth = isset($formData['dateOfBirth']) && $formData['dateOfBirth'] !== '' ? $formData['dateOfBirth'] : null;
        $positionAppliedFor = isset($formData['positionAppliedFor']) && $formData['positionAppliedFor'] !== '' ? $formData['positionAppliedFor'] : null;
        $citizenshipStatus = isset($formData['citizenshipStatus']) && $formData['citizenshipStatus'] !== '' ? $formData['citizenshipStatus'] : null;

        // Non-Compete Clause
        $nonCompeteSigned = isset($formData['nonCompeteSigned']) && $formData['nonCompeteSigned'] === 'true' ? 1 : 0;
        $nonCompeteSignature = isset($formData['nonCompeteSignature']) && $formData['nonCompeteSignature'] !== '' ? $formData['nonCompeteSignature'] : null;
        $nonCompeteSignatureDate = isset($formData['nonCompeteSignatureDate']) && $formData['nonCompeteSignatureDate'] !== '' ? $formData['nonCompeteSignatureDate'] : null;

        // Certification status
        $hasBlsCpr = isset($formData['hasBlsCpr']) && $formData['hasBlsCpr'] === 'true' ? 1 : 0;
        $hasWoundCareExperience = isset($formData['hasWoundCareExperience']) && $formData['hasWoundCareExperience'] === 'true' ? 1 : 0;
        
        // Store remaining data as JSON for any fields we haven't explicitly extracted
        $additionalData = json_encode($formData);

        // Prepare variables
        $providerId = null;
        $status = 'pending';

        // CORRECTED SQL - Exactly 52 columns (excluding id, created_at, updated_at which are automatic)
        $sql = "INSERT INTO provider_applications (
            provider_id, full_name, email, phone, address, drivers_license_image,
            bls_cpr_image, tb_test_image, wound_care_image, has_bls_cpr, has_wound_care_experience,
            is_cna_hha_caregiver, is_sitter_applicant, work_ethic, education, licenses, years_experience,
            license_type, specialty, license_number, malpractice_provider, profile_image,
            education_image, license_image, work_history, references_data, liability_signed,
            liability_signature, background_acknowledged, malpractice_acknowledged,
            exclusion_screening_signed, exclusion_screening_signature, exclusion_screening_date, additional_data,
            status, drug_alcohol_signed, drug_alcohol_signature, drug_alcohol_date,
            citizenship_attestation_signed, citizenship_signature, citizenship_signature_date, date_of_birth,
            position_applied_for, citizenship_status, drug_alcohol_pdf, citizenship_pdf,
            liability_pdf, exclusion_pdf, non_compete_signed, non_compete_signature, non_compete_date, non_compete_pdf
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        
        // CORRECTED: Exactly 52 parameters to match 52 columns
        $params = [
            $providerId,                    // 1  - s (string/null)
            $fullName,                      // 2  - s (string)
            $email,                         // 3  - s (string)
            $phone,                         // 4  - s (string)
            $address,                       // 5  - s (string/null)
            $driversLicenseImagePath,       // 6  - s (string/null)
            $blsCprImagePath,               // 7  - s (string/null)
            $tbTestImagePath,               // 8  - s (string/null)
            $woundCareImagePath,            // 9  - s (string/null)
            $hasBlsCpr,                     // 10 - i (integer)
            $hasWoundCareExperience,        // 11 - i (integer)
            $isCNAHHACaregiver,            // 12 - i (integer)
            $isSitterApplicant,             // 13 - i (integer)
            $workEthic,                     // 14 - s (string/null)
            $education,                     // 15 - s (string/null)
            $licenses,                      // 16 - s (string/null)
            $yearsExperience,               // 17 - i (integer/null)
            $licenseType,                   // 18 - s (string/null)
            $specialty,                     // 19 - s (string/null)
            $licenseNumber,                 // 20 - s (string/null)
            $malpracticeProvider,           // 21 - s (string/null)
            $profileImagePath,              // 22 - s (string/null)
            $educationImagePath,            // 23 - s (string/null)
            $licenseImagePath,              // 24 - s (string/null)
            $workHistory,                   // 25 - s (string/null)
            $references,                    // 26 - s (string/null)
            $liabilityFormSigned,           // 27 - i (integer)
            $liabilitySignature,            // 28 - s (string/null)
            $backgroundCheckAcknowledged,   // 29 - i (integer)
            $malpracticeInsuranceAcknowledged, // 30 - i (integer)
            $exclusionScreeningSigned,      // 31 - i (integer)
            $exclusionScreeningSignature,   // 32 - s (string/null)
            $exclusionScreeningSignatureDate, // 33 - s (string/null)
            $additionalData,                // 34 - s (string)
            $status,                        // 35 - s (string)
            $drugAlcoholFormSigned,         // 36 - i (integer)
            $drugAlcoholSignature,          // 37 - s (string/null)
            $drugAlcoholSignatureDate,      // 38 - s (string/null)
            $citizenshipAttestationSigned,  // 39 - i (integer)
            $citizenshipSignature,          // 40 - s (string/null)
            $citizenshipSignatureDate,      // 41 - s (string/null)
            $dateOfBirth,                   // 42 - s (string/null)
            $positionAppliedFor,            // 43 - s (string/null)
            $citizenshipStatus,             // 44 - s (string/null)
            $drugAlcoholPdfPath,            // 45 - s (string/null)
            $citizenshipPdfPath,            // 46 - s (string/null)
            $liabilityPdfPath,              // 47 - s (string/null)
            $exclusionPdfPath,              // 48 - s (string/null)
            $nonCompeteSigned,              // 49 - i (integer)
            $nonCompeteSignature,           // 50 - s (string/null)
            $nonCompeteSignatureDate,       // 51 - s (string/null)
            $nonCompetePdfPath              // 52 - s (string/null)
        ];
        
        // CORRECTED: Type string with exactly 52 characters to match 52 parameters
        $types = "sssssssssiiiisssisssssssssisiiiisssississsssssssisss";
        
        // Verify counts match
        if (strlen($types) !== count($params)) {
            throw new Exception('Parameter count mismatch: ' . strlen($types) . ' types vs ' . count($params) . ' params');
        }
        
        // Count placeholders in SQL
        $placeholderCount = substr_count($sql, '?');
        if ($placeholderCount !== count($params)) {
            throw new Exception('SQL placeholder count mismatch: ' . $placeholderCount . ' placeholders vs ' . count($params) . ' params');
        }
        
        // Bind parameters using call_user_func_array to handle the array properly
        $stmt->bind_param($types, ...$params);

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $insertId = $conn->insert_id;

        // Send email notification with PHPMailer
        $emailSuccess = false;
        $emailError = '';
        
        try {
            // Check if PHPMailer is available
            if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
                throw new Exception('PHPMailer not found - please run composer install');
            }
            
            require __DIR__ . '/vendor/autoload.php';

            // Load email templates
            $admin_template_path = __DIR__ . '/email_template_provider.html';
            $applicant_template_path = __DIR__ . '/email_template_applicant.html';
            
            if (!file_exists($admin_template_path)) {
                throw new Exception('Admin email template not found');
            }
            
            if (!file_exists($applicant_template_path)) {
                throw new Exception('Applicant email template not found');
            }
            
            $admin_template = file_get_contents($admin_template_path);
            $applicant_template = file_get_contents($applicant_template_path);

            // Format provider application data in HTML
            function formatProviderData($formData, $fullName, $email, $phone) {
                $provider_data = "<div style='background-color: #ffffff; border: 1px solid #e0e0e0; padding: 20px; margin-bottom: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>";
                
                // Personal Information Section
                $provider_data .= "<h2 style='color: #1586D6; margin-top: 0; font-size: 18px; font-weight: 600;'>Personal Information</h2>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Full Name:</strong> " . htmlspecialchars($fullName) . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Email:</strong> " . htmlspecialchars($email) . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Phone:</strong> " . htmlspecialchars($phone) . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Address:</strong> " . htmlspecialchars($formData['fullAddress'] ?? '') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Is CNA:</strong> " . ($formData['isCNAHHACaregiver'] === 'true' ? 'Yes' : 'No') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Is CNA:</strong> " . ($formData['isSitterApplicant'] === 'true' ? 'Yes' : 'No') . "</div>";
                
                // Professional Credentials Section
                $provider_data .= "<h2 style='color: #1586D6; margin-top: 20px; font-size: 18px; font-weight: 600;'>Professional Credentials</h2>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Education:</strong> " . htmlspecialchars($formData['education'] ?? '') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Licenses:</strong> " . htmlspecialchars($formData['licenses'] ?? '') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>License Type:</strong> " . htmlspecialchars($formData['licenseType'] ?? '') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>License Number:</strong> " . htmlspecialchars($formData['licenseNumber'] ?? '') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Years of Experience:</strong> " . htmlspecialchars($formData['yearsExperience'] ?? '') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Malpractice Insurance Provider:</strong> " . htmlspecialchars($formData['malpracticeInsuranceProvider'] ?? '') . "</div>";
                
                // Citizenship Information Section
                $provider_data .= "<h2 style='color: #1586D6; margin-top: 20px; font-size: 18px; font-weight: 600;'>Citizenship Information</h2>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Date of Birth:</strong> " . htmlspecialchars($formData['dateOfBirth'] ?? '') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Position Applied For:</strong> " . htmlspecialchars($formData['positionAppliedFor'] ?? '') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Citizenship Status:</strong> " . htmlspecialchars($formData['citizenshipStatus'] ?? '') . "</div>";
                
                // Agreements Section
                $provider_data .= "<h2 style='color: #1586D6; margin-top: 20px; font-size: 18px; font-weight: 600;'>Agreements</h2>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Liability Form Signed:</strong> " . ($formData['liabilityFormSigned'] === 'true' ? 'Yes' : 'No') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Background Check Acknowledged:</strong> " . ($formData['backgroundCheckAcknowledged'] === 'true' ? 'Yes' : 'No') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Malpractice Insurance Acknowledged:</strong> " . ($formData['malpracticeInsuranceAcknowledged'] === 'true' ? 'Yes' : 'No') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Exclusion Screening Signed:</strong> " . ($formData['exclusionScreeningSigned'] === 'true' ? 'Yes' : 'No') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Drug and Alcohol-Free Workplace Acknowledged:</strong> " . ($formData['drugAlcoholFormSigned'] === 'true' ? 'Yes' : 'No') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Citizenship Attestation Signed:</strong> " . ($formData['citizenshipAttestationSigned'] === 'true' ? 'Yes' : 'No') . "</div>";
                $provider_data .= "<div style='margin-bottom: 8px;'><strong>Non-Compete Clause Signed:</strong> " . ($formData['nonCompeteSigned'] === 'true' ? 'Yes' : 'No') . "</div>";
                
                $provider_data .= "</div>";
                return $provider_data;
            }

            // Create summary section for admin email
            $admin_summary = "<p style='font-size: 16px; margin-bottom: 10px;'><strong>New Provider Application Submission</strong></p>";
            $admin_summary .= "<p style='margin-bottom: 10px;'><strong>Applicant:</strong> " . htmlspecialchars($fullName) . "</p>";
            $admin_summary .= "<p style='margin-bottom: 10px;'><strong>Submitted on:</strong> " . date('F j, Y, g:i a') . "</p>";
            $admin_summary .= "<p style='margin-bottom: 0;'><strong>Status:</strong> <span style='color: #ff9900; font-weight: bold;'>Pending Review</span></p>";

            // Replace placeholders in admin template
            $admin_html_content = str_replace(
                ['{SUMMARY}', '{PROVIDER_DATA}', '{YEAR}'],
                [$admin_summary, formatProviderData($formData, $fullName, $email, $phone), date('Y')],
                $admin_template
            );

            // Replace placeholders in applicant template
            $applicant_html_content = str_replace(
                ['{APPLICANT_NAME}', '{YEAR}'],
                [$firstName, date('Y')],
                $applicant_template
            );

            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = $config['SMTP_HOST'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $config['SMTP_USER'];
            $mail->Password   = $config['SMTP_PASS'];
            $mail->SMTPSecure = $config['SMTP_SECURE'];
            $mail->Port       = $config['SMTP_PORT'];

            // Send email to admin
            $mail->setFrom('noreply@rushhealthc.com', 'RUSH Provider Network');
            $mail->addAddress('info@rushhealthc.com');
            $mail->isHTML(true);
            $mail->Subject = "New Provider Application: " . $fullName;
            $mail->Body    = $admin_html_content;
            $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $admin_html_content));

            // Attach PDF documents to admin email
            if (!empty($liabilityPdfPath) && file_exists($liabilityPdfPath)) {
                $mail->addAttachment($liabilityPdfPath, 'Liability_Waiver.pdf');
            }
            
            if (!empty($exclusionPdfPath) && file_exists($exclusionPdfPath)) {
                $mail->addAttachment($exclusionPdfPath, 'Exclusion_Screening_Policy.pdf');
            }
            
            if (!empty($drugAlcoholPdfPath) && file_exists($drugAlcoholPdfPath)) {
                $mail->addAttachment($drugAlcoholPdfPath, 'Drug_Alcohol_Free_Workplace.pdf');
            }

            if (!empty($citizenshipPdfPath) && file_exists($citizenshipPdfPath)) {
                $mail->addAttachment($citizenshipPdfPath, 'Citizenship_Attestation.pdf');
            }

            if (!empty($nonCompetePdfPath) && file_exists($nonCompetePdfPath)) {
                $mail->addAttachment($nonCompetePdfPath, 'Non_Compete_Clause.pdf');
            }

            $adminEmailSent = $mail->send();
            
            // Clear recipients and attachments for the applicant email
            $mail->clearAddresses();
            $mail->clearAttachments();
            
            // Send confirmation email to applicant
            $mail->setFrom('noreply@rushhealthc.com', 'RUSH Healthcare');
            $mail->addAddress($email, $fullName);
            $mail->Subject = "Thank You for Your RUSH Healthcare Application";
            $mail->Body    = $applicant_html_content;
            $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $applicant_html_content));
            
            // Attach PDF documents to applicant email as well
            if (!empty($liabilityPdfPath) && file_exists($liabilityPdfPath)) {
                $mail->addAttachment($liabilityPdfPath, 'Your_Signed_Liability_Waiver.pdf');
            }
            
            if (!empty($exclusionPdfPath) && file_exists($exclusionPdfPath)) {
                $mail->addAttachment($exclusionPdfPath, 'Your_Signed_Exclusion_Screening_Policy.pdf');
            }
            
            if (!empty($drugAlcoholPdfPath) && file_exists($drugAlcoholPdfPath)) {
                $mail->addAttachment($drugAlcoholPdfPath, 'Your_Signed_Drug_Alcohol_Free_Workplace.pdf');
            }

            if (!empty($citizenshipPdfPath) && file_exists($citizenshipPdfPath)) {
                $mail->addAttachment($citizenshipPdfPath, 'Your_Signed_Citizenship_Attestation.pdf');
            }

            if (!empty($nonCompetePdfPath) && file_exists($nonCompetePdfPath)) {
                $mail->addAttachment($nonCompetePdfPath, 'Your_Signed_Non_Compete_Clause.pdf');
            }
            
            $applicantEmailSent = $mail->send();
            $emailSuccess = $adminEmailSent && $applicantEmailSent;
            
        } catch (Exception $e) {
            $emailError = $e->getMessage();
            error_log("Email error: " . $emailError);
        }

        $stmt->close();
        $conn->close();

        // SUCCESS - Return JSON response
        if ($emailSuccess) {
            sendJsonResponse(true, 'Application submitted successfully!', [
                'redirect' => 'https://rushhealthc.com/thank-you',
                'application_id' => $insertId
            ]);
        } else {
            sendJsonResponse(true, 'Application saved successfully, but email notification failed: ' . $emailError, [
                'redirect' => 'https://rushhealthc.com/thank-you',
                'application_id' => $insertId
            ]);
        }
        
    } else {
        sendJsonResponse(false, 'Invalid request method', [], 405);
    }
    
} catch (Exception $e) {
    // Log the exception with full details
    error_log("Fatal error in submit-provider-application.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    error_log("POST data: " . print_r($_POST, true));
    error_log("FILES data: " . print_r($_FILES, true));

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