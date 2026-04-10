import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { queryOne, execute, transaction } from "@/lib/db"
import { sendEmail, getWelcomeEmailTemplate } from "@/lib/email"
import mysql from "mysql2/promise"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const { application_id } = await request.json()

    if (!application_id) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      )
    }

    // Get application data
    const application = await queryOne<Record<string, unknown>>(
      "SELECT * FROM provider_applications WHERE id = ?",
      [application_id]
    )

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    // Create provider from application
    const providerId = await transaction(async (conn: mysql.Connection) => {
      const [result] = await conn.execute(
        `INSERT INTO providers (
          full_name, email, phone, npi_number, license_number, license_state,
          specialty, years_experience, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
        [
          application.full_name,
          application.email,
          application.phone,
          application.npi_number,
          application.license_number,
          application.license_state,
          application.specialty,
          application.years_experience,
        ]
      )

      const insertResult = result as { insertId: number }

      // Update application status
      await conn.execute(
        "UPDATE provider_applications SET status = 'approved', updated_at = NOW() WHERE id = ?",
        [application_id]
      )

      return insertResult.insertId
    })

    // Send welcome email
    await sendEmail({
      to: application.email as string,
      subject: "Welcome to RUSH Healthcare - Provider Approved",
      html: getWelcomeEmailTemplate(application.full_name as string),
    })

    return NextResponse.json({
      success: true,
      message: "Provider created successfully",
      providerId,
    })
  } catch (error) {
    console.error("Create provider error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to create provider" },
      { status: 500 }
    )
  }
}
