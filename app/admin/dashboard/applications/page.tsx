"use client"

import { ApplicationManagement } from "@/app/components/admin/application-management"

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Provider Applications</h1>
        <p className="text-gray-600">Manage and review provider applications</p>
      </div>

      <ApplicationManagement />
    </div>
  )
}