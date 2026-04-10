import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const result = await query(
      `SELECT status, COUNT(*) as count
       FROM provider_applications
       GROUP BY status
       ORDER BY count DESC`
    )

    const chartData = (result as any[]).map((row) => ({
      name: row.status.charAt(0).toUpperCase() + row.status.slice(1),
      value: row.count,
    }))

    return NextResponse.json({ success: true, data: chartData })
  } catch (error) {
    console.error("Error fetching application status chart data:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch chart data" },
      { status: 500 }
    )
  }
}
