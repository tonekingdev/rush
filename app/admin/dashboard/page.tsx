"use client"

import { DashboardStats } from "@/app/components/admin/dashboard-stats"
import { RecentApplications } from "@/app/components/admin/recent-applications"
import { ApplicationStatusChart } from "@/app/components/admin/application-status-chart"
import { FadeInView } from "@/app/components/FadeInView"

export default function DashboardPage() {

  return (
    <div className="space-y-6">
      <FadeInView>
        <h1 className="text-2xl font-bold text-gray-800 font-poppins">Dashboard</h1>
        <p className="text-gray-600">Welcome to the RUSH Healthcare admin dashboard.</p>
      </FadeInView>

      <FadeInView>
        <DashboardStats />
      </FadeInView>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeInView>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 font-poppins">Application Status</h2>
            <ApplicationStatusChart />
          </div>
        </FadeInView>

        <FadeInView>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 font-poppins">Recent Applications</h2>
            <RecentApplications />
          </div>
        </FadeInView>
      </div>

      {/* Pricing Management Section - Only show if user has access */}
      {/* {!checkingAccess && (
        <FadeInView>
          <PricingManagement hasAccess={hasPricingAccess} />
        </FadeInView>
      )} */}
    </div>
  )
}