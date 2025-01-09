<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$config = require 'config.php';

// Create connection
$conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);

// Check connection
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

// Prepare SQL statement based on survey type
if ($data['type'] === 'patient') {
    $sql = "INSERT INTO patient_surveys (full_name, date_of_birth, email, phone_number, zip_code, interest_reasons, anticipated_services, medical_conditions, has_pcp, taking_medications, has_insurance, insurance_provider, interested_in_payment_plans, accessibility_needs, additional_info, submitted_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssssssssssss", 
        $data['fullName'], 
        $data['dateOfBirth'],
        $data['email'],
        $data['phoneNumber'],
        $data['zipCode'],
        implode(", ", $data['interestReasons']),
        implode(", ", $data['anticipatedServices']),
        $data['medicalConditions'],
        $data['hasPCP'],
        $data['takingMedications'],
        $data['hasInsurance'],
        $data['insuranceProvider'],
        $data['interestedInPaymentPlans'],
        $data['accessibilityNeeds'],
        $data['additionalInfo'],
        date('Y-m-d H:i:s')
    );
} elseif ($data['type'] === 'provider') {
    $sql = "INSERT INTO provider_surveys (name, email, phone, role, experience, specialization, availability, preferred_areas, services, certifications, additional_comments, submitted_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssssssss", 
        $data['name'],
        $data['email'],
        $data['phone'],
        $data['role'],
        $data['experience'],
        $data['specialization'],
        $data['availability'],
        $data['preferredAreas'],
        implode(", ", $data['services']),
        $data['certifications'],
        $data['additionalComments'],
        date('Y-m-d H:i:s')
    );
} else {
    echo json_encode(["message" => "Invalid survey type"]);
    exit();
}

if ($stmt->execute()) {
    // Send email
    require 'vendor/autoload.php';

    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $config['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $config['SMTP_USER'];
        $mail->Password   = $config['SMTP_PASS'];
        $mail->SMTPSecure = $config['SMTP_SECURE'];
        $mail->Port       = $config['SMTP_PORT'];

        $mail->setFrom('noreply@rushhealthc.com', 'RUSH Platform');
        $mail->addAddress('info@rushhealthc.com');
        $mail->Subject = "New " . ucfirst($data['type']) . " Survey Submission";
        $mail->Body    = "A new " . $data['type'] . " survey has been submitted. Details:\n\n" . print_r($data, true);

        if ($mail->send()) {
            echo json_encode(["message" => "Survey submitted successfully"]);
        } else {
            echo json_encode(["message" => "Survey saved but email notification failed"]);
        }
    } catch (Exception $e) {
        echo json_encode(["message" => "Survey saved but email notification failed: " . $mail->ErrorInfo]);
    }
} else {
    echo json_encode(["message" => "Failed to submit survey"]);
}

$stmt->close();
$conn->close();