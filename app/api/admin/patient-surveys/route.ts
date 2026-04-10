import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (search) {
      whereClause += " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status) {
      whereClause += " AND status = ?"
      params.push(status)
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM patient_surveys ${whereClause}`,
      params
    )
    const total = (countResult as any[])[0]?.total || 0

    // Get surveys with pagination
    const surveys = await query(
      `SELECT * FROM patient_surveys ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      success: true,
      surveys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching patient surveys:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch patient surveys" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { id, status, notes } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "Survey ID required" }, { status: 400 })
    }

    const updateFields: string[] = []
    const updateParams: any[] = []

    if (status !== undefined) {
      updateFields.push("status = ?")
      updateParams.push(status)
    }

    if (notes !== undefined) {
      updateFields.push("admin_notes = ?")
      updateParams.push(notes)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    updateFields.push("updated_at = NOW()")
    updateParams.push(id)

    await query(
      `UPDATE patient_surveys SET ${updateFields.join(", ")} WHERE id = ?`,
      updateParams
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating patient survey:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update patient survey" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Survey ID required" }, { status: 400 })
    }

    await query("DELETE FROM patient_surveys WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting patient survey:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete patient survey" },
      { status: 500 }
    )
  }
}
