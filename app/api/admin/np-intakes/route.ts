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
    const id = searchParams.get("id")

    if (id) {
      // Get single intake
      const result = await query(
        "SELECT * FROM np_intakes WHERE id = ?",
        [id]
      )
      const intake = (result as any[])[0]
      
      if (!intake) {
        return NextResponse.json({ success: false, error: "Intake not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, intake })
    }

    // Get all intakes
    const intakes = await query(
      `SELECT * FROM np_intakes ORDER BY created_at DESC`
    )

    return NextResponse.json({ success: true, intakes })
  } catch (error) {
    console.error("Error fetching NP intakes:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch NP intakes" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { id, status, notes } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "Intake ID required" }, { status: 400 })
    }

    const updateFields: string[] = []
    const updateParams: any[] = []

    if (status !== undefined) {
      updateFields.push("status = ?")
      updateParams.push(status)
    }

    if (notes !== undefined) {
      updateFields.push("admin_notes = ?")
      updateParams.push(notes)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    updateFields.push("updated_at = NOW()")
    updateParams.push(id)

    await query(
      `UPDATE np_intakes SET ${updateFields.join(", ")} WHERE id = ?`,
      updateParams
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating NP intake:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update NP intake" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Intake ID required" }, { status: 400 })
    }

    await query("DELETE FROM np_intakes WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting NP intake:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete NP intake" },
      { status: 500 }
    )
  }
}
