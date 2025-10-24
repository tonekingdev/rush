"use client"

import { PatientSurveyManagement } from "@/app/components/admin/patient-survey-management"

export default function PatientSurveysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Patient Surveys</h1>
        <p className="text-gray-600">Review and approve patient interest surveys</p>
      </div>

      <PatientSurveyManagement />
    </div>
  )
}