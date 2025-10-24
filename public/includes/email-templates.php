<?php
/**
 * Email templates for Rush Healthcare Admin
 */

/**
 * Process an email template by replacing placeholders with actual content
 * 
 * @param string $template The HTML template
 * @param array $replacements Key-value pairs of placeholders and their replacements
 * @return string The processed template
 */
function process_email_template($template, $replacements) {
    // Add current year if not provided
    if (!isset($replacements['{YEAR}'])) {
        $replacements['{YEAR}'] = date('Y');
    }
    
    // Replace all placeholders
    return str_replace(array_keys($replacements), array_values($replacements), $template);
}

/**
 * Get the weekly survey report email template
 * 
 * @return string The HTML template
 */
function get_weekly_survey_template() {
    return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RUSH Healthcare Weekly Survey Report</title>
</head>
<body style="font-family: \'Arial\', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #1586D6; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">RUSH Healthcare Weekly Survey Report</h1>
        </div>
        <div style="padding: 20px;">
            <div style="background-color: #e9f5ff; padding: 20px; margin-bottom: 20px; border-radius: 5px;">
                {SUMMARY}
            </div>
            <div style="margin-bottom: 20px;">
                {SURVEY_DATA}
            </div>
        </div>
        <div style="background-color: #333333; color: #ffffff; text-align: center; padding: 15px; font-size: 12px;">
            &copy; {YEAR} RUSH Healthcare. All rights reserved.
        </div>
    </div>
</body>
</html>';
}

/**
 * Get the provider application submission email template
 * 
 * @return string The HTML template
 */
function get_provider_application_template() {
    return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RUSH Healthcare Provider Application Submission</title>
</head>
<body style="font-family: \'Arial\', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #1586D6; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">RUSH Healthcare Provider Application</h1>
        </div>
        <div style="padding: 20px;">
            <div style="background-color: #e9f5ff; padding: 20px; margin-bottom: 20px; border-radius: 5px;">
                {SUMMARY}
            </div>
            <div style="margin-bottom: 20px;">
                {PROVIDER_DATA}
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1586D6; margin-bottom: 20px;">
                <p style="margin-top: 0; font-weight: bold;">Next Steps:</p>
                <ol style="margin-bottom: 0; padding-left: 20px;">
                    <li>Review the application details</li>
                    <li>Check the attached signed documents</li>
                    <li>Verify credentials and background check</li>
                    <li>Schedule an interview with the applicant</li>
                </ol>
            </div>
        </div>
        <div style="background-color: #333333; color: #ffffff; text-align: center; padding: 15px; font-size: 12px;">
            &copy; {YEAR} RUSH Healthcare. All rights reserved.
        </div>
    </div>
</body>
</html>';
}

/**
 * Get the applicant thank you email template
 * 
 * @return string The HTML template
 */
function get_applicant_thank_you_template() {
    return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Your RUSH Healthcare Application</title>
</head>
<body style="font-family: \'Arial\', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #1586D6; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Thank You for Your Application</h1>
        </div>
        <div style="padding: 30px 20px;">
            <p style="margin-top: 0;">Dear {APPLICANT_NAME},</p>
            
            <p>Thank you for your interest in becoming a healthcare provider with RUSH Healthcare. We have received your application and appreciate your interest in joining our network.</p>
            
            <div style="background-color: #e9f5ff; padding: 20px; margin: 25px 0; border-radius: 5px;">
                <p style="margin-top: 0; font-weight: bold;">What happens next?</p>
                <ul style="margin-bottom: 0; padding-left: 20px;">
                    <li>Our credentialing team will review your application</li>
                    <li>The credentialing process can take up to 2 weeks to complete</li>
                    <li>You may be contacted for additional information if needed</li>
                    <li>Once approved, you\'ll receive an email with next steps</li>
                </ul>
            </div>
            
            <p>If you have any questions or concerns during this process, please don\'t hesitate to contact our credentialing team:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1586D6; margin-bottom: 20px;">
                <p style="margin: 0;">Email: <a href="mailto:credentialing@rushhealthc.com" style="color: #1586D6; text-decoration: none;">credentialing@rushhealthc.com</a></p>
                <p style="margin: 5px 0 0 0;">Phone: <a href="tel:5863444567" style="color: #1586D6; text-decoration: none;">586-344-4567</a></p>
            </div>
            
            <p>We look forward to the possibility of working with you!</p>
            
            <p style="margin-bottom: 0;">Sincerely,<br>
            The RUSH Healthcare Team</p>
        </div>
        <div style="background-color: #333333; color: #ffffff; text-align: center; padding: 15px; font-size: 12px;">
            &copy; {YEAR} RUSH Healthcare. All rights reserved.
        </div>
    </div>
</body>
</html>';
}

