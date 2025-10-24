<?php
// Check if token and email are provided
$token = $_GET['token'] ?? '';
$email = $_GET['email'] ?? '';

if (empty($token) || empty($email)) {
    header('Location: login.php?error=Invalid+reset+link');
    exit();
}

// Load configuration
$config = require_once $_SERVER['DOCUMENT_ROOT'] . '/includes/config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - <?php echo htmlspecialchars($config['APP_NAME']); ?></title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css">
    <style>
        body {
            background-color: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .reset-form {
            max-width: 400px;
            width: 100%;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo img {
            max-width: 200px;
            height: auto;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .password-requirements {
            font-size: 0.8rem;
            color: #6c757d;
            margin-top: 10px;
        }
        .password-requirements ul {
            padding-left: 20px;
            margin-bottom: 0;
        }
    </style>
</head>
<body>
    <div class="reset-form">
        <div class="logo">
            <img src="../public/logo.png" alt="Rush Healthcare Logo">
        </div>
        <h2 class="text-center mb-4">Reset Password</h2>
        
        <div id="alert-container"></div>
        
        <form id="reset-password-form">
            <input type="hidden" id="token" value="<?php echo htmlspecialchars($token); ?>">
            <input type="hidden" id="email" value="<?php echo htmlspecialchars($email); ?>">
            
            <div class="form-group">
                <label for="password">New Password</label>
                <input type="password" class="form-control" id="password" required>
            </div>
            
            <div class="form-group">
                <label for="confirm-password">Confirm Password</label>
                <input type="password" class="form-control" id="confirm-password" required>
            </div>
            
            <div class="password-requirements">
                <p>Password must meet the following requirements:</p>
                <ul>
                    <li>At least 8 characters long</li>
                    <li>Include at least one uppercase letter</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                </ul>
            </div>
            
            <div class="d-grid gap-2 mt-4">
                <button type="submit" class="btn btn-primary" id="submit-btn">Reset Password</button>
                <a href="login.php" class="btn btn-outline-secondary">Back to Login</a>
            </div>
        </form>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('reset-password-form');
            const alertContainer = document.getElementById('alert-container');
            const submitBtn = document.getElementById('submit-btn');
            
            // First verify if token is valid
            verifyToken();
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                resetPassword();
            });
            
            function verifyToken() {
                const token = document.getElementById('token').value;
                const email = document.getElementById('email').value;
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Verifying...';
                
                fetch(`../api/admin-users-management.php?action=verify-token&token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.success) {
                            showAlert('danger', 'Invalid or expired reset link. Please request a new password reset.');
                            form.style.display = 'none';
                        } else {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Reset Password';
                        }
                    })
                    .catch(error => {
                        showAlert('danger', 'An error occurred while verifying the token. Please try again.');
                        console.error('Error:', error);
                    });
            }
            
            function resetPassword() {
                const token = document.getElementById('token').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                
                // Validate passwords match
                if (password !== confirmPassword) {
                    showAlert('danger', 'Passwords do not match.');
                    return;
                }
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Resetting...';
                
                fetch('../api/admin-users-management.php?action=complete-reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: token,
                        email: email,
                        password: password
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showAlert('success', 'Password has been reset successfully. You will be redirected to the login page.');
                        form.style.display = 'none';
                        setTimeout(() => {
                            window.location.href = 'login.php?message=Password+reset+successful';
                        }, 3000);
                    } else {
                        showAlert('danger', data.message || 'Failed to reset password. Please try again.');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Reset Password';
                    }
                })
                .catch(error => {
                    showAlert('danger', 'An error occurred. Please try again.');
                    console.error('Error:', error);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Reset Password';
                });
            }
            
            function showAlert(type, message) {
                alertContainer.innerHTML = `
                    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                        ${message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
            }
        });
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>