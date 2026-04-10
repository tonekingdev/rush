import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query, execute } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")))

    const logs = await query(
      `SELECT al.*, u.name as user_name 
       FROM activity_logs al 
       LEFT JOIN users u ON al.user_id = u.id 
       ORDER BY al.created_at DESC 
       LIMIT ?`,
      [limit]
    )

    return NextResponse.json({
      success: true,
      logs,
    })
  } catch (error) {
    console.error("Activity log fetch error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch activity logs" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, action, details, ip_address } = await request.json()

    await execute(
      `INSERT INTO activity_logs (user_id, action, details, ip_address, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [user_id || null, action, JSON.stringify(details || {}), ip_address || null]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Activity log create error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create activity log" },
      { status: 500 }
    )
  }
}
