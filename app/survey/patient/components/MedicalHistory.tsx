"use client"

import type React from "react"

interface MedicalHistoryProps {
  formData: {
    medicalConditions: string
    hasPCP: string
    takingMedications: string
  }
  handleChange: (input: string, value: string) => void
  nextStep: () => void
  prevStep: () => void
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({ formData, handleChange, nextStep, prevStep }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Medical History</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="medicalConditions" className="block mb-2 text-base font-medium text-gray-900">
            Do you have any ongoing medical conditions or comorbidities?
          </label>
          <input
            type="text"
            id="medicalConditions"
            value={formData.medicalConditions}
            onChange={(e) => handleChange("medicalConditions", e.target.value)}
            placeholder="If yes, please specify"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <div className="mt-6">
          <p className="block mb-2 text-base font-medium text-gray-900">
            Do you currently have a primary care physician (PCP)?
          </p>
          <div className="flex flex-col space-y-3 mt-2 sm:flex-row sm:space-y-0 sm:space-x-6">
            <label className="flex items-center text-base text-gray-900">
              <input
                type="radio"
                value="Yes"
                checked={formData.hasPCP === "Yes"}
                onChange={(e) => handleChange("hasPCP", e.target.value)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3">Yes</span>
            </label>
            <label className="flex items-center text-base text-gray-900">
              <input
                type="radio"
                value="No"
                checked={formData.hasPCP === "No"}
                onChange={(e) => handleChange("hasPCP", e.target.value)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3">No</span>
            </label>
          </div>
        </div>
        <div className="mt-6">
          <p className="block mb-2 text-base font-medium text-gray-900">Are you currently taking any medications?</p>
          <div className="flex flex-col space-y-3 mt-2 sm:flex-row sm:space-y-0 sm:space-x-6">
            <label className="flex items-center text-base text-gray-900">
              <input
                type="radio"
                value="Yes"
                checked={formData.takingMedications === "Yes"}
                onChange={(e) => handleChange("takingMedications", e.target.value)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3">Yes</span>
            </label>
            <label className="flex items-center text-base text-gray-900">
              <input
                type="radio"
                value="No"
                checked={formData.takingMedications === "No"}
                onChange={(e) => handleChange("takingMedications", e.target.value)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3">No</span>
            </label>
          </div>
        </div>
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300 font-medium"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  )
}

export default MedicalHistory