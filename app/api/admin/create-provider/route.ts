import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import bcrypt from "bcryptjs"

function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { applicationId } = data

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Application ID required" },
        { status: 400 }
      )
    }

    // Get application details
    const appResult = await query(
      "SELECT * FROM provider_applications WHERE id = ?",
      [applicationId]
    )
    const application = (appResult as any[])[0]

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      )
    }

    // Check if provider already exists
    const existingProvider = await query(
      "SELECT id FROM providers WHERE email = ?",
      [application.email]
    )

    if (Array.isArray(existingProvider) && existingProvider.length > 0) {
      return NextResponse.json(
        { success: false, error: "Provider with this email already exists" },
        { status: 409 }
      )
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword()
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create provider
    const providerResult = await query(
      `INSERT INTO providers 
       (first_name, last_name, email, phone, npi_number, license_number, 
        specialty, password, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        application.first_name,
        application.last_name,
        application.email,
        application.phone,
        application.npi_number,
        application.license_number,
        application.specialty,
        hashedPassword,
      ]
    )

    const providerId = (providerResult as any).insertId

    // Update application status
    await query(
      "UPDATE provider_applications SET status = 'approved', provider_id = ?, updated_at = NOW() WHERE id = ?",
      [providerId, applicationId]
    )

    // Log activity
    await query(
      `INSERT INTO activity_log (user_id, action, description, entity_type, entity_id, created_at)
       VALUES (?, 'create_provider', ?, 'provider', ?, NOW())`,
      [auth.user?.id, `Created provider from application #${applicationId}`, providerId]
    )

    // Send welcome email with temporary password
    await sendEmail({
      to: application.email,
      subject: "Welcome to RUSH Healthcare - Your Provider Account",
      html: `
        <h2>Welcome to RUSH Healthcare!</h2>
        <p>Dear ${application.first_name},</p>
        <p>Your provider application has been approved and your account has been created.</p>
        <p>Here are your login credentials:</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <p>Best regards,<br>The RUSH Healthcare Team</p>
      `,
    })

    return NextResponse.json({
      success: true,
      providerId,
      message: "Provider created successfully",
    })
  } catch (error) {
    console.error("Error creating provider:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create provider" },
      { status: 500 }
    )
  }
}
