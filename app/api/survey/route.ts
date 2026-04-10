import { NextRequest, NextResponse } from "next/server"
import { execute } from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (data.type === "patient") {
      await execute(
        `INSERT INTO patient_surveys (
          full_name, date_of_birth, email, phone_number, zip_code, 
          interest_reasons, anticipated_services, medical_conditions, 
          has_pcp, taking_medications, has_insurance, insurance_provider, 
          interested_in_payment_plans, accessibility_needs, additional_info, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.fullName,
          data.dateOfBirth,
          data.email,
          data.phoneNumber,
          data.zipCode,
          Array.isArray(data.interestReasons) ? data.interestReasons.join(", ") : data.interestReasons,
          Array.isArray(data.anticipatedServices) ? data.anticipatedServices.join(", ") : data.anticipatedServices,
          data.medicalConditions || "",
          data.hasPCP || "",
          data.takingMedications || "",
          data.hasInsurance || "",
          data.insuranceProvider || "",
          data.interestedInPaymentPlans || "",
          data.accessibilityNeeds || "",
          data.additionalInfo || "",
        ]
      )
    } else if (data.type === "provider") {
      await execute(
        `INSERT INTO provider_surveys (
          name, email, phone, role, experience, specialization, 
          availability, preferred_areas, certifications, additional_comments, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.name,
          data.email,
          data.phone || "",
          data.role || "",
          data.experience || "",
          data.specialization || "",
          data.availability || "",
          data.preferredAreas || "",
          data.certifications || "",
          data.additionalComments || "",
        ]
      )
    } else {
      return NextResponse.json(
        { message: "Invalid survey type" },
        { status: 400 }
      )
    }

    // Send notification email
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "info@rushhealthc.com",
      subject: `New ${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Survey Submission`,
      html: `
        <h2>New ${data.type} survey submitted</h2>
        <p><strong>Name:</strong> ${data.fullName || data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phoneNumber || data.phone || "N/A"}</p>
        <p>Please log in to the admin dashboard to view the full details.</p>
      `,
    })

    return NextResponse.json({ message: "Survey submitted successfully" })
  } catch (error) {
    console.error("Survey submit error:", error)
    return NextResponse.json(
      { message: "Failed to submit survey" },
      { status: 500 }
    )
  }
}
