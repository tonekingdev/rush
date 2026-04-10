import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, getSession } from "@/lib/auth"
import { query, queryOne, execute } from "@/lib/db"
import { sendEmail, getApplicationSubmittedTemplate } from "@/lib/email"

interface CountResult {
  total: number
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const offset = (page - 1) * limit
    const status = searchParams.get("status") || ""
    const type = searchParams.get("type") || ""
    const search = searchParams.get("search") || ""

    // Build WHERE clause
    const conditions: string[] = []
    const params: unknown[] = []

    if (status && ["pending", "approved", "rejected", "in_review"].includes(status)) {
      conditions.push("status = ?")
      params.push(status)
    }

    if (type && ["patient", "provider"].includes(type)) {
      conditions.push("application_type = ?")
      params.push(type)
    }

    if (search) {
      conditions.push("(full_name LIKE ? OR email LIKE ?)")
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Get total count
    const countResult = await queryOne<CountResult>(
      `SELECT COUNT(*) as total FROM applications ${whereClause}`,
      params
    )
    const total = countResult?.total || 0

    // Get applications
    const applications = await query(
      `SELECT * FROM applications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Applications fetch error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const {
      full_name,
      email,
      phone,
      application_type,
      ...additionalData
    } = data

    if (!full_name || !email || !application_type) {
      return NextResponse.json(
        { success: false, message: "Required fields missing" },
        { status: 400 }
      )
    }

    // Check for existing application
    const existing = await queryOne(
      "SELECT id FROM applications WHERE email = ? AND application_type = ? AND status IN ('pending', 'in_review')",
      [email, application_type]
    )

    if (existing) {
      return NextResponse.json(
        { success: false, message: "An application with this email is already pending" },
        { status: 400 }
      )
    }

    // Insert application
    const result = await execute(
      `INSERT INTO applications (full_name, email, phone, application_type, additional_data, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [full_name, email, phone || null, application_type, JSON.stringify(additionalData)]
    )

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: "Application Received - RUSH Healthcare",
      html: getApplicationSubmittedTemplate(full_name, application_type),
    })

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: result.insertId,
    })
  } catch (error) {
    console.error("Application submit error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to submit application" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const { id, status, notes } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Application ID and status are required" },
        { status: 400 }
      )
    }

    if (!["pending", "approved", "rejected", "in_review"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      )
    }

    const result = await execute(
      `UPDATE applications 
       SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = NOW(), updated_at = NOW() 
       WHERE id = ?`,
      [status, notes || null, session.userId, id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
    })
  } catch (error) {
    console.error("Application update error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to update application" },
      { status: 500 }
    )
  }
}
