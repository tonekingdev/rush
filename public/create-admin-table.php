<?php
// One-time setup script to create admin users table
// IMPORTANT: Delete this file after running it once

$config = [
    'DB_HOST' => 'your-database-host',
    'DB_USER' => 'your-database-user', 
    'DB_PASS' => 'your-database-password',
    'DB_NAME' => 'your-database-name'
];

// Database connection
try {
    $conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
    
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
    echo "Connected to database successfully.<br>";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "<br>";
    exit(1);
}

// Create admin_users table
$createTableSql = "
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive') DEFAULT 'active'
)";

if ($conn->query($createTableSql)) {
    echo "admin_users table created successfully.<br>";
} else {
    echo "ERROR: Failed to create table: " . $conn->error . "<br>";
}

// Create initial admin user
$username = 'admin';
$email = 'admin@rushhealthc.com';
$password = password_hash('$2y$10$xcTWzYWmAkv.jU2wgqigEuFUP93qP9yEGW2OgmClnXG.3Dq4Zlpyy', PASSWORD_DEFAULT);
$role = 'super_admin';

$stmt = $conn->prepare("INSERT INTO admin_users (username, email, password, role) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $username, $email, $password, $role);

if ($stmt->execute()) {
    echo "Initial super admin user created successfully!<br>";
    echo "Username: $username<br>";
    echo "Email: $email<br>";
} else {
    echo "ERROR: Failed to create admin user: " . $stmt->error . "<br>";
}

$stmt->close();
$conn->close();

echo "<strong>SECURITY WARNING: Delete this setup file immediately!</strong>";
?>