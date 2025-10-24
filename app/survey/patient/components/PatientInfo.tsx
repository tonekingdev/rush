"use client"

import type React from "react"

interface PatientInfoProps {
  formData: {
    fullName: string
    dateOfBirth: string
    email: string
    phoneNumber: string
    zipCode: string
  }
  handleChange: (input: string, value: string) => void
  nextStep: () => void
}

const PatientInfo: React.FC<PatientInfoProps> = ({ formData, handleChange, nextStep }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Patient Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block mb-2 text-base font-medium text-gray-900">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
            placeholder="Enter your full name"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <div>
          <label htmlFor="dateOfBirth" className="block mb-2 text-base font-medium text-gray-900">
            Date of Birth
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            required
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-2 text-base font-medium text-gray-900">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
            placeholder="your.email@example.com"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block mb-2 text-base font-medium text-gray-900">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            required
            placeholder="(123) 456-7890"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <div>
          <label htmlFor="zipCode" className="block mb-2 text-base font-medium text-gray-900">
            Zip Code
          </label>
          <input
            type="text"
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleChange("zipCode", e.target.value)}
            required
            placeholder="12345"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Next
        </button>
      </form>
    </div>
  )
}

export default PatientInfo