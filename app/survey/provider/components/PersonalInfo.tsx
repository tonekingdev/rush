"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"

interface PersonalInfoProps {
  formData: {
    firstName: string
    lastName: string
    username: string
    fullAddress: string
    phone: string
    isCNAHHACaregiver: boolean
    isSitterApplicant: boolean
    profileImage: File | null
    profileImagePreview?: string
    driversLicenseImage: File | null
    driversLicenseImagePreview?: string
    [key: string]:
      | string
      | number
      | boolean
      | File
      | null
      | undefined
      | Array<{
          employerName: string
          employerAddress: string
          startDate: string
          endDate: string
          workDuties: string
        }>
      | Array<{
          referenceName: string
          referenceContact: string
          professionalRelationship: string
        }>
      | Record<string, string | number | boolean>
  }
  handleChange: (input: string, value: string | number | boolean) => void
  handleFileChange: (fieldName: string, file: File) => void
  nextStep: () => void
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ formData, handleChange, handleFileChange, nextStep }) => {
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: string[] = []

    // Check required text fields
    if (!formData.firstName.trim()) {
      newErrors.push("First name is required")
    }
    if (!formData.lastName.trim()) {
      newErrors.push("Last name is required")
    }
    if (!formData.username.trim()) {
      newErrors.push("Email address is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.push("Please enter a valid email address")
    }
    if (!formData.fullAddress.trim()) {
      newErrors.push("Full address is required")
    }
    if (!formData.phone.trim()) {
      newErrors.push("Phone number is required")
    }

    // Check required file uploads
    if (!formData.profileImage) {
      newErrors.push("Profile image is required")
    }
    if (!formData.driversLicenseImage) {
      newErrors.push("Driver's license image is required")
    }

    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors([])

    // Validate form
    const validationErrors = validateForm()

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    // If validation passes, proceed to next step
    try {
      nextStep()
    } catch (error) {
      console.error("Error proceeding to next step:", error)
      setErrors(["An unexpected error occurred. Please try again."])
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange("profileImage", file)
      // Clear profile image error if it exists
      setErrors((prev) => prev.filter((error) => !error.includes("Profile image")))
    }
  }

  const handleDriversLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange("driversLicenseImage", file)
      // Clear driver's license error if it exists
      setErrors((prev) => prev.filter((error) => !error.includes("Driver's license")))
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 text-sm text-red-700">
                <p>
                  If you continue to experience issues, please contact our support team at{" "}
                  <a href="mailto:support@rushhealthc.com" className="font-medium underline hover:text-red-600">
                    support@rushhealthc.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden relative">
            {formData.profileImagePreview ? (
              <div className="relative w-full h-full">
                <Image
                  src={formData.profileImagePreview || "/placeholder.svg"}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                />
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
            Upload Profile Image *
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          {!formData.profileImage && (
            <p className="text-xs text-gray-500 mt-1">Required: Please upload your profile photo</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block mb-2 text-base font-medium text-gray-900">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => {
                handleChange("firstName", e.target.value)
                // Clear first name error if it exists
                setErrors((prev) => prev.filter((error) => !error.includes("First name")))
              }}
              placeholder="Enter your first name"
              className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block mb-2 text-base font-medium text-gray-900">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => {
                handleChange("lastName", e.target.value)
                // Clear last name error if it exists
                setErrors((prev) => prev.filter((error) => !error.includes("Last name")))
              }}
              placeholder="Enter your last name"
              className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
            />
          </div>
        </div>

        {/* Username/Email */}
        <div>
          <label htmlFor="username" className="block mb-2 text-base font-medium text-gray-900">
            Email Address *
          </label>
          <input
            type="email"
            id="username"
            value={formData.username}
            onChange={(e) => {
              handleChange("username", e.target.value)
              // Clear email errors if they exist
              setErrors((prev) => prev.filter((error) => !error.includes("Email") && !error.includes("email")))
            }}
            placeholder="your.email@example.com"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>

        {/* Full Address */}
        <div>
          <label htmlFor="fullAddress" className="block mb-2 text-base font-medium text-gray-900">
            Full Address *
          </label>
          <div className="relative">
            <input
              type="text"
              id="fullAddress"
              value={formData.fullAddress}
              onChange={(e) => {
                handleChange("fullAddress", e.target.value)
                // Clear address error if it exists
                setErrors((prev) => prev.filter((error) => !error.includes("address")))
              }}
              placeholder="Enter your full address"
              className="w-full px-4 py-3 pl-10 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
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
        <div>
          <label htmlFor="phone" className="block mb-2 text-base font-medium text-gray-900">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => {
              handleChange("phone", e.target.value)
              // Clear phone error if it exists
              setErrors((prev) => prev.filter((error) => !error.includes("Phone")))
            }}
            placeholder="(123) 456-7890"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>

        {/* Driver's License Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          <div className="text-center">
            <div className="mb-4">
              {formData.driversLicenseImagePreview ? (
                <div className="relative w-48 h-32 mx-auto rounded-lg overflow-hidden border">
                  <Image
                    src={formData.driversLicenseImagePreview || "/placeholder.svg"}
                    alt="Driver's License preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-48 h-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <span className="text-blue-500 hover:text-blue-700 font-medium">Upload Driver&apos;s License *</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleDriversLicenseUpload} />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Please upload a clear photo of your valid driver&apos;s license
            </p>
            {!formData.driversLicenseImage && (
              <p className="text-xs text-red-500 mt-1">Required: Driver&apos;s license image must be uploaded</p>
            )}
          </div>
        </div>

        {/* CNA Checkbox */}
        <div className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            id="isCNAHHACaregiver"
            checked={formData.isCNAHHACaregiver}
            onChange={(e) => handleChange("isCNAHHACaregiver", e.target.checked)}
            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="isCNAHHACaregiver" className="text-base text-gray-900">
            I&apos;m a CNA/HHA/Caregiver
          </label>
        </div>

        {/* Sitter Checkbox */}
        <div className="flex items-center space-x-2 mt-4">
          <input 
            type="checkbox"
            id="isSitterApplicant"
            checked={formData.isSitterApplicant}
            onChange={(e) => handleChange("isSitterApplicant", e.target.checked)}
            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="isSitterApplicant" className="text-base text-gray-900">
            I&apos;m applying for Sitter position
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : "Next"}
        </button>
      </form>
    </div>
  )
}

export default PersonalInfo