import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get("application_id")

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      )
    }

    const links = await query(
      `SELECT id, token, email, expires_at, used, created_at 
       FROM completion_links 
       WHERE application_id = ? 
       ORDER BY created_at DESC`,
      [applicationId]
    )

    return NextResponse.json({
      success: true,
      links,
    })
  } catch (error) {
    console.error("Get completion links error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch completion links" },
      { status: 500 }
    )
  }
}
