<?php
session_start();
$config = require_once '/../includes/config.php';
require_once '../includes/email-templates.php';

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Connect to database
$conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create communications table if it doesn't exist
$createTableSql = "CREATE TABLE IF NOT EXISTS provider_communications (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    application_id INT(11) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_by VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES provider_applications(id) ON DELETE CASCADE
)";
$conn->query($createTableSql);

// Pagination settings
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 10;
$offset = ($page - 1) * $limit;

// Get total count for pagination
$countSql = "SELECT COUNT(*) as total FROM provider_communications";
$countResult = $conn->query($countSql);
$totalRows = 0;
if ($countResult) {
    $totalRows = $countResult->fetch_assoc()['total'];
}
$totalPages = ceil($totalRows / $limit);

// Get communications with pagination
$communications = [];
$sql = "SELECT c.*, a.full_name, a.email, a.status 
        FROM provider_communications c
        LEFT JOIN provider_applications a ON c.application_id = a.id
        ORDER BY c.sent_at DESC LIMIT $offset, $limit";
$result = $conn->query($sql);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $communications[] = $row;
    }
}

// Include header
$pageTitle = "Communications";
include 'includes/header.php';
?>

<div class="container-fluid px-4">
    <h1 class="mt-4">Provider Communications</h1>
    <ol class="breadcrumb mb-4">
        <li class="breadcrumb-item"><a href="index.php">Dashboard</a></li>
        <li class="breadcrumb-item active">Communications</li>
    </ol>
    
    <!-- Display success/error messages -->
    <?php if (isset($_SESSION['success_message'])): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <?php echo $_SESSION['success_message']; unset($_SESSION['success_message']); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
    <?php if (isset($_SESSION['error_messages'])): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <ul class="mb-0">
                <?php foreach ($_SESSION['error_messages'] as $error): ?>
                    <li><?php echo $error; ?></li>
                <?php endforeach; ?>
                <?php unset($_SESSION['error_messages']); ?>
            </ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
    <!-- New Email Button -->
    <div class="card mb-4">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-0">Email Communications</h5>
                    <p class="text-muted mb-0">Manage all provider email communications</p>
                </div>
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newEmailModal">
                    <i class="fas fa-envelope me-1"></i> New Email
                </button>
            </div>
        </div>
    </div>
    
    <!-- Communications Table -->
    <div class="card mb-4">
        <div class="card-header">
            <i class="fas fa-envelope me-1"></i>
            Communication History
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Recipient</th>
                            <th>Subject</th>
                            <th>Sent By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($communications)): ?>
                            <?php foreach ($communications as $comm): ?>
                                <tr>
                                    <td><?php echo date('M d, Y g:i A', strtotime($comm['sent_at'])); ?></td>
                                    <td>
                                        <?php echo htmlspecialchars($comm['recipient_name']); ?>
                                        <br>
                                        <small class="text-muted"><?php echo htmlspecialchars($comm['recipient_email']); ?></small>
                                    </td>
                                    <td><?php echo htmlspecialchars($comm['subject']); ?></td>
                                    <td><?php echo htmlspecialchars($comm['sent_by']); ?></td>
                                    <td>
                                        <button type="button" class="btn btn-primary btn-sm" onclick="viewCommunication(<?php echo $comm['id']; ?>)">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                        <button type="button" class="btn btn-info btn-sm" onclick="replyToEmail('<?php echo htmlspecialchars($comm['recipient_name']); ?>', '<?php echo htmlspecialchars($comm['recipient_email']); ?>', '<?php echo htmlspecialchars($comm['subject']); ?>')">
                                            <i class="fas fa-reply"></i> Reply
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="5" class="text-center">No communications found.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
            
            <!-- Pagination -->
            <?php if ($totalPages > 1): ?>
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center mt-4">
                        <li class="page-item <?php echo $page <= 1 ? 'disabled' : ''; ?>">
                            <a class="page-link" href="?page=<?php echo $page - 1; ?>" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                        
                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <li class="page-item <?php echo $page == $i ? 'active' : ''; ?>">
                                <a class="page-link" href="?page=<?php echo $i; ?>">
                                    <?php echo $i; ?>
                                </a>
                            </li>
                        <?php endfor; ?>
                        
                        <li class="page-item <?php echo $page >= $totalPages ? 'disabled' : ''; ?>">
                            <a class="page-link" href="?page=<?php echo $page + 1; ?>" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- New Email Modal -->
<div class="modal fade" id="newEmailModal" tabindex="-1" aria-labelledby="newEmailModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="newEmailModalLabel">New Email</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="send-email.php" method="post">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="providerSelect" class="form-label">Select Provider</label>
                        <select class="form-select" id="providerSelect" name="applicationId" required onchange="updateRecipientInfo()">
                            <option value="">Select a provider</option>
                            <?php
                            // Get all providers
                            $providersSql = "SELECT id, full_name, email FROM provider_applications ORDER BY full_name ASC";
                            $providersResult = $conn->query($providersSql);
                            if ($providersResult) {
                                while ($provider = $providersResult->fetch_assoc()) {
                                    echo '<option value="' . $provider['id'] . '" data-name="' . htmlspecialchars($provider['full_name']) . '" data-email="' . htmlspecialchars($provider['email']) . '">' . htmlspecialchars($provider['full_name']) . '</option>';
                                }
                            }
                            ?>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="recipientName" class="form-label">Recipient Name</label>
                        <input type="text" class="form-control" id="recipientName" name="recipientName" readonly>
                    </div>
                    
                    <div class="mb-3">
                        <label for="recipientEmail" class="form-label">Recipient Email</label>
                        <input type="email" class="form-control" id="recipientEmail" name="recipientEmail" readonly>
                    </div>
                    
                    <div class="mb-3">
                        <label for="emailSubject" class="form-label">Subject</label>
                        <input type="text" class="form-control" id="emailSubject" name="emailSubject" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="emailTemplate" class="form-label">Email Template</label>
                        <select class="form-select" id="emailTemplate" name="emailTemplate" onchange="loadTemplate()">
                            <option value="">Select a template</option>
                            <option value="application_received">Application Received</option>
                            <option value="application_approved">Application Approved</option>
                            <option value="application_rejected">Application Rejected</option>
                            <option value="documents_required">Additional Documents Required</option>
                            <option value="interview_request">Interview Request</option>
                            <option value="custom">Custom Message</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="emailMessage" class="form-label">Message</label>
                        <textarea class="form-control" id="emailMessage" name="emailMessage" rows="10" required></textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Email Preview</label>
                        <div class="border p-3 rounded" style="max-height: 300px; overflow-y: auto;">
                            <div class="alert alert-info">
                                Select a template and enter your message to see a preview of the email.
                            </div>
                            <div id="emailPreview" style="display: none;"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-info" onclick="previewEmail()">Preview Email</button>
                    <button type="submit" class="btn btn-primary">Send Email</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- View Communication Modal -->
<div class="modal fade" id="viewCommunicationModal" tabindex="-1" aria-labelledby="viewCommunicationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="viewCommunicationModalLabel">View Communication</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label">Date</label>
                    <p id="viewDate" class="form-control-plaintext"></p>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">From</label>
                    <p id="viewFrom" class="form-control-plaintext"></p>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">To</label>
                    <p id="viewTo" class="form-control-plaintext"></p>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Subject</label>
                    <p id="viewSubject" class="form-control-plaintext"></p>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Message</label>
                    <div id="viewMessage" class="form-control" style="min-height: 200px; overflow-y: auto; white-space: pre-wrap;"></div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Email Preview</label>
                    <div class="border p-3 rounded" style="max-height: 300px; overflow-y: auto;">
                        <iframe id="viewEmailPreview" style="width: 100%; height: 400px; border: none;"></iframe>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="replyButton">Reply</button>
            </div>
        </div>
    </div>
</div>

<script>
function updateRecipientInfo() {
    const select = document.getElementById('providerSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        document.getElementById('recipientName').value = selectedOption.getAttribute('data-name');
        document.getElementById('recipientEmail').value = selectedOption.getAttribute('data-email');
    } else {
        document.getElementById('recipientName').value = '';
        document.getElementById('recipientEmail').value = '';
    }
}

