<?php
// Set proper headers
header('Content-Type: application/json');

// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';

// CORS headers
$allowedOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowedDomains = $config['ALLOWED_DOMAINS'] ?? ['https://rushhealthc.com', 'https://www.rushhealthc.com'];

if (in_array($allowedOrigin, $allowedDomains)) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
require_once $_SERVER['DOCUMENT_ROOT'] . '/api/session-config.php';

// Check authentication
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

// Check if user has subscription management access
function hasSubscriptionAccess($conn, $userId) {
    $stmt = $conn->prepare("SELECT username, role FROM admin_users WHERE id = ? AND status = 'active'");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        // Allow access for super_admin or specific usernames
        $allowedUsers = ['admin', 'slewis', 'tone'];
        return $user['role'] === 'super_admin' || in_array($user['username'], $allowedUsers);
    }
    
    return false;
}

// Database connection
try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
} catch (Exception $e) {
    error_log("Database connection error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

// Check subscription access
if (!hasSubscriptionAccess($conn, $_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Access denied. You do not have permission to manage RUSH Subscriptions.']);
    exit();
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get all RUSH Subscriptions with user details
            $sql = "SELECT 
                        us.id,
                        us.user_id,
                        u.full_name,
                        u.email,
                        u.phone_number,
                        us.subscription_status,
                        us.start_date,
                        us.end_date,
                        us.next_visit_date,
                        us.visits_used_this_month,
                        us.visits_remaining_this_month,
                        us.last_visit_date,
                        us.monthly_price,
                        us.total_paid,
                        us.payment_method,
                        us.payment_status,
                        us.auto_renew,
                        us.notes,
                        us.created_at,
                        us.updated_at
                    FROM user_subscriptions us
                    LEFT JOIN users u ON us.user_id = u.user_id
                    ORDER BY us.created_at DESC";
            
            $result = $conn->query($sql);
            
            if (!$result) {
                throw new Exception("Query failed: " . $conn->error);
            }
            
            $subscriptions = [];
            while ($row = $result->fetch_assoc()) {
                $subscription = [
                    'id' => (int)$row['id'],
                    'user_id' => $row['user_id'],
                    'full_name' => $row['full_name'] ?? 'Unknown User',
                    'email' => $row['email'] ?? 'No Email',
                    'phone_number' => $row['phone_number'] ?? 'No Phone',
                    'subscription_status' => $row['subscription_status'],
                    'start_date' => $row['start_date'],
                    'end_date' => $row['end_date'],
                    'next_visit_date' => $row['next_visit_date'],
                    'visits_used_this_month' => (int)$row['visits_used_this_month'],
                    'visits_remaining_this_month' => (int)$row['visits_remaining_this_month'],
                    'last_visit_date' => $row['last_visit_date'],
                    'monthly_price' => (float)$row['monthly_price'],
                    'total_paid' => (float)$row['total_paid'],
                    'payment_method' => $row['payment_method'],
                    'payment_status' => $row['payment_status'],
                    'auto_renew' => (bool)$row['auto_renew'],
                    'notes' => $row['notes'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
                $subscriptions[] = $subscription;
            }
            
            echo json_encode([
                'success' => true,
                'subscriptions' => $subscriptions,
                'total' => count($subscriptions)
            ]);
            break;
            
        case 'POST':
            // Create new RUSH Subscription for a user
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['user_id'])) {
                echo json_encode(['success' => false, 'error' => 'User ID is required']);
                exit();
            }
            
            // Check if user already has an active subscription
            $checkStmt = $conn->prepare("SELECT id FROM user_subscriptions WHERE user_id = ? AND subscription_status = 'active'");
            $checkStmt->bind_param("s", $input['user_id']);
            $checkStmt->execute();
            $existing = $checkStmt->get_result();
            
            if ($existing->num_rows > 0) {
                echo json_encode(['success' => false, 'error' => 'User already has an active RUSH Subscription']);
                exit();
            }
            
            $stmt = $conn->prepare("INSERT INTO user_subscriptions (user_id, subscription_status, start_date, next_visit_date, monthly_price, payment_status, auto_renew) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $startDate = $input['start_date'] ?? date('Y-m-d');
            $nextVisitDate = $input['next_visit_date'] ?? date('Y-m-d', strtotime('+7 days'));
            $monthlyPrice = $input['monthly_price'] ?? 109.00;
            $paymentStatus = $input['payment_status'] ?? 'pending';
            $autoRenew = $input['auto_renew'] ?? true;
            $subscriptionStatus = $input['subscription_status'] ?? 'pending';
            
            $stmt->bind_param("ssssdsi", 
                $input['user_id'],
                $subscriptionStatus,
                $startDate,
                $nextVisitDate,
                $monthlyPrice,
                $paymentStatus,
                $autoRenew
            );
            
            if ($stmt->execute()) {
                $newId = $conn->insert_id;
                
                // Log the action
                $historyStmt = $conn->prepare("INSERT INTO subscription_history (subscription_id, action_type, new_status, performed_by) VALUES (?, 'created', ?, ?)");
                $historyStmt->bind_param("isi", $newId, $subscriptionStatus, $_SESSION['user_id']);
                $historyStmt->execute();
                
                error_log("RUSH Subscription created - ID: $newId, User: {$input['user_id']}, Admin: {$_SESSION['username']}");
                
                echo json_encode([
                    'success' => true,
                    'message' => 'RUSH Subscription created successfully',
                    'id' => $newId
                ]);
            } else {
                throw new Exception("Failed to create RUSH Subscription: " . $stmt->error);
            }
            break;
            
        case 'PUT':
            // Update RUSH Subscription
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                echo json_encode(['success' => false, 'error' => 'Subscription ID is required']);
                exit();
            }
            
            $subscriptionId = (int)$input['id'];
            $updateFields = [];
            $updateValues = [];
            $types = '';
            
            $allowedFields = [
                'subscription_status' => 's',
                'end_date' => 's',
                'next_visit_date' => 's',
                'visits_used_this_month' => 'i',
                'visits_remaining_this_month' => 'i',
                'last_visit_date' => 's',
                'payment_method' => 's',
                'payment_status' => 's',
                'monthly_price' => 'd',
                'total_paid' => 'd',
                'auto_renew' => 'i',
                'notes' => 's'
            ];
            
            foreach ($allowedFields as $field => $type) {
                if (isset($input[$field])) {
                    $updateFields[] = "$field = ?";
                    
                    if ($type === 'i' && is_bool($input[$field])) {
                        $updateValues[] = $input[$field] ? 1 : 0;
                    } else {
                        $updateValues[] = $input[$field];
                    }
                    
                    $types .= $type;
                }
            }
            
            if (empty($updateFields)) {
                echo json_encode(['success' => false, 'error' => 'No valid fields to update']);
                exit();
            }
            
            // Add cancelled_at timestamp if status is being changed to cancelled
            if (isset($input['subscription_status']) && $input['subscription_status'] === 'cancelled') {
                $updateFields[] = "cancelled_at = CURRENT_TIMESTAMP";
                $updateFields[] = "cancelled_by = ?";
                $updateValues[] = $_SESSION['user_id'];
                $types .= 'i';
            }
            
            $sql = "UPDATE user_subscriptions SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $updateValues[] = $subscriptionId;
            $types .= 'i';
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$updateValues);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    // Log the action in subscription history
                    $historyStmt = $conn->prepare("INSERT INTO subscription_history (subscription_id, action_type, new_status, performed_by) VALUES (?, ?, ?, ?)");
                    $actionType = isset($input['subscription_status']) ? 'status_changed' : 'updated';
                    $newStatus = $input['subscription_status'] ?? null;
                    $historyStmt->bind_param("issi", $subscriptionId, $actionType, $newStatus, $_SESSION['user_id']);
                    $historyStmt->execute();
                    
                    error_log("RUSH Subscription updated - ID: $subscriptionId, Admin: {$_SESSION['username']}");
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'RUSH Subscription updated successfully'
                    ]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Subscription not found or no changes made']);
                }
            } else {
                throw new Exception("Failed to update RUSH Subscription: " . $stmt->error);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    error_log("RUSH Subscription admin API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error occurred',
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>