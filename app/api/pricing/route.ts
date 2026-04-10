import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Try to get pricing from database
    const pricing = await query(
      "SELECT * FROM pricing_plans WHERE active = 1 ORDER BY sort_order ASC"
    )

    if (pricing.length > 0) {
      return NextResponse.json({
        success: true,
        pricing,
      })
    }

    // Return default pricing if no database records
    const defaultPricing = [
      {
        id: 1,
        name: "Basic",
        description: "Essential healthcare services for individuals",
        price: 99,
        billing_period: "month",
        features: [
          "24/7 Telehealth Access",
          "Primary Care Visits",
          "Basic Lab Work",
          "Prescription Management",
        ],
        popular: false,
      },
      {
        id: 2,
        name: "Premium",
        description: "Comprehensive care for you and your family",
        price: 199,
        billing_period: "month",
        features: [
          "Everything in Basic",
          "Specialist Consultations",
          "Extended Lab Work",
          "Mental Health Support",
          "Family Coverage (up to 4)",
        ],
        popular: true,
      },
      {
        id: 3,
        name: "Enterprise",
        description: "Custom solutions for businesses and organizations",
        price: null,
        billing_period: null,
        features: [
          "Everything in Premium",
          "Dedicated Account Manager",
          "Custom Integrations",
          "On-site Services",
          "Unlimited Team Members",
        ],
        popular: false,
      },
    ]

    return NextResponse.json({
      success: true,
      pricing: defaultPricing,
    })
  } catch (error) {
    console.error("Pricing fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch pricing" },
      { status: 500 }
    )
  }
}
