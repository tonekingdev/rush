import { NextRequest, NextResponse } from "next/server"
import { query, queryOne, execute } from "@/lib/db"
import { hashPassword, generateResetToken } from "@/lib/auth"
import { sendEmail, getPasswordResetTemplate } from "@/lib/email"

interface User {
  id: number
  email: string
  name: string
}

interface ResetToken {
  user_id: number
  token: string
  expires_at: string
}

// Request password reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    const user = await queryOne<User>(
      "SELECT id, email, name FROM users WHERE email = ?",
      [email]
    )

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing reset tokens for this user
    await execute("DELETE FROM password_resets WHERE user_id = ?", [user.id])

    // Insert new reset token
    await execute(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, resetToken, expiresAt.toISOString().slice(0, 19).replace("T", " ")]
    )

    // Send reset email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - RUSH Healthcare",
      html: getPasswordResetTemplate(user.name, resetLink),
    })

    return NextResponse.json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    })
  } catch (error) {
    console.error("Reset password request error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}

// Complete password reset
export async function PUT(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Find valid reset token
    const resetRecord = await queryOne<ResetToken>(
      "SELECT user_id, token, expires_at FROM password_resets WHERE token = ? AND expires_at > NOW()",
      [token]
    )

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      resetRecord.user_id,
    ])

    // Delete used reset token
    await execute("DELETE FROM password_resets WHERE token = ?", [token])

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    )
  }
}
