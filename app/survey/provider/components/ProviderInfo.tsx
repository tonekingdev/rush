"use client"

import type React from "react"

interface ProviderInfoProps {
  formData: {
    name: string
    email: string
    phone: string
    role: string
  }
  handleChange: (input: string, value: string) => void
  nextStep: () => void
}

const ProviderInfo: React.FC<ProviderInfoProps> = ({ formData, handleChange, nextStep }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Provider Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-2 text-base font-medium text-gray-900">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            placeholder="Enter your full name"
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
          <label htmlFor="phone" className="block mb-2 text-base font-medium text-gray-900">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
            placeholder="(123) 456-7890"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <div>
          <label htmlFor="role" className="block mb-2 text-base font-medium text-gray-900">
            Role
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => handleChange("role", e.target.value)}
            required
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          >
            <option value="">Select your role</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="therapist">Therapist</option>
            <option value="other">Other</option>
          </select>
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

export default ProviderInfo