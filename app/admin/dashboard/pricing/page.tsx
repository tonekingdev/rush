"use client"

import { PricingManagement } from "@/app/components/admin/pricing-management"
import { FadeInView } from "@/app/components/FadeInView"
import { useAuth } from "@/app/context/auth-context"

export default function PricingPage() {
  const { hasPricingAccess } = useAuth()

  return (
    <div className="space-y-6">
      <FadeInView>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 font-poppins">Pricing Management</h1>
            <p className="text-gray-600">Manage subscription plans and pricing for RUSH Healthcare services.</p>
          </div>
        </div>
      </FadeInView>

      <FadeInView>
        <PricingManagement hasAccess={hasPricingAccess} />
      </FadeInView>
    </div>
  )
}