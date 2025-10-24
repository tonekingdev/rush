<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://rushhealthc.com');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Method not allowed');
    }

    // Get token from URL parameter
    $token = $_GET['token'] ?? '';
    
    if (empty($token)) {
        throw new Exception('Token is required');
    }
    
    // Load configuration
    $config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
    
    // Connect to database
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed');
    }
    
    // Clean up expired tokens first
    $cleanupStmt = $conn->prepare("DELETE FROM provider_completion_tokens WHERE expires_at < NOW()");
    $cleanupStmt->execute();
    $cleanupStmt->close();
    
    // Validate token
    $stmt = $conn->prepare("SELECT pct.*, p.full_name, p.specialty 
                           FROM provider_completion_tokens pct
                           LEFT JOIN providers p ON pct.provider_id = p.provider_id
                           WHERE pct.token = ? AND pct.used_at IS NULL AND pct.expires_at > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Invalid, expired, or already used token');
    }
    
    $tokenData = $result->fetch_assoc();
    
    // Get current provider application data using the updated field name
    $providerStmt = $conn->prepare("SELECT 
                                        id,
                                        full_name,
                                        email,
                                        phone,
                                        address,
                                        is_cna_hha_caregiver,
                                        work_ethic,
                                        education,
                                        licenses,
                                        years_experience,
                                        license_type,
                                        license_number,
                                        malpractice_provider,
                                        profile_image,
                                        education_image,
                                        license_image,
                                        work_history,
                                        references_data,
                                        liability_signed,
                                        liability_signature,
                                        background_acknowledged,
                                        malpractice_acknowledged,
                                        exclusion_screening_signed,
                                        exclusion_screening_signature,
                                        exclusion_screening_date,
                                        additional_data,
                                        status,
                                        created_at,
                                        drug_alcohol_signed,
                                        drug_alcohol_signature,
                                        drug_alcohol_date,
                                        drug_alcohol_pdf,
                                        liability_pdf,
                                        exclusion_pdf
                                    FROM provider_applications 
                                    WHERE email = ?");
    $providerStmt->bind_param("s", $tokenData['provider_email']);
    $providerStmt->execute();
    $providerResult = $providerStmt->get_result();
    $providerData = $providerResult->fetch_assoc();
    
    // If no provider application found, create empty structure
    if (!$providerData) {
        $providerData = [
            'full_name' => '',
            'email' => $tokenData['provider_email'],
            'phone' => '',
            'address' => '',
            'is_cna_hha_caregiver' => 0,
            'work_ethic' => '',
            'education' => '',
            'licenses' => '',
            'years_experience' => '',
            'license_type' => '',
            'license_number' => '',
            'malpractice_provider' => '',
            'profile_image' => '',
            'education_image' => '',
            'license_image' => '',
            'work_history' => '',
            'references_data' => '',
            'liability_signed' => 0,
            'liability_signature' => '',
            'background_acknowledged' => 0,
            'malpractice_acknowledged' => 0,
            'exclusion_screening_signed' => 0,
            'exclusion_screening_signature' => '',
            'exclusion_screening_date' => '',
            'additional_data' => '',
            'status' => 'pending',
            'drug_alcohol_signed' => 0,
            'drug_alcohol_signature' => '',
            'drug_alcohol_date' => '',
            'drug_alcohol_pdf' => '',
            'liability_pdf' => '',
            'exclusion_pdf' => ''
        ];
    }
    
    echo json_encode([
        'success' => true,
        'token_data' => [
            'provider_id' => $tokenData['provider_id'],
            'provider_email' => $tokenData['provider_email'],
            'provider_name' => $tokenData['full_name'],
            'specialty' => $tokenData['specialty'],
            'missing_fields' => json_decode($tokenData['missing_fields'], true),
            'expires_at' => $tokenData['expires_at'],
            'admin_username' => $tokenData['admin_username']
        ],
        'provider_data' => $providerData
    ]);
    
    $stmt->close();
    $providerStmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log('Validate completion token error: ' . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>