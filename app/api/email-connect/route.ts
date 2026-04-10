import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let data: Record<string, string>

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData()
      data = Object.fromEntries(formData.entries()) as Record<string, string>
    } else {
      data = await request.json()
    }

    const { name, occupation, email, website, form_start_time, submission_time } = data

    // Basic spam detection - check timing
    const startTime = parseInt(form_start_time || "0")
    const submitTime = parseInt(submission_time || "0")
    const timeDiff = submitTime - startTime

    // If form was filled too quickly (less than 3 seconds), it's likely a bot
    if (timeDiff < 3000) {
      return NextResponse.json(
        { success: false, error: "Submission rejected" },
        { status: 400 }
      )
    }

    // Honeypot check - if website field is filled, it's a bot
    if (website && website.trim() !== "") {
      return NextResponse.json(
        { success: false, error: "Submission rejected" },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!name || !email || !occupation) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingResult = await query(
      "SELECT id FROM email_connects WHERE email = ?",
      [email.toLowerCase().trim()]
    )

    if (Array.isArray(existingResult) && existingResult.length > 0) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      )
    }

    // Insert into database
    await query(
      `INSERT INTO email_connects (name, email, occupation, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [name.trim(), email.toLowerCase().trim(), occupation.trim()]
    )

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: "Thank you for connecting with RUSH Healthcare",
      html: `
        <h2>Thank you for your interest, ${name}!</h2>
        <p>We've received your request to connect with RUSH Healthcare.</p>
        <p>Our team will review your information and reach out to you shortly.</p>
        <p>Best regards,<br>The RUSH Healthcare Team</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email connect error:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    )
  }
}
