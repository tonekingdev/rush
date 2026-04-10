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

    const countResult = await queryOne<CountResult>(
      "SELECT COUNT(*) as total FROM rush_subscriptions"
    )
    const total = countResult?.total || 0

    const subscriptions = await query(
      `SELECT rs.*, u.name as user_name, u.email as user_email 
       FROM rush_subscriptions rs 
       LEFT JOIN users u ON rs.user_id = u.id 
       ORDER BY rs.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    )

    return NextResponse.json({
      success: true,
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Subscriptions fetch error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscriptions" },
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
        { success: false, message: "Subscription ID and status are required" },
        { status: 400 }
      )
    }

    if (!["active", "cancelled", "paused", "expired"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      )
    }

    const result = await execute(
      "UPDATE rush_subscriptions SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Subscription not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
    })
  } catch (error) {
    console.error("Subscription update error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to update subscription" },
      { status: 500 }
    )
  }
}
