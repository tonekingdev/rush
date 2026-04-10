import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query, queryOne } from "@/lib/db"

interface CountResult {
  count: number
}

export async function GET() {
  try {
    await requireAdmin()

    // Get various statistics
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      totalProviders,
      activeProviders,
      totalPatients,
      totalUsers,
      recentApplications,
    ] = await Promise.all([
      queryOne<CountResult>("SELECT COUNT(*) as count FROM applications"),
      queryOne<CountResult>("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'"),
      queryOne<CountResult>("SELECT COUNT(*) as count FROM applications WHERE status = 'approved'"),
      queryOne<CountResult>("SELECT COUNT(*) as count FROM providers"),
      queryOne<CountResult>("SELECT COUNT(*) as count FROM providers WHERE status = 'active'"),
      queryOne<CountResult>("SELECT COUNT(*) as count FROM patients"),
      queryOne<CountResult>("SELECT COUNT(*) as count FROM users"),
      query(
        `SELECT id, full_name, email, application_type, status, created_at 
         FROM applications 
         ORDER BY created_at DESC 
         LIMIT 5`
      ),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        applications: {
          total: totalApplications?.count || 0,
          pending: pendingApplications?.count || 0,
          approved: approvedApplications?.count || 0,
        },
        providers: {
          total: totalProviders?.count || 0,
          active: activeProviders?.count || 0,
        },
        patients: {
          total: totalPatients?.count || 0,
        },
        users: {
          total: totalUsers?.count || 0,
        },
      },
      recentApplications,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    if ((error as Error).message === "Forbidden") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
