import { NextRequest, NextResponse } from "next/server"
import { queryOne, execute } from "@/lib/db"
import { generateResetToken } from "@/lib/auth"
import { sendEmail, getPasswordResetTemplate } from "@/lib/email"

interface User {
  id: number
  email: string
  name: string
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    // Find user
    const user = await queryOne<User>(
      "SELECT id, email, name FROM users WHERE email = ?",
      [email]
    )

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete existing tokens and create new one
    await execute("DELETE FROM password_resets WHERE user_id = ?", [user.id])
    await execute(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, resetToken, expiresAt.toISOString().slice(0, 19).replace("T", " ")]
    )

    // Send reset email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`
    
    await sendEmail({
      to: user.email,
      subject: "Password Reset - RUSH Healthcare",
      html: getPasswordResetTemplate(user.name, resetLink),
    })

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}
