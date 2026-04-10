import { NextRequest, NextResponse } from "next/server"
import { execute } from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    // Store in waitlist
    await execute(
      `INSERT INTO waitlist (email, name, created_at) VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [email, name || null]
    )

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: "You're on the RUSH Healthcare Waitlist!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1586D6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to the Waitlist!</h1>
            </div>
            <div class="content">
              <p>Hello${name ? ` ${name}` : ""},</p>
              <p>Thank you for joining the RUSH Healthcare waitlist! We're excited to have you.</p>
              <p>We'll notify you as soon as our platform is ready for you to access.</p>
              <p>In the meantime, if you have any questions, feel free to reply to this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} RUSH Healthcare. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Successfully added to waitlist",
    })
  } catch (error) {
    console.error("Waitlist signup error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to join waitlist" },
      { status: 500 }
    )
  }
}
