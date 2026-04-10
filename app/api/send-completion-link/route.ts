import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { execute, queryOne } from "@/lib/db"
import { sendEmail, getCompletionLinkTemplate } from "@/lib/email"
import { generateResetToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const { application_id, email, name, application_type } = await request.json()

    if (!application_id || !email || !name) {
      return NextResponse.json(
        { success: false, message: "Application ID, email, and name are required" },
        { status: 400 }
      )
    }

    // Generate completion token
    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store completion link
    await execute(
      `INSERT INTO completion_links (application_id, token, email, expires_at, created_at) 
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
      [application_id, token, email, expiresAt.toISOString().slice(0, 19).replace("T", " ")]
    )

    // Send email
    const completionLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/complete-application?token=${token}`
    
    await sendEmail({
      to: email,
      subject: `Complete Your ${application_type || "Provider"} Application - RUSH Healthcare`,
      html: getCompletionLinkTemplate(name, completionLink, application_type || "Provider"),
    })

    return NextResponse.json({
      success: true,
      message: "Completion link sent successfully",
    })
  } catch (error) {
    console.error("Send completion link error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to send completion link" },
      { status: 500 }
    )
  }
}
