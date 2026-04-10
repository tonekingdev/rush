import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, email, phone, reason, additionalInfo } = data

    // Validate required fields
    if (!name || !email || !phone || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Insert deletion request into database
    await query(
      `INSERT INTO account_deletion_requests 
       (name, email, phone, reason, additional_info, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [name.trim(), email.toLowerCase().trim(), phone.trim(), reason, additionalInfo || null]
    )

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: "Account Deletion Request Received - RUSH Healthcare",
      html: `
        <h2>Account Deletion Request Received</h2>
        <p>Dear ${name},</p>
        <p>We have received your request to delete your RUSH Healthcare account.</p>
        <p>Our team will review your request and process it within 30 days as required by applicable data protection regulations.</p>
        <p>If you did not make this request, please contact us immediately.</p>
        <p>Best regards,<br>The RUSH Healthcare Team</p>
      `,
    })

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@rushhealthcare.com"
    await sendEmail({
      to: adminEmail,
      subject: "New Account Deletion Request",
      html: `
        <h2>New Account Deletion Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        ${additionalInfo ? `<p><strong>Additional Info:</strong> ${additionalInfo}</p>` : ""}
        <p>Please review and process this request in the admin dashboard.</p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Your account deletion request has been submitted successfully.",
    })
  } catch (error) {
    console.error("Account deletion request error:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}
