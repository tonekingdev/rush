import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { documentId, verified, notes } = data

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "Document ID required" },
        { status: 400 }
      )
    }

    await query(
      `UPDATE documents 
       SET verified = ?, verified_by = ?, verified_at = NOW(), verification_notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [verified ? 1 : 0, auth.user?.id, notes || null, documentId]
    )

    // Log activity
    await query(
      `INSERT INTO activity_log (user_id, action, description, entity_type, entity_id, created_at)
       VALUES (?, 'verify_document', ?, 'document', ?, NOW())`,
      [auth.user?.id, `${verified ? "Verified" : "Unverified"} document #${documentId}`, documentId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying document:", error)
    return NextResponse.json(
      { success: false, error: "Failed to verify document" },
      { status: 500 }
    )
  }
}
