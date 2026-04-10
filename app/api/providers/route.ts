import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query, queryOne, execute } from "@/lib/db"

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
    const specialty = searchParams.get("specialty") || ""
    const search = searchParams.get("search") || ""

    // Build WHERE clause
    const conditions: string[] = []
    const params: unknown[] = []

    if (status && ["active", "inactive", "pending", "suspended"].includes(status)) {
      conditions.push("status = ?")
      params.push(status)
    }

    if (specialty) {
      conditions.push("specialty = ?")
      params.push(specialty)
    }

    if (search) {
      conditions.push("(full_name LIKE ? OR email LIKE ? OR npi_number LIKE ?)")
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Get total count
    const countResult = await queryOne<CountResult>(
      `SELECT COUNT(*) as total FROM providers ${whereClause}`,
      params
    )
    const total = countResult?.total || 0

    // Get providers
    const providers = await query(
      `SELECT * FROM providers ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      success: true,
      providers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Providers fetch error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch providers" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const data = await request.json()

    const {
      full_name,
      email,
      phone,
      npi_number,
      specialty,
      license_number,
      license_state,
      ...additionalData
    } = data

    if (!full_name || !email || !npi_number) {
      return NextResponse.json(
        { success: false, message: "Required fields missing" },
        { status: 400 }
      )
    }

    // Check for existing provider
    const existing = await queryOne(
      "SELECT id FROM providers WHERE email = ? OR npi_number = ?",
      [email, npi_number]
    )

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A provider with this email or NPI already exists" },
        { status: 400 }
      )
    }

    // Insert provider
    const result = await execute(
      `INSERT INTO providers (full_name, email, phone, npi_number, specialty, license_number, license_state, additional_data, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        full_name,
        email,
        phone || null,
        npi_number,
        specialty || null,
        license_number || null,
        license_state || null,
        JSON.stringify(additionalData),
      ]
    )

    return NextResponse.json({
      success: true,
      message: "Provider created successfully",
      providerId: result.insertId,
    })
  } catch (error) {
    console.error("Provider create error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to create provider" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const { id, status, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Provider ID is required" },
        { status: 400 }
      )
    }

    // Build update query
    const updates: string[] = []
    const params: unknown[] = []

    if (status && ["active", "inactive", "pending", "suspended"].includes(status)) {
      updates.push("status = ?")
      params.push(status)
    }

    if (updateData.full_name) {
      updates.push("full_name = ?")
      params.push(updateData.full_name)
    }

    if (updateData.email) {
      updates.push("email = ?")
      params.push(updateData.email)
    }

    if (updateData.phone !== undefined) {
      updates.push("phone = ?")
      params.push(updateData.phone || null)
    }

    if (updateData.specialty !== undefined) {
      updates.push("specialty = ?")
      params.push(updateData.specialty || null)
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
      `UPDATE providers SET ${updates.join(", ")} WHERE id = ?`,
      params
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Provider updated successfully",
    })
  } catch (error) {
    console.error("Provider update error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to update provider" },
      { status: 500 }
    )
  }
}