/**
 * Get the application status update email template
 * 
 * @return string The HTML template
 */
function get_application_status_template() {
    return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RUSH Healthcare Application Status Update</title>
</head>
<body style="font-family: \'Arial\', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #1586D6; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Application Status Update</h1>
        </div>
        <div style="padding: 30px 20px;">
            <p style="margin-top: 0;">Dear {APPLICANT_NAME},</p>
            
            <p>We are writing to inform you about the status of your application with RUSH Healthcare.</p>
            
            <div style="background-color: #e9f5ff; padding: 20px; margin: 25px 0; border-radius: 5px;">
                <p style="margin-top: 0; font-weight: bold;">Application Status: {APPLICATION_STATUS}</p>
                <div style="margin-bottom: 0;">
                    {STATUS_DETAILS}
                </div>
            </div>
            
            <p>If you have any questions or need further clarification, please contact our credentialing team:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1586D6; margin-bottom: 20px;">
                <p style="margin: 0;">Email: <a href="mailto:credentialing@rushhealthc.com" style="color: #1586D6; text-decoration: none;">credentialing@rushhealthc.com</a></p>
                <p style="margin: 5px 0 0 0;">Phone: <a href="tel:5863444567" style="color: #1586D6; text-decoration: none;">586-344-4567</a></p>
            </div>
            
            <p style="margin-bottom: 0;">Sincerely,<br>
            The RUSH Healthcare Team</p>
        </div>
        <div style="background-color: #333333; color: #ffffff; text-align: center; padding: 15px; font-size: 12px;">
            &copy; {YEAR} RUSH Healthcare. All rights reserved.
        </div>
    </div>
</body>
</html>';
}

/**
 * Get the document request email template
 * 
 * @return string The HTML template
 */
function get_document_request_template() {
    return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RUSH Healthcare Document Request</title>
</head>
<body style="font-family: \'Arial\', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #1586D6; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Document Request</h1>
        </div>
        <div style="padding: 30px 20px;">
            <p style="margin-top: 0;">Dear {APPLICANT_NAME},</p>
            
            <p>Thank you for your application with RUSH Healthcare. To proceed with your application, we need the following documents:</p>
            
            <div style="background-color: #e9f5ff; padding: 20px; margin: 25px 0; border-radius: 5px;">
                <p style="margin-top: 0; font-weight: bold;">Required Documents:</p>
                <div style="margin-bottom: 0;">
                    {DOCUMENT_LIST}
                </div>
            </div>
            
            <p>Please upload these documents to your application portal or email them directly to our credentialing team:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1586D6; margin-bottom: 20px;">
                <p style="margin: 0;">Email: <a href="mailto:credentialing@rushhealthc.com" style="color: #1586D6; text-decoration: none;">credentialing@rushhealthc.com</a></p>
                <p style="margin: 5px 0 0 0;">Phone: <a href="tel:5863444567" style="color: #1586D6; text-decoration: none;">586-344-4567</a></p>
            </div>
            
            <p>We appreciate your prompt attention to this request.</p>
            
            <p style="margin-bottom: 0;">Sincerely,<br>
            The RUSH Healthcare Team</p>
        </div>
        <div style="background-color: #333333; color: #ffffff; text-align: center; padding: 15px; font-size: 12px;">
            &copy; {YEAR} RUSH Healthcare. All rights reserved.
        </div>
    </div>
</body>
</html>';
}

/**
 * Get the custom email template
 * 
 * @return string The HTML template
 */
function get_custom_email_template() {
    return '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{EMAIL_SUBJECT}</title>
</head>
<body style="font-family: \'Arial\', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #1586D6; color: #ffffff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">{EMAIL_SUBJECT}</h1>
        </div>
        <div style="padding: 30px 20px;">
            <p style="margin-top: 0;">Dear {RECIPIENT_NAME},</p>
            
            <div style="margin: 25px 0;">
                {EMAIL_CONTENT}
            </div>
            
            <p style="margin-bottom: 0;">Sincerely,<br>
            The RUSH Healthcare Team</p>
        </div>
        <div style="background-color: #333333; color: #ffffff; text-align: center; padding: 15px; font-size: 12px;">
            &copy; {YEAR} RUSH Healthcare. All rights reserved.
        </div>
    </div>
</body>
</html>';
}