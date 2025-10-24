"use client"

import type React from "react"

interface InsurancePaymentProps {
  formData: {
    hasInsurance: string
    insuranceProvider: string
    policyNumber: string
    groupNumber: string
    primaryInsuredName: string
    relationshipToPrimaryInsured: string
    interestedInPaymentPlans: string
  }
  handleChange: (input: string, value: string) => void
  nextStep: () => void
  prevStep: () => void
}

const InsurancePayment: React.FC<InsurancePaymentProps> = ({ formData, handleChange, nextStep, prevStep }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Insurance and Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="block mb-2 text-base font-medium text-gray-900">Do you currently have health insurance?</p>
          <div className="flex flex-col space-y-3 mt-2 sm:flex-row sm:space-y-0 sm:space-x-6">
            <label className="flex items-center text-base text-gray-900">
              <input
                type="radio"
                value="Yes"
                checked={formData.hasInsurance === "Yes"}
                onChange={(e) => handleChange("hasInsurance", e.target.value)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3">Yes</span>
            </label>
            <label className="flex items-center text-base text-gray-900">
              <input
                type="radio"
                value="No"
                checked={formData.hasInsurance === "No"}
                onChange={(e) => handleChange("hasInsurance", e.target.value)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3">No</span>
            </label>
          </div>
        </div>
        {formData.hasInsurance === "Yes" && (
          <>
            <div>
              <label htmlFor="insuranceProvider" className="block mb-2 text-base font-medium text-gray-900">
                Insurance Provider Name
              </label>
              <input
                type="text"
                id="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={(e) => handleChange("insuranceProvider", e.target.value)}
                placeholder="Enter your insurance provider"
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="policyNumber" className="block mb-2 text-base font-medium text-gray-900">
                Policy Number
              </label>
              <input
                type="text"
                id="policyNumber"
                value={formData.policyNumber}
                onChange={(e) => handleChange("policyNumber", e.target.value)}
                placeholder="Enter your policy number"
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="groupNumber" className="block mb-2 text-base font-medium text-gray-900">
                Group Number (if applicable)
              </label>
              <input
                type="text"
                id="groupNumber"
                value={formData.groupNumber}
                onChange={(e) => handleChange("groupNumber", e.target.value)}
                placeholder="Enter your group number"
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="primaryInsuredName" className="block mb-2 text-base font-medium text-gray-900">
                Primary Insured Name (if different from patient)
              </label>
              <input
                type="text"
                id="primaryInsuredName"
                value={formData.primaryInsuredName}
                onChange={(e) => handleChange("primaryInsuredName", e.target.value)}
                placeholder="Name of primary insured"
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="relationshipToPrimaryInsured" className="block mb-2 text-base font-medium text-gray-900">
                Relationship to Primary Insured
              </label>
              <select
                id="relationshipToPrimaryInsured"
                value={formData.relationshipToPrimaryInsured}
                onChange={(e) => handleChange("relationshipToPrimaryInsured", e.target.value)}
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
              >
                <option value="">Select relationship</option>
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="other">Other</option>
              </select>
            </div>
          </>
        )}
        <div className="mt-6">
          <p className="block mb-2 text-base font-medium text-gray-900">
            Would you be interested in flexible payment plans or financial assistance for services?
          </p>
          <div className="flex flex-col space-y-3 mt-2 sm:flex-row sm:space-y-0 sm:space-x-6">
            <label className="flex items-center text-base text-gray-900">
              <input
                type="radio"
                value="Yes"
                checked={formData.interestedInPaymentPlans === "Yes"}
                onChange={(e) => handleChange("interestedInPaymentPlans", e.target.value)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3">Yes</span>
            </label>
            <label className="flex items-center text-base text-gray-900">
              <input
                type="radio"
                value="No"
                checked={formData.interestedInPaymentPlans === "No"}
                onChange={(e) => handleChange("interestedInPaymentPlans", e.target.value)}
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

export default InsurancePayment