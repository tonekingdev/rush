import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query, execute, transaction } from "@/lib/db"
import mysql from "mysql2/promise"

interface SettingRow {
  setting_key: string
  setting_value: string
  description: string
}

const defaultSettings: Record<string, { value: string; description: string }> = {
  site_name: { value: "RUSH Healthcare", description: "Site name displayed in the application" },
  admin_email: { value: "admin@rushhealthc.com", description: "Primary admin email address" },
  support_email: { value: "support@rushhealthc.com", description: "Support email address" },
  application_auto_approve: { value: "false", description: "Automatically approve applications" },
  email_notifications: { value: "true", description: "Send email notifications" },
  max_file_size: { value: "5242880", description: "Maximum file upload size in bytes (5MB)" },
  allowed_file_types: { value: "pdf,doc,docx,jpg,jpeg,png", description: "Allowed file types for uploads" },
  session_timeout: { value: "3600", description: "Session timeout in seconds (1 hour)" },
  password_min_length: { value: "8", description: "Minimum password length" },
  maintenance_mode: { value: "false", description: "Enable maintenance mode" },
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Try to get settings from database
    try {
      const rows = await query<SettingRow>(
        "SELECT setting_key, setting_value, description FROM system_settings ORDER BY setting_key"
      )

      if (rows.length === 0) {
        return NextResponse.json({ success: true, settings: defaultSettings })
      }

      const settings: Record<string, { value: string; description: string }> = {}
      for (const row of rows) {
        settings[row.setting_key] = {
          value: row.setting_value,
          description: row.description,
        }
      }

      return NextResponse.json({ success: true, settings })
    } catch {
      // If table doesn't exist, return default settings
      return NextResponse.json({ success: true, settings: defaultSettings })
    }
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "No settings data provided" },
        { status: 400 }
      )
    }

    await transaction(async (conn: mysql.Connection) => {
      // Ensure table exists
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          setting_key VARCHAR(255) UNIQUE NOT NULL,
          setting_value TEXT,
          description TEXT,
          updated_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `)

      for (const [key, value] of Object.entries(data)) {
        await conn.execute(
          `INSERT INTO system_settings (setting_key, setting_value, updated_by) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by), updated_at = NOW()`,
          [key, value, session.email]
        )
      }
    })

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "initialize") {
      await transaction(async (conn: mysql.Connection) => {
        // Create table if not exists
        await conn.execute(`
          CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(255) UNIQUE NOT NULL,
            setting_value TEXT,
            description TEXT,
            updated_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `)

        for (const [key, setting] of Object.entries(defaultSettings)) {
          await conn.execute(
            `INSERT IGNORE INTO system_settings (setting_key, setting_value, description, updated_by) 
             VALUES (?, ?, ?, ?)`,
            [key, setting.value, setting.description, session.email]
          )
        }
      })

      return NextResponse.json({
        success: true,
        message: "Default settings initialized successfully",
      })
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Settings init error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to initialize settings" },
      { status: 500 }
    )
  }
}
