import { NextResponse } from "next/server"

export async function GET() {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY

  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe key not configured" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    STRIPE_PUBLISHABLE_KEY: stripeKey,
  })
}
