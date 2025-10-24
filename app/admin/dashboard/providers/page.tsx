"use client"

import { ProviderManagement } from "@/app/components/admin/provider-management"

export default function ProvidersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Provider Management</h1>
        <p className="text-gray-600">Manage healthcare provider applications and accounts</p>
      </div>

      <ProviderManagement />
    </div>
  )
}
