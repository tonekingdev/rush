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
    const search = searchParams.get("search") || ""

    // Build WHERE clause
    const conditions: string[] = []
    const params: unknown[] = []

    if (status && ["active", "inactive", "suspended"].includes(status)) {
      conditions.push("u.status = ?")
      params.push(status)
    }

    if (search) {
      conditions.push("(u.full_name LIKE ? OR u.email LIKE ? OR u.user_id LIKE ?)")
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Get total count
    const countResult = await queryOne<CountResult>(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params
    )
    const total = countResult?.total || 0

    // Get users
    const users = await query(
      `SELECT u.*, au.username as approved_by_name 
       FROM users u 
       LEFT JOIN admin_users au ON u.approved_by = au.id 
       ${whereClause} 
       ORDER BY u.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Users fetch error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "User ID and status are required" },
        { status: 400 }
      )
    }

    if (!["active", "inactive", "suspended"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      )
    }

    const result = await execute(
      "UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User status updated successfully",
    })
  } catch (error) {
    console.error("User update error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    )
  }
}
