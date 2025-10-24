<?php
// Set proper headers for production
header('Content-Type: application/json');

// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

// Use the actual domain in production
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedDomains = $config['ALLOWED_DOMAINS'] ?? ['https://rushhealthc.com', 'https://www.rushhealthc.com'];

if (in_array($allowedOrigin, $allowedDomains)) {
  header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Start session with proper configuration
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';

// Check authentication
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized', 'debug' => 'Session user_id not found']);
  exit();
}

try {
  $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
  
  if ($conn->connect_error) {
    throw new Exception("Connection failed: " . $conn->connect_error);
  }
  
  // Check if provider_applications table exists
  $tableCheck = $conn->query("SHOW TABLES LIKE 'provider_applications'");
  
  if ($tableCheck->num_rows === 0) {
    // Table doesn't exist, return default data
    echo json_encode([
      'success' => true,
      'data' => [
        ['status' => 'Pending', 'count' => 0],
        ['status' => 'Under Review', 'count' => 0],
        ['status' => 'Approved', 'count' => 0],
        ['status' => 'Rejected', 'count' => 0]
      ]
    ]);
    exit();
  }
  
  // Get application status counts
  $statusCounts = [
    'Pending' => 0,
    'Under Review' => 0,
    'Approved' => 0,
    'Rejected' => 0
  ];
  
  // Count pending applications
  $result = $conn->query("SELECT COUNT(*) as count FROM provider_applications WHERE status = 'pending'");
  if ($result) {
    $statusCounts['Pending'] = (int)$result->fetch_assoc()['count'];
  }
  
  // Count under review applications
  $result = $conn->query("SELECT COUNT(*) as count FROM provider_applications WHERE status = 'under_review'");
  if ($result) {
    $statusCounts['Under Review'] = (int)$result->fetch_assoc()['count'];
  }
  
  // Check if providers table exists
  $providersCheck = $conn->query("SHOW TABLES LIKE 'providers'");
  
  if ($providersCheck->num_rows > 0) {
    // Count active providers as approved applications
    $result = $conn->query("SELECT COUNT(*) as count FROM providers WHERE status = 'active'");
    if ($result) {
      $statusCounts['Approved'] = (int)$result->fetch_assoc()['count'];
    }
  } else {
    // If no providers table, just count approved applications
    $result = $conn->query("SELECT COUNT(*) as count FROM provider_applications WHERE status = 'approved'");
    if ($result) {
      $statusCounts['Approved'] = (int)$result->fetch_assoc()['count'];
    }
  }
  
  // Count rejected applications
  $result = $conn->query("SELECT COUNT(*) as count FROM provider_applications WHERE status = 'rejected'");
  if ($result) {
    $statusCounts['Rejected'] = (int)$result->fetch_assoc()['count'];
  }
  
  // Format data for chart
  $chartData = [];
  foreach ($statusCounts as $status => $count) {
    $chartData[] = [
      'status' => $status,
      'count' => $count
    ];
  }
  
  echo json_encode([
    'success' => true,
    'data' => $chartData
  ]);
  
  $conn->close();
} catch (Exception $e) {
  error_log('Application status chart error: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Failed to fetch application status data',
    'error' => $e->getMessage()
  ]);
}
?>