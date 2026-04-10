import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      // Get single application
      const result = await query(
        "SELECT * FROM provider_applications WHERE id = ?",
        [id]
      )
      const application = (result as any[])[0]
      
      if (!application) {
        return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, application })
    }

    // Get all applications
    const applications = await query(
      `SELECT * FROM provider_applications ORDER BY created_at DESC`
    )

    return NextResponse.json({ success: true, applications })
  } catch (error) {
    console.error("Error fetching provider applications:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch provider applications" },
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
    const { id, status, notes, ...otherFields } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID required" }, { status: 400 })
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

    // Handle other updatable fields
    const allowedFields = ["first_name", "last_name", "email", "phone", "npi_number", "license_number", "specialty"]
    for (const field of allowedFields) {
      if (otherFields[field] !== undefined) {
        updateFields.push(`${field} = ?`)
        updateParams.push(otherFields[field])
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    updateFields.push("updated_at = NOW()")
    updateParams.push(id)

    await query(
      `UPDATE provider_applications SET ${updateFields.join(", ")} WHERE id = ?`,
      updateParams
    )

    // If status changed, send notification email
    if (status) {
      const appResult = await query("SELECT * FROM provider_applications WHERE id = ?", [id])
      const application = (appResult as any[])[0]

      if (application) {
        let emailSubject = ""
        let emailBody = ""

        if (status === "approved") {
          emailSubject = "Your RUSH Healthcare Application Has Been Approved!"
          emailBody = `
            <h2>Congratulations, ${application.first_name}!</h2>
            <p>Your provider application has been approved.</p>
            <p>You will receive your login credentials shortly.</p>
          `
        } else if (status === "rejected") {
          emailSubject = "Update on Your RUSH Healthcare Application"
          emailBody = `
            <h2>Dear ${application.first_name},</h2>
            <p>Thank you for your interest in joining RUSH Healthcare.</p>
            <p>After careful review, we are unable to proceed with your application at this time.</p>
            <p>If you have any questions, please contact our support team.</p>
          `
        }

        if (emailSubject) {
          await sendEmail({
            to: application.email,
            subject: emailSubject,
            html: emailBody + "<p>Best regards,<br>The RUSH Healthcare Team</p>",
          })
        }
      }
    }

    // Log activity
    await query(
      `INSERT INTO activity_log (user_id, action, description, entity_type, entity_id, created_at)
       VALUES (?, 'update_application', ?, 'application', ?, NOW())`,
      [auth.user?.id, `Updated application #${id}${status ? ` - Status: ${status}` : ""}`, id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating provider application:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update provider application" },
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
      return NextResponse.json({ success: false, error: "Application ID required" }, { status: 400 })
    }

    await query("DELETE FROM provider_applications WHERE id = ?", [id])

    // Log activity
    await query(
      `INSERT INTO activity_log (user_id, action, description, entity_type, entity_id, created_at)
       VALUES (?, 'delete_application', ?, 'application', ?, NOW())`,
      [auth.user?.id, `Deleted application #${id}`, id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting provider application:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete provider application" },
      { status: 500 }
    )
  }
}
