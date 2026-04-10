import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query, queryOne, execute } from "@/lib/db"
import { sendEmail, getApplicationSubmittedTemplate } from "@/lib/email"

interface CountResult {
  total: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    // If ID is provided, get single application
    if (id) {
      await requireAdmin()
      
      const application = await queryOne(
        "SELECT * FROM provider_applications WHERE id = ?",
        [id]
      )

      if (!application) {
        return NextResponse.json(
          { success: false, message: "Application not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, application })
    }

    // Otherwise, get paginated list
    await requireAdmin()

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const offset = (page - 1) * limit
    const status = searchParams.get("status") || ""
    const search = searchParams.get("search") || ""
    const sort = searchParams.get("sort") || "created_at"
    const direction = searchParams.get("direction") || "DESC"

    // Build WHERE clause
    const conditions: string[] = []
    const params: unknown[] = []

    if (status && ["pending", "approved", "rejected", "in_review"].includes(status)) {
      conditions.push("status = ?")
      params.push(status)
    }

    if (search) {
      conditions.push("(full_name LIKE ? OR email LIKE ?)")
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
    const orderBy = ["created_at", "full_name", "status"].includes(sort) ? sort : "created_at"
    const orderDir = direction.toUpperCase() === "ASC" ? "ASC" : "DESC"

    // Get total count
    const countResult = await queryOne<CountResult>(
      `SELECT COUNT(*) as total FROM provider_applications ${whereClause}`,
      params
    )
    const total = countResult?.total || 0

    // Get applications
    const applications = await query(
      `SELECT * FROM provider_applications ${whereClause} ORDER BY ${orderBy} ${orderDir} LIMIT ? OFFSET ?`,
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
    console.error("Provider applications fetch error:", error)
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
      npi_number,
      license_number,
      license_state,
      specialty,
      years_experience,
      ...additionalData
    } = data

    if (!full_name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      )
    }

    // Check for existing application
    const existing = await queryOne(
      "SELECT id FROM provider_applications WHERE email = ? AND status IN ('pending', 'in_review')",
      [email]
    )

    if (existing) {
      return NextResponse.json(
        { success: false, message: "An application with this email is already pending" },
        { status: 400 }
      )
    }

    // Insert application
    const result = await execute(
      `INSERT INTO provider_applications (
        full_name, email, phone, npi_number, license_number, license_state, 
        specialty, years_experience, additional_data, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        full_name,
        email,
        phone || null,
        npi_number || null,
        license_number || null,
        license_state || null,
        specialty || null,
        years_experience || null,
        JSON.stringify(additionalData),
      ]
    )

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: "Provider Application Received - RUSH Healthcare",
      html: getApplicationSubmittedTemplate(full_name, "provider"),
    })

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: result.insertId,
    })
  } catch (error) {
    console.error("Provider application submit error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to submit application" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const { id, status, notes } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      )
    }

    const updates: string[] = []
    const params: unknown[] = []

    if (status && ["pending", "approved", "rejected", "in_review"].includes(status)) {
      updates.push("status = ?")
      params.push(status)
    }

    if (notes !== undefined) {
      updates.push("admin_notes = ?")
      params.push(notes)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 }
      )
    }

    updates.push("updated_at = NOW()")
    params.push(id)

    const result = await execute(
      `UPDATE provider_applications SET ${updates.join(", ")} WHERE id = ?`,
      params
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
    console.error("Provider application update error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to update application" },
      { status: 500 }
    )
  }
}
