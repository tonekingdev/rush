import { NextRequest, NextResponse } from "next/server"
import { queryOne, execute, transaction } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import mysql from "mysql2/promise"

interface CompletionLink {
  id: number
  application_id: number
  token: string
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const { token, ...applicationData } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      )
    }

    // Validate token
    const link = await queryOne<CompletionLink>(
      "SELECT * FROM completion_links WHERE token = ? AND expires_at > NOW() AND used = 0",
      [token]
    )

    if (!link) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 }
      )
    }

    // Update application with new data
    await transaction(async (conn: mysql.Connection) => {
      // Update the application
      const updateFields: string[] = []
      const updateValues: unknown[] = []

      for (const [key, value] of Object.entries(applicationData)) {
        if (value !== undefined && value !== null && key !== "token") {
          updateFields.push(`${key} = ?`)
          updateValues.push(value)
        }
      }

      if (updateFields.length > 0) {
        updateFields.push("status = 'pending'")
        updateFields.push("updated_at = NOW()")
        updateValues.push(link.application_id)

        await conn.execute(
          `UPDATE provider_applications SET ${updateFields.join(", ")} WHERE id = ?`,
          updateValues
        )
      }

      // Mark completion link as used
      await conn.execute(
        "UPDATE completion_links SET used = 1 WHERE id = ?",
        [link.id]
      )
    })

    // Send notification email
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "info@rushhealthc.com",
      subject: "Application Completed - RUSH Healthcare",
      html: `
        <h2>Provider Application Completed</h2>
        <p>A provider has completed their application.</p>
        <p><strong>Email:</strong> ${link.email}</p>
        <p>Please log in to the admin dashboard to review the application.</p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Application completed successfully",
    })
  } catch (error) {
    console.error("Complete application error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to complete application" },
      { status: 500 }
    )
  }
}
