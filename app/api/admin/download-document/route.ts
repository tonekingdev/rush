import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Document ID required" },
        { status: 400 }
      )
    }

    const result = await query("SELECT * FROM documents WHERE id = ?", [id])
    const document = (result as any[])[0]

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      )
    }

    const filePath = path.join(process.cwd(), "uploads", document.file_path)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "File not found on server" },
        { status: 404 }
      )
    }

    const fileBuffer = fs.readFileSync(filePath)
    const fileName = document.original_name || document.file_name

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading document:", error)
    return NextResponse.json(
      { success: false, error: "Failed to download document" },
      { status: 500 }
    )
  }
}