function loadTemplate() {
    const template = document.getElementById('emailTemplate').value;
    const recipientName = document.getElementById('recipientName').value.split(' ')[0]; // Get first name
    let message = '';
    let subject = '';
    
    switch(template) {
        case 'application_received':
            subject = 'RUSH Healthcare: Application Received';
            message = `Dear ${recipientName},\n\nThank you for submitting your application to become a provider with RUSH Healthcare. We have received your application and it is currently under review.\n\nOur team will carefully evaluate your qualifications and experience. This process typically takes 3-5 business days. We will contact you once the review is complete or if we need any additional information.\n\nIf you have any questions in the meantime, please don't hesitate to contact us.\n\nBest regards,\nRUSH Healthcare Team`;
            break;
        case 'application_approved':
            subject = 'RUSH Healthcare: Application Approved';
            message = `Dear ${recipientName},\n\nCongratulations! We are pleased to inform you that your application to become a provider with RUSH Healthcare has been approved.\n\nThe next steps in the onboarding process are:\n1. Complete your background check (if not already done)\n2. Verify your malpractice insurance coverage\n3. Schedule an orientation session.\n\nPlease contact our credentialing department at credentialing@rushhealthc.com to schedule your orientation.\n\nWelcome to the RUSH Healthcare team!\n\nBest regards,\nRUSH Healthcare Team`;
            break;
        case 'application_rejected':
            subject = 'RUSH Healthcare: Application Status Update';
            message = `Dear ${recipientName},\n\nThank you for your interest in becoming a provider with RUSH Healthcare.\n\nAfter careful review of your application, we regret to inform you that we are unable to proceed with your application at this time.\n\nIf you have any questions or would like feedback on your application, please contact our credentialing department.\n\nWe appreciate your interest in RUSH Healthcare and wish you the best in your professional endeavors.\n\nBest regards,\nRUSH Healthcare Team`;
            break;
        case 'documents_required':
            subject = 'RUSH Healthcare: Additional Documents Required';
            message = `Dear ${recipientName},\n\nThank you for submitting your application to RUSH Healthcare.\n\nUpon review, we find that we need additional documentation to complete the processing of your application. Please provide the following:\n\n- [List required documents here]\n\nYou can upload these documents directly through our provider portal or email them to credentialing@rushhealthc.com.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nRUSH Healthcare Team`;
            break;
        case 'interview_request':
            subject = 'RUSH Healthcare: Interview Request';
            message = `Dear ${recipientName},\n\nThank you for your application to RUSH Healthcare.\n\nWe would like to schedule an interview to discuss your application and experience in more detail. Please let us know your availability for the next week.\n\nThe interview will take approximately 30 minutes and can be conducted via phone or video conference, whichever you prefer.\n\nPlease reply to this email with your preferred date, time, and interview method.\n\nWe look forward to speaking with you.\n\nBest regards,\nRUSH Healthcare Team`;
            break;
        case 'custom':
            subject = 'RUSH Healthcare: ';
            message = `Dear ${recipientName},\n\n[Your custom message here]\n\nBest regards,\nRUSH Healthcare Team`;
            break;
    }
    
    document.getElementById('emailSubject').value = subject;
    document.getElementById('emailMessage').value = message;
}

function previewEmail() {
    const template = document.getElementById('emailTemplate').value;
    const recipientName = document.getElementById('recipientName').value;
    const emailSubject = document.getElementById('emailSubject').value;
    const emailMessage = document.getElementById('emailMessage').value;
    
    if (!template || !recipientName || !emailSubject || !emailMessage) {
        alert('Please fill in all required fields to preview the email.');
        return;
    }
    
    // Make an AJAX request to get the email preview
    fetch('preview-email.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            template: template,
            recipientName: recipientName,
            emailSubject: emailSubject,
            emailMessage: emailMessage
        })
    })
    .then(response => response.text())
    .then(html => {
        const previewDiv = document.getElementById('emailPreview');
        previewDiv.innerHTML = html;
        previewDiv.style.display = 'block';
        document.querySelector('.alert-info').style.display = 'none';
    })
    .catch(error => {
        console.error('Error generating preview:', error);
        alert('Error generating email preview.');
    });
}

function viewCommunication(id) {
    // Fetch the communication details from the server
    fetch('get-communication.php?id=' + id)
        .then(response => response.json())
        .then(data => {
            document.getElementById('viewDate').textContent = data.sent_at;
            document.getElementById('viewFrom').textContent = data.sent_by;
            document.getElementById('viewTo').textContent = data.recipient_name + ' <' + data.recipient_email + '>';
            document.getElementById('viewSubject').textContent = data.subject;
            document.getElementById('viewMessage').textContent = data.message;
            
            // Generate email preview
            fetch('preview-email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    template: 'custom',
                    recipientName: data.recipient_name,
                    emailSubject: data.subject,
                    emailMessage: data.message
                })
            })
            .then(response => response.text())
            .then(html => {
                const iframe = document.getElementById('viewEmailPreview');
                iframe.srcdoc = html;
            });
            
            // Set up reply button
            document.getElementById('replyButton').onclick = function() {
                replyToEmail(data.recipient_name, data.recipient_email, 'Re: ' + data.subject);
                $('#viewCommunicationModal').modal('hide');
            };
            
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('viewCommunicationModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Error fetching communication:', error);
            alert('Error fetching communication details.');
        });
}

function replyToEmail(name, email, subject) {
    // Set up the new email modal with reply information
    document.getElementById('providerSelect').value = '';
    document.getElementById('recipientName').value = name;
    document.getElementById('recipientEmail').value = email;
    document.getElementById('emailSubject').value = subject.startsWith('Re:') ? subject : 'Re: ' + subject;
    document.getElementById('emailTemplate').value = 'custom';
    document.getElementById('emailMessage').value = `Dear ${name.split(' ')[0]},\n\n\n\nBest regards,\nRUSH Healthcare Team`;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('newEmailModal'));
    modal.show();
}
</script>

<?php
$conn->close();
include 'includes/footer.php';
?>