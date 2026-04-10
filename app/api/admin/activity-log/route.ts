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
    const limit = parseInt(searchParams.get("limit") || "50")

    const activities = await query(
      `SELECT al.*, u.email as user_email, u.name as user_name
       FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [limit]
    )

    return NextResponse.json({ success: true, activities })
  } catch (error) {
    console.error("Error fetching activity log:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity log" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { action, description, entity_type, entity_id } = data

    await query(
      `INSERT INTO activity_log (user_id, action, description, entity_type, entity_id, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [auth.user?.id, action, description, entity_type || null, entity_id || null]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging activity:", error)
    return NextResponse.json(
      { success: false, error: "Failed to log activity" },
      { status: 500 }
    )
  }
}
