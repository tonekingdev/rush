<?php
// Display errors for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Load configuration
$config = require __DIR__ . '/../includes/config.php';

echo "<h1>Provider Email Import (No Duplicates)</h1>";

try {
    // Connect to the database
    $mysqli = new mysqli(
        $config['DB_HOST'],
        $config['DB_USER'],
        $config['DB_PASS'],
        $config['DB_NAME']
    );

    if ($mysqli->connect_error) {
        throw new Exception("Database connection failed: " . $mysqli->connect_error);
    }
    
    echo "<p>Database connection successful</p>";
    
    // Check if provider_emails table exists
    $tableCheck = $mysqli->query("SHOW TABLES LIKE 'provider_emails'");
    
    if ($tableCheck->num_rows == 0) {
        echo "<p>Creating provider_emails table with UNIQUE constraint on email...</p>";
        
        // Create the table with a UNIQUE constraint on email
        $createTable = "CREATE TABLE IF NOT EXISTS provider_emails (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        if (!$mysqli->query($createTable)) {
            throw new Exception("Error creating table: " . $mysqli->error);
        }
        
        echo "<p style='color:green'>✓ Table created successfully with UNIQUE constraint on email</p>";
    } else {
        // Check if email column has a UNIQUE constraint
        $indexCheck = $mysqli->query("SHOW INDEX FROM provider_emails WHERE Column_name = 'email' AND Non_unique = 0");
        
        if ($indexCheck->num_rows == 0) {
            echo "<p>Adding UNIQUE constraint to email column...</p>";
            
            // First remove any duplicates that might exist
            $duplicateCheck = "CREATE TEMPORARY TABLE temp_emails AS
                              SELECT MIN(id) as id, email
                              FROM provider_emails
                              GROUP BY email";
            $mysqli->query($duplicateCheck);
            
            $mysqli->query("DELETE FROM provider_emails WHERE id NOT IN (SELECT id FROM temp_emails)");
            $mysqli->query("DROP TEMPORARY TABLE IF EXISTS temp_emails");
            
            // Now add the UNIQUE constraint
            $addUnique = "ALTER TABLE provider_emails ADD UNIQUE (email)";
            
            if ($mysqli->query($addUnique)) {
                echo "<p style='color:green'>✓ UNIQUE constraint added to email column</p>";
            } else {
                echo "<p style='color:red'>✗ Error adding UNIQUE constraint: " . $mysqli->error . "</p>";
            }
        } else {
            echo "<p style='color:green'>✓ Email column already has UNIQUE constraint</p>";
        }
    }
    
    // Now let's import provider emails
    
    // Method 1: Import from provider_surveys table
    $providersTableCheck = $mysqli->query("SHOW TABLES LIKE 'provider_surveys'");
    
    if ($providersTableCheck->num_rows > 0) {
        echo "<p>Importing emails from provider_surveys table (no duplicates)...</p>";
        
        // Check if provider_surveys table has an email column
        $result = $mysqli->query("SHOW COLUMNS FROM provider_surveys LIKE 'email'");
        
        if ($result->num_rows > 0) {
            // Import emails from provider_surveys table using INSERT IGNORE to skip duplicates
            $importQuery = "INSERT IGNORE INTO provider_emails (email, status)
                           SELECT DISTINCT email, 'active' FROM provider_surveys 
                           WHERE email IS NOT NULL AND email != '' AND email LIKE '%@%'";
            
            if ($mysqli->query($importQuery)) {
                $count = $mysqli->affected_rows;
                echo "<p style='color:green'>✓ Imported $count unique emails from provider_surveys table</p>";
            } else {
                echo "<p style='color:red'>✗ Error importing from provider_surveys table: " . $mysqli->error . "</p>";
            }
        } else {
            echo "<p style='color:orange'>! provider_surveys table exists but has no email column</p>";
        }
    } else {
        echo "<p style='color:orange'>! provider_surveys table does not exist</p>";
    }
    
    // Method 2: Import from a CSV file if available
    $csvFile = __DIR__ . '/provider_emails.csv';
    
    if (file_exists($csvFile)) {
        echo "<p>Importing emails from CSV file (no duplicates)...</p>";
        
        $file = fopen($csvFile, 'r');
        $count = 0;
        $uniqueEmails = [];
        
        // First collect all valid emails from the CSV
        while (($line = fgetcsv($file)) !== FALSE) {
            if (isset($line[0])) {
                $email = trim($line[0]);
                
                if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $uniqueEmails[$email] = true; // Using array keys ensures uniqueness
                }
            }
        }
        
        fclose($file);
        
        // Now insert the unique emails
        foreach (array_keys($uniqueEmails) as $email) {
            $email = $mysqli->real_escape_string($email);
            $insertQuery = "INSERT IGNORE INTO provider_emails (email, status) VALUES ('$email', 'active')";
            
            if ($mysqli->query($insertQuery)) {
                if ($mysqli->affected_rows > 0) {
                    $count++;
                }
            }
        }
        
        echo "<p style='color:green'>✓ Imported $count unique emails from CSV file</p>";
    } else {
        echo "<p style='color:orange'>! No CSV file found at $csvFile</p>";
    }
    
    // Method 3: Manual entry form
    echo "<h2>Manually Add Provider Emails (No Duplicates)</h2>";
    echo "<p>Enter one email per line:</p>";
    echo "<form method='post'>";
    echo "<textarea name='emails' rows='10' cols='50'></textarea><br><br>";
    echo "<input type='submit' name='submit' value='Add Emails'>";
    echo "</form>";
    
    if (isset($_POST['submit']) && !empty($_POST['emails'])) {
        $emails = explode("\n", $_POST['emails']);
        $uniqueEmails = [];
        $count = 0;
        
        // First collect all valid unique emails
        foreach ($emails as $email) {
            $email = trim($email);
            
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $uniqueEmails[$email] = true; // Using array keys ensures uniqueness
            }
        }
        
        // Now insert the unique emails
        foreach (array_keys($uniqueEmails) as $email) {
            $email = $mysqli->real_escape_string($email);
            
            // Check if this email already exists
            $checkQuery = "SELECT id FROM provider_emails WHERE email = '$email'";
            $result = $mysqli->query($checkQuery);
            
            if ($result->num_rows == 0) {
                // Email doesn't exist, insert it
                $insertQuery = "INSERT INTO provider_emails (email, status) VALUES ('$email', 'active')";
                
                if ($mysqli->query($insertQuery)) {
                    $count++;
                }
            }
        }
        
        echo "<p style='color:green'>✓ Added $count new unique emails manually</p>";
    }
    
    // Show current emails in the table
    $result = $mysqli->query("SELECT * FROM provider_emails ORDER BY id");
    $totalCount = $mysqli->query("SELECT COUNT(*) as total FROM provider_emails")->fetch_assoc()['total'];
    
    echo "<h2>Current Provider Emails ($totalCount total)</h2>";
    
    if ($result->num_rows > 0) {
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>ID</th><th>Email</th><th>Status</th><th>Created At</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . htmlspecialchars($row['email']) . "</td>";
            echo "<td>" . $row['status'] . "</td>";
            echo "<td>" . $row['created_at'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    } else {
        echo "<p>No emails in the table yet</p>";
    }
    
    // Option to remove duplicates if they somehow exist
    echo "<h2>Maintenance</h2>";
    echo "<form method='post'>";
    echo "<input type='submit' name='remove_duplicates' value='Remove Duplicate Emails (if any)'>";
    echo "</form>";
    
    if (isset($_POST['remove_duplicates'])) {
        // Find and remove any duplicate emails
        $findDuplicates = "SELECT email, COUNT(*) as count FROM provider_emails GROUP BY email HAVING count > 1";
        $result = $mysqli->query($findDuplicates);
        
        if ($result->num_rows > 0) {
            echo "<p>Found " . $result->num_rows . " duplicate email(s). Removing duplicates...</p>";
            
            while ($row = $result->fetch_assoc()) {
                $email = $mysqli->real_escape_string($row['email']);
                
                // Keep the lowest ID (oldest) record and delete others
                $deleteQuery = "DELETE FROM provider_emails 
                               WHERE email = '$email' 
                               AND id NOT IN (SELECT MIN(id) FROM (SELECT id FROM provider_emails WHERE email = '$email') as temp)";
                
                $mysqli->query($deleteQuery);
            }
            
            echo "<p style='color:green'>✓ Duplicates removed successfully</p>";
        } else {
            echo "<p style='color:green'>✓ No duplicate emails found</p>";
        }
    }
    
    // Close connection
    $mysqli->close();
    
} catch (Exception $e) {
    echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
}
?>