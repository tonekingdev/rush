"use client"

import { RushSubscriptionManagement } from "@/app/components/admin/rush-subscription-management"
import { FadeInView } from "@/app/components/FadeInView"

export default function RushSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <FadeInView>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 font-poppins">RUSH Subscriptions</h1>
          <p className="text-gray-600">
            Manage monthly subscription plans for patients. Each subscription includes 1 nurse visit and 1 CNA visit per
            month.
          </p>
        </div>
      </FadeInView>

      <FadeInView>
        <RushSubscriptionManagement />
      </FadeInView>
    </div>
  )
}