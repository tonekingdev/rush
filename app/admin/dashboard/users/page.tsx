"use client"

import { UserManagement } from "@/app/components/admin/user-management"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">User Management</h1>
        <p className="text-gray-600">Manage admin users and permissions</p>
      </div>

      <UserManagement />
    </div>
  )
}