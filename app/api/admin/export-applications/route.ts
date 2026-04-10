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
    const format = searchParams.get("format") || "csv"
    const status = searchParams.get("status")

    let whereClause = ""
    const params: any[] = []

    if (status) {
      whereClause = "WHERE status = ?"
      params.push(status)
    }

    const applications = await query(
      `SELECT id, first_name, last_name, email, phone, npi_number, 
              license_number, specialty, status, created_at, updated_at
       FROM provider_applications ${whereClause}
       ORDER BY created_at DESC`,
      params
    )

    if (format === "csv") {
      const headers = [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "NPI Number",
        "License Number",
        "Specialty",
        "Status",
        "Created At",
        "Updated At",
      ]

      const rows = (applications as any[]).map((app) => [
        app.id,
        app.first_name,
        app.last_name,
        app.email,
        app.phone,
        app.npi_number,
        app.license_number,
        app.specialty,
        app.status,
        app.created_at,
        app.updated_at,
      ])

      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell: any) => `"${cell || ""}"`).join(","))].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="applications-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // JSON format
    return NextResponse.json({ success: true, applications })
  } catch (error) {
    console.error("Error exporting applications:", error)
    return NextResponse.json(
      { success: false, error: "Failed to export applications" },
      { status: 500 }
    )
  }
}
