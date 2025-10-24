"use client"

import { PatientManagement } from "@/app/components/admin/patient-management"

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Patient Management</h1>
        <p className="text-gray-600">Manage approved patients and their information</p>
      </div>

      <PatientManagement />
    </div>
  )
}