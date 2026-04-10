import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query, queryOne, execute } from "@/lib/db"
import { sendEmail } from "@/lib/email"

interface CountResult {
  total: number
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const intake = await queryOne("SELECT * FROM np_intakes WHERE id = ?", [id])

      if (!intake) {
        return NextResponse.json(
          { success: false, message: "Intake not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, intake })
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const offset = (page - 1) * limit

    const countResult = await queryOne<CountResult>("SELECT COUNT(*) as total FROM np_intakes")
    const total = countResult?.total || 0

    const intakes = await query(
      "SELECT * FROM np_intakes ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    )

    return NextResponse.json({
      success: true,
      intakes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("NP intake fetch error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch intakes" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const {
      patient_name,
      date_of_birth,
      email,
      phone,
      chief_complaint,
      ...additionalData
    } = data

    if (!patient_name || !email) {
      return NextResponse.json(
        { success: false, message: "Patient name and email are required" },
        { status: 400 }
      )
    }

    const result = await execute(
      `INSERT INTO np_intakes (
        patient_name, date_of_birth, email, phone, chief_complaint, 
        additional_data, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        patient_name,
        date_of_birth || null,
        email,
        phone || null,
        chief_complaint || null,
        JSON.stringify(additionalData),
      ]
    )

    // Send notification email
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "info@rushhealthc.com",
      subject: "New NP Intake Submission",
      html: `
        <h2>New NP Intake Form Submitted</h2>
        <p><strong>Patient Name:</strong> ${patient_name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Chief Complaint:</strong> ${chief_complaint || "N/A"}</p>
        <p>Please log in to the admin dashboard to view the full details.</p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Intake form submitted successfully",
      intakeId: result.insertId,
    })
  } catch (error) {
    console.error("NP intake submit error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to submit intake form" },
      { status: 500 }
    )
  }
}
