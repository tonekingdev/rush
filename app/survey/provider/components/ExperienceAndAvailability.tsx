"use client"

import type React from "react"

interface ExperienceAndAvailabilityProps {
  formData: {
    experience: string
    specialization: string
    availability: string
    preferredAreas: string
  }
  handleChange: (input: string, value: string) => void
  nextStep: () => void
  prevStep: () => void
}

const ExperienceAndAvailability: React.FC<ExperienceAndAvailabilityProps> = ({
  formData,
  handleChange,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Experience and Availability</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="experience" className="block mb-2 text-base font-medium text-gray-900">
            Years of Experience
          </label>
          <input
            type="number"
            id="experience"
            value={formData.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
            required
            placeholder="Enter number of years"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <div>
          <label htmlFor="specialization" className="block mb-2 text-base font-medium text-gray-900">
            Specialization
          </label>
          <input
            type="text"
            id="specialization"
            value={formData.specialization}
            onChange={(e) => handleChange("specialization", e.target.value)}
            required
            placeholder="Enter your specialization"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <div>
          <label htmlFor="availability" className="block mb-2 text-base font-medium text-gray-900">
            Availability
          </label>
          <input
            type="text"
            id="availability"
            value={formData.availability}
            onChange={(e) => handleChange("availability", e.target.value)}
            required
            placeholder="e.g., Weekdays, Weekends, Evenings"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <div>
          <label htmlFor="preferredAreas" className="block mb-2 text-base font-medium text-gray-900">
            Preferred Service Areas
          </label>
          <input
            type="text"
            id="preferredAreas"
            value={formData.preferredAreas}
            onChange={(e) => handleChange("preferredAreas", e.target.value)}
            required
            placeholder="e.g., Downtown, North Side, South Side"
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

export default ExperienceAndAvailability