import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { queryOne } from "@/lib/db"

interface User {
  id: number
  email: string
  name: string
  role: string
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Get fresh user data from database
    const user = await queryOne<User>(
      "SELECT id, email, name, role FROM users WHERE id = ?",
      [session.userId]
    )

    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Check auth error:", error)
    return NextResponse.json(
      { authenticated: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}
