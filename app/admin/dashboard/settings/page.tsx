"use client"

import { SettingsPanel } from "@/app/components/admin/settings-panel"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">System Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>

      <SettingsPanel />
    </div>
  )
}