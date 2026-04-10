import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db"

interface StatusCount {
  status: string
  count: number
}

export async function GET() {
  try {
    await requireAdmin()

    const statusCounts = await query<StatusCount>(
      `SELECT status, COUNT(*) as count 
       FROM provider_applications 
       GROUP BY status`
    )

    // Format for chart
    const chartData = statusCounts.map((item) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace("_", " "),
      value: item.count,
    }))

    return NextResponse.json({
      success: true,
      data: chartData,
    })
  } catch (error) {
    console.error("Application status chart error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch chart data" },
      { status: 500 }
    )
  }
}
