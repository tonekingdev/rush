<?php
session_start();
$config = require_once '../includes/config.php';

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

// Check if ID is provided
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid communication ID']);
    exit;
}

$id = (int)$_GET['id'];

// Connect to database
$conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get communication details
$stmt = $conn->prepare("SELECT c.*, a.full_name, a.email 
                        FROM provider_communications c
                        LEFT JOIN provider_applications a ON c.application_id = a.id
                        WHERE c.id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Communication not found']);
    exit;
}

$communication = $result->fetch_assoc();
$stmt->close();
$conn->close();

// Format the date
$communication['sent_at'] = date('M d, Y g:i A', strtotime($communication['sent_at']));

// Return the communication details as JSON
header('Content-Type: application/json');
echo json_encode($communication);