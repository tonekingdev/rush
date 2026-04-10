import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, getSession } from "@/lib/auth"
import { query, queryOne, execute } from "@/lib/db"

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

    const notes = await query(
      `SELECT an.*, u.name as author_name 
       FROM application_notes an 
       LEFT JOIN users u ON an.created_by = u.id 
       WHERE an.application_id = ? 
       ORDER BY an.created_at DESC`,
      [applicationId]
    )

    return NextResponse.json({
      success: true,
      notes,
    })
  } catch (error) {
    console.error("Application notes fetch error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const { application_id, content } = await request.json()

    if (!application_id || !content) {
      return NextResponse.json(
        { success: false, message: "Application ID and content are required" },
        { status: 400 }
      )
    }

    const result = await execute(
      `INSERT INTO application_notes (application_id, content, created_by, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [application_id, content, session.userId]
    )

    return NextResponse.json({
      success: true,
      message: "Note added successfully",
      noteId: result.insertId,
    })
  } catch (error) {
    console.error("Application note create error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to create note" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const { id, content } = await request.json()

    if (!id || !content) {
      return NextResponse.json(
        { success: false, message: "Note ID and content are required" },
        { status: 400 }
      )
    }

    const result = await execute(
      "UPDATE application_notes SET content = ?, updated_at = NOW() WHERE id = ?",
      [content, id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
    })
  } catch (error) {
    console.error("Application note update error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to update note" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      const body = await request.json()
      if (!body.id) {
        return NextResponse.json(
          { success: false, message: "Note ID is required" },
          { status: 400 }
        )
      }
      
      const result = await execute("DELETE FROM application_notes WHERE id = ?", [body.id])

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { success: false, message: "Note not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Note deleted successfully",
      })
    }

    const result = await execute("DELETE FROM application_notes WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    })
  } catch (error) {
    console.error("Application note delete error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to delete note" },
      { status: 500 }
    )
  }
}
