import React from 'react'

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

const ExperienceAndAvailability: React.FC<ExperienceAndAvailabilityProps> = ({ formData, handleChange, nextStep, prevStep }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Experience and Availability</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="experience" className="block mb-1 font-medium">Years of Experience</label>
          <input
            type="number"
            id="experience"
            value={formData.experience}
            onChange={(e) => handleChange('experience', e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="specialization" className="block mb-1 font-medium">Specialization</label>
          <input
            type="text"
            id="specialization"
            value={formData.specialization}
            onChange={(e) => handleChange('specialization', e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="availability" className="block mb-1 font-medium">Availability</label>
          <input
            type="text"
            id="availability"
            value={formData.availability}
            onChange={(e) => handleChange('availability', e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Weekdays, Weekends, Evenings"
          />
        </div>
        <div>
          <label htmlFor="preferredAreas" className="block mb-1 font-medium">Preferred Service Areas</label>
          <input
            type="text"
            id="preferredAreas"
            value={formData.preferredAreas}
            onChange={(e) => handleChange('preferredAreas', e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Downtown, North Side, South Side"
          />
        </div>
        <div className="flex justify-between">
          <button type="button" onClick={prevStep} className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition duration-300">
            Previous
          </button>
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
            Next
          </button>
        </div>
      </form>
    </div>
  )
}

export default ExperienceAndAvailability