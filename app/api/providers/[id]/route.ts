import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { queryOne, execute } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params

    const provider = await queryOne(
      "SELECT * FROM providers WHERE id = ?",
      [id]
    )

    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      provider,
    })
  } catch (error) {
    console.error("Provider fetch error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to fetch provider" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params

    const result = await execute("DELETE FROM providers WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Provider deleted successfully",
    })
  } catch (error) {
    console.error("Provider delete error:", error)
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, message: "Failed to delete provider" },
      { status: 500 }
    )
  }
}
