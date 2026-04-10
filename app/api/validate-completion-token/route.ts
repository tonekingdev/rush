import { NextRequest, NextResponse } from "next/server"
import { queryOne } from "@/lib/db"

interface CompletionLink {
  id: number
  application_id: number
  token: string
  email: string
  expires_at: string
  used: boolean
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { valid: false, message: "Token is required" },
        { status: 400 }
      )
    }

    const link = await queryOne<CompletionLink>(
      "SELECT * FROM completion_links WHERE token = ? AND expires_at > NOW() AND used = 0",
      [token]
    )

    if (!link) {
      return NextResponse.json({
        valid: false,
        message: "Invalid or expired token",
      })
    }

    // Get application data
    const application = await queryOne(
      "SELECT * FROM provider_applications WHERE id = ?",
      [link.application_id]
    )

    return NextResponse.json({
      valid: true,
      application,
    })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json(
      { valid: false, message: "Failed to validate token" },
      { status: 500 }
    )
  }
}
