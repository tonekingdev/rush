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
    const providerId = searchParams.get("provider_id")
    const applicationId = searchParams.get("application_id")
    const type = searchParams.get("type")

    let whereClause = "WHERE 1=1"
    const params: any[] = []

    if (providerId) {
      whereClause += " AND provider_id = ?"
      params.push(providerId)
    }

    if (applicationId) {
      whereClause += " AND application_id = ?"
      params.push(applicationId)
    }

    if (type) {
      whereClause += " AND document_type = ?"
      params.push(type)
    }

    const documents = await query(
      `SELECT d.*, p.first_name, p.last_name
       FROM documents d
       LEFT JOIN providers p ON d.provider_id = p.id
       ${whereClause}
       ORDER BY d.created_at DESC`,
      params
    )

    return NextResponse.json({ success: true, documents })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}
