"use client"

import type React from "react"

interface HealthcareNeedsProps {
  formData: {
    interestReasons: string[]
    anticipatedServices: string[]
  }
  handleChange: (input: string, value: string[]) => void
  nextStep: () => void
  prevStep: () => void
}

const HealthcareNeeds: React.FC<HealthcareNeedsProps> = ({ formData, handleChange, nextStep, prevStep }) => {
  const handleCheckboxChange = (input: string, value: string) => {
    // Ensure we're only working with valid keys of formData that are arrays
    if (input === "interestReasons" || input === "anticipatedServices") {
      const currentArray = formData[input]
      const updatedArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]
      handleChange(input, updatedArray)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Healthcare Needs</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-3 text-base font-medium text-gray-900">Why are you interested in RUSH?</label>
          {[
            "Convenience of in-home healthcare",
            "Lack of access to primary care",
            "Shorter wait times for non-emergent care",
            "Flexibility for scheduling appointments",
            "Other",
          ].map((reason) => (
            <div key={reason} className="flex items-center mt-3">
              <input
                type="checkbox"
                id={reason}
                checked={formData.interestReasons.includes(reason)}
                onChange={() => handleCheckboxChange("interestReasons", reason)}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor={reason} className="ml-3 text-base text-gray-900">
                {reason}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <label className="block mb-3 text-base font-medium text-gray-900">
            What type of services do you anticipate needing?
          </label>
          {[
            "Wound care",
            "Medication administration",
            "Physical therapy",
            "Telehealth consultation",
            "Preventive care",
            "Other",
          ].map((service) => (
            <div key={service} className="flex items-center mt-3">
              <input
                type="checkbox"
                id={service}
                checked={formData.anticipatedServices.includes(service)}
                onChange={() => handleCheckboxChange("anticipatedServices", service)}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor={service} className="ml-3 text-base text-gray-900">
                {service}
              </label>
            </div>
          ))}
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

export default HealthcareNeeds