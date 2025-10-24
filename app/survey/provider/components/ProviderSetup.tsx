"use client"

import React from "react"
import Image from "next/image"

interface ProviderSetupProps {
  formData: {
    firstName: string
    lastName: string
    username: string
    fullAddress: string
    phone: string
    isCNA: boolean
    profileImage: string | null
  }
  handleChange: (field: string, value: string | number | boolean) => void
  handleFileChange: (fieldName: string, file: File) => void
  nextStep: () => void
}

const ProviderSetup: React.FC<ProviderSetupProps> = ({ formData, handleChange, handleFileChange, nextStep }) => {
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange("profileImage", file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const validateForm = () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.fullAddress || !formData.phone) {
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
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Personal Information</h2>

      {/* Profile Image Upload */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden relative">
          {previewImage ? (
            <div className="relative w-full h-full">
              <Image src={previewImage || "/placeholder.svg"} alt="Profile preview" fill className="object-cover" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>
        <label className="cursor-pointer text-blue-500 hover:text-blue-700">
          Upload Image
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block mb-2 text-base font-medium text-gray-900">
            First Name
          </label>
          <input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="Enter your first name"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block mb-2 text-base font-medium text-gray-900">
            Last Name
          </label>
          <input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            placeholder="Enter your last name"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
            required
          />
        </div>
      </div>

      {/* Username */}
      <div className="mb-6">
        <label htmlFor="username" className="block mb-2 text-base font-medium text-gray-900">
          Username
        </label>
        <input
          id="username"
          value={formData.username}
          onChange={(e) => handleChange("username", e.target.value)}
          placeholder="Enter your username"
          className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          required
        />
      </div>

      {/* Full Address */}
      <div className="mb-6">
        <label htmlFor="fullAddress" className="block mb-2 text-base font-medium text-gray-900">
          Full Address
        </label>
        <div className="relative">
          <input
            id="fullAddress"
            value={formData.fullAddress}
            onChange={(e) => handleChange("fullAddress", e.target.value)}
            placeholder="Search by name or address..."
            className="w-full px-4 py-3 pl-10 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
            required
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Phone */}
      <div className="mb-6">
        <label htmlFor="phone" className="block mb-2 text-base font-medium text-gray-900">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="Number incl area code (num only)"
          className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          required
        />
      </div>

      {/* CNA Checkbox */}
      <div className="flex items-center space-x-2 mb-8">
        <input
          type="checkbox"
          id="isCNA"
          checked={formData.isCNA}
          onChange={(e) => handleChange("isCNA", e.target.checked)}
          className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="isCNA" className="text-base font-medium text-gray-900">
          I&apos;m a CNA
        </label>
      </div>

      <div className="flex justify-end">
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

export default ProviderSetup