"use client"

import React from "react"
import Image from "next/image"

interface ProviderCredentialsProps {
  formData: {
    workEthic: string
    education: string
    educationImage: string | null
    licenses: string
    licenseImage: string | null
    yearsExperience: string | number
  }
  handleChange: (field: string, value: string | number | boolean) => void
  handleFileChange: (fieldName: string, file: File) => void
  nextStep: () => void
  prevStep: () => void
}

const ProviderCredentials: React.FC<ProviderCredentialsProps> = ({
  formData,
  handleChange,
  handleFileChange,
  nextStep,
  prevStep,
}) => {
  const [educationPreview, setEducationPreview] = React.useState<string | null>(null)
  const [licensePreview, setLicensePreview] = React.useState<string | null>(null)

  const handleEducationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange("educationImage", file)
      setEducationPreview(URL.createObjectURL(file))
    }
  }

  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange("licenseImage", file)
      setLicensePreview(URL.createObjectURL(file))
    }
  }

  const validateForm = () => {
    // Basic validation
    if (!formData.workEthic || !formData.education || !formData.licenses || !formData.yearsExperience) {
      alert("Please fill in all required fields")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateForm()) {
      nextStep()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Professional Credentials</h2>

      {/* Work Ethic */}
      <div className="mb-6">
        <label htmlFor="workEthic" className="block mb-2 text-base font-medium text-gray-900">
          Describe your professional work ethic and approach to responsibilities
        </label>
        <textarea
          id="workEthic"
          value={formData.workEthic}
          onChange={(e) => handleChange("workEthic", e.target.value)}
          placeholder="Your work ethics"
          className="w-full px-4 py-3 min-h-[100px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          required
        ></textarea>
      </div>

      {/* Education */}
      <div className="mb-6">
        <label htmlFor="education" className="block mb-2 text-base font-medium text-gray-900">
          Education
        </label>
        <input
          id="education"
          value={formData.education}
          onChange={(e) => handleChange("education", e.target.value)}
          placeholder="Enter your school here"
          className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          required
        />

        {/* Education Image Upload */}
        <div className="mt-4">
          <div className="w-full h-40 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative">
            {educationPreview ? (
              <div className="relative w-full h-full">
                <Image
                  src={educationPreview || "/placeholder.svg"}
                  alt="Education document preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>No image uploaded</span>
              </div>
            )}
          </div>
          <label className="cursor-pointer text-blue-500 hover:text-blue-700">
            Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={handleEducationUpload} />
          </label>
        </div>
      </div>

      {/* Licenses & Certifications */}
      <div className="mb-6">
        <label htmlFor="licenses" className="block mb-2 text-base font-medium text-gray-900">
          Licenses & Certifications
        </label>
        <input
          id="licenses"
          value={formData.licenses}
          onChange={(e) => handleChange("licenses", e.target.value)}
          placeholder="Enter your licenses and/or certifications"
          className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          required
        />

        {/* License Image Upload */}
        <div className="mt-4">
          <div className="w-full h-40 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative">
            {licensePreview ? (
              <div className="relative w-full h-full">
                <Image
                  src={licensePreview || "/placeholder.svg"}
                  alt="License document preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>No image uploaded</span>
              </div>
            )}
          </div>
          <label className="cursor-pointer text-blue-500 hover:text-blue-700">
            Upload License or Certificate
            <input type="file" accept="image/*" className="hidden" onChange={handleLicenseUpload} />
          </label>
        </div>
      </div>

      {/* Years of Experience */}
      <div className="mb-8">
        <label htmlFor="yearsExperience" className="block mb-2 text-base font-medium text-gray-900">
          Years of Experience
        </label>
        <input
          id="yearsExperience"
          type="number"
          min="0"
          value={formData.yearsExperience}
          onChange={(e) => handleChange("yearsExperience", Number.parseInt(e.target.value) || 0)}
          className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          required
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-3 border border-blue-500 text-blue-500 font-medium rounded-lg hover:bg-blue-50 transition duration-300"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default ProviderCredentials
