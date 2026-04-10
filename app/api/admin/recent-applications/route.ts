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
    const limit = parseInt(searchParams.get("limit") || "5")

    const applications = await query(
      `SELECT id, first_name, last_name, email, status, created_at
       FROM provider_applications
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    )

    return NextResponse.json({ success: true, applications })
  } catch (error) {
    console.error("Error fetching recent applications:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch recent applications" },
      { status: 500 }
    )
  }
}
