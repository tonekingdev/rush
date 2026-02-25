import React from 'react'

interface MedicalHistoryProps {
  formData: {
    medicalConditions: string
    hasPCP: string
    takingMedications: string
  }
  handleChange: (input: string, value: string) => void
  nextStep: () => void
  prevStep: () => void
}

const MedicalHistory: React.FC<MedicalHistoryProps> = ({ formData, handleChange, nextStep, prevStep }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Medical History</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="medicalConditions" className="block mb-1 font-medium">Do you have any ongoing medical conditions or comorbidities?</label>
          <input
            type="text"
            id="medicalConditions"
            value={formData.medicalConditions}
            onChange={(e) => handleChange('medicalConditions', e.target.value)}
            placeholder="If yes, please specify"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Do you currently have a primary care physician (PCP)?</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="Yes"
                checked={formData.hasPCP === 'Yes'}
                onChange={(e) => handleChange('hasPCP', e.target.value)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="No"
                checked={formData.hasPCP === 'No'}
                onChange={(e) => handleChange('hasPCP', e.target.value)}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Are you currently taking any medications?</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="Yes"
                checked={formData.takingMedications === 'Yes'}
                onChange={(e) => handleChange('takingMedications', e.target.value)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="No"
                checked={formData.takingMedications === 'No'}
                onChange={(e) => handleChange('takingMedications', e.target.value)}
                className="mr-2"
              />
              No
            </label>
          </div>
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

export default MedicalHistory

