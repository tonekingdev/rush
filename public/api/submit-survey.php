<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database connection
$servername = "localhost";
$username = "u382076499_serviceadmin";
$password = "Ru$hdb0106!";
$dbname = "rush_healthcare";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
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
    $sql = "INSERT INTO provider_surveys (name, email, phone, role, experience, specialization, availability, preferred_areas, certifications, additional_comments, submitted_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssssss", 
        $data['name'],
        $data['email'],
        $data['phone'],
        $data['role'],
        $data['experience'],
        $data['specialization'],
        $data['availability'],
        $data['preferredAreas'],
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
    $to = "info@rushhealthc.com";
    $subject = "New " . ucfirst($data['type']) . " Survey Submission";
    $message = "A new " . $data['type'] . " survey has been submitted. Details:\n\n" . print_r($data, true);
    $headers = "From: noreply@rushhealthc.com";

    if (mail($to, $subject, $message, $headers)) {
        echo json_encode(["message" => "Survey submitted successfully"]);
    } else {
        echo json_encode(["message" => "Survey saved but email notification failed"]);
    }
} else {
    echo json_encode(["message" => "Failed to submit survey"]);
}

$stmt->close();
$conn->close();
?>