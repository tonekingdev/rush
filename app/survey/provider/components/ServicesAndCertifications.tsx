"use client"

import type React from "react"

interface ServicesAndCertificationsProps {
  formData: {
    services: string[]
    certifications: string
  }
  handleChange: (input: string, value: string | string[]) => void
  nextStep: () => void
  prevStep: () => void
}

const ServicesAndCertifications: React.FC<ServicesAndCertificationsProps> = ({
  formData,
  handleChange,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  const handleCheckboxChange = (service: string) => {
    const updatedServices = formData.services.includes(service)
      ? formData.services.filter((s) => s !== service)
      : [...formData.services, service]
    handleChange("services", updatedServices)
  }

  const services = [
    "Medication management",
    "Vital sign monitoring",
    "Basic wound care",
    "Assistance with activities of daily living (ADLs)",
    "Physical therapy",
    "Occupational therapy",
    "Speech therapy",
    "Other",
  ]

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Services and Certifications</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-3 text-base font-medium text-gray-900">Services Offered</label>
          {services.map((service) => (
            <div key={service} className="flex items-center mt-3">
              <input
                type="checkbox"
                id={service}
                checked={formData.services.includes(service)}
                onChange={() => handleCheckboxChange(service)}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor={service} className="ml-3 text-base text-gray-900">
                {service}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <label htmlFor="certifications" className="block mb-2 text-base font-medium text-gray-900">
            Certifications
          </label>
          <input
            type="text"
            id="certifications"
            value={formData.certifications}
            onChange={(e) => handleChange("certifications", e.target.value)}
            placeholder="e.g., BLS, ACLS, PALS"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
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

export default ServicesAndCertifications