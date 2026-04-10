import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const plans = await query(
      `SELECT * FROM pricing_plans ORDER BY sort_order ASC, created_at DESC`
    )

    return NextResponse.json({ success: true, plans })
  } catch (error) {
    console.error("Error fetching pricing plans:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch pricing plans" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { name, description, price, interval, features, stripe_price_id, is_active, sort_order } = data

    const result = await query(
      `INSERT INTO pricing_plans 
       (name, description, price, interval_type, features, stripe_price_id, is_active, sort_order, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, description, price, interval, JSON.stringify(features), stripe_price_id, is_active ? 1 : 0, sort_order || 0]
    )

    return NextResponse.json({ success: true, id: (result as any).insertId })
  } catch (error) {
    console.error("Error creating pricing plan:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create pricing plan" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || auth.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { id, name, description, price, interval, features, stripe_price_id, is_active, sort_order } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "Plan ID required" }, { status: 400 })
    }

    await query(
      `UPDATE pricing_plans 
       SET name = ?, description = ?, price = ?, interval_type = ?, features = ?, 
           stripe_price_id = ?, is_active = ?, sort_order = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description, price, interval, JSON.stringify(features), stripe_price_id, is_active ? 1 : 0, sort_order || 0, id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating pricing plan:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update pricing plan" },
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
      return NextResponse.json({ success: false, error: "Plan ID required" }, { status: 400 })
    }

    await query("DELETE FROM pricing_plans WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting pricing plan:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete pricing plan" },
      { status: 500 }
    )
  }
}
