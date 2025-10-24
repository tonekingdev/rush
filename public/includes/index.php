<?php
session_start();
require_once '/../includes/config.php';

// Simple authentication (you should implement a more secure method)
if (!isset($_SESSION['admin']) && (!isset($_POST['username']) || !isset($_POST['password']))) {
    include 'login.php';
    exit();
} elseif (isset($_POST['username']) && isset($_POST['password'])) {
    if ($_POST['username'] === 'admin' && $_POST['password'] === 'password') {
        $_SESSION['admin'] = true;
    } else {
        include 'login.php';
        exit();
    }
}

$conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_POST['action']) && isset($_POST['id'])) {
    $id = $_POST['id'];
    $action = $_POST['action'];

    if ($action === 'approve' || $action === 'reject') {
        $sql = "UPDATE provider_applications SET status = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $status = $action === 'approve' ? 'approved' : 'rejected';
        $stmt->bind_param("si", $status, $id);
        $stmt->execute();

        if ($action === 'approve') {
            // Send approval email with Adalo platform credentials
            $application = getApplication($conn, $id);
            sendApprovalEmail($application);
        }
    }
}

$sql = "SELECT * FROM provider_applications WHERE status = 'pending'";
$result = $conn->query($sql);

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RUSH Healthcare Admin Panel</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">RUSH Healthcare Admin Panel</h1>
        <table class="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead class="bg-gray-200">
                <tr>
                    <th class="px-4 py-2">ID</th>
                    <th class="px-4 py-2">Name</th>
                    <th class="px-4 py-2">Email</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($row = $result->fetch_assoc()): ?>
                    <?php $data = json_decode($row['data'], true); ?>
                    <tr>
                        <td class="px-4 py-2"><?php echo $row['id']; ?></td>
                        <td class="px-4 py-2"><?php echo $data['fullName']; ?></td>
                        <td class="px-4 py-2"><?php echo $data['email']; ?></td>
                        <td class="px-4 py-2">
                            <form method="post" class="inline-block">
                                <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                                <input type="hidden" name="action" value="approve">
                                <button type="submit" class="bg-green-500 text-white px-2 py-1 rounded">Approve</button>
                            </form>
                            <form method="post" class="inline-block ml-2">
                                <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                                <input type="hidden" name="action" value="reject">
                                <button type="submit" class="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                            </form>
                        </td>
                    </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>
</body>
</html>

<?php
$conn->close();

function getApplication($conn, $id) {
    $sql = "SELECT * FROM provider_applications WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

function sendApprovalEmail($application) {
    $data = json_decode($application['data'], true);
    $to = $data['email'];
    $subject = 'RUSH Healthcare Application Approved';
    $message = "Dear {$data['fullName']},\n\n";
    $message .= "Your application to join RUSH Healthcare has been approved. ";
    $message .= "Please use the following link to create your credentials for the MVP app on the Adalo platform:\n\n";
    $message .= "https://app.adalo.com/rush-healthcare/signup\n\n";
    $message .= "Thank you for joining RUSH Healthcare!\n\n";
    $message .= "Best regards,\nRUSH Healthcare Team";

    $headers = 'From: info@rushhealthc.com' . "\r\n" .
        'Reply-To: info@rushhealthc.com' . "\r\n" .
        'X-Mailer: PHP/' . phpversion();

    mail($to, $subject, $message, $headers);
}
?>