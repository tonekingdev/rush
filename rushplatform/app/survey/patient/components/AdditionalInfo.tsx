import React from 'react'

interface AdditionalInfoProps {
  formData: {
    accessibilityNeeds: string
    additionalInfo: string
  }
  handleChange: (input: string, value: string) => void
  prevStep: () => void
  handleSubmit: () => void
}

const AdditionalInfo: React.FC<AdditionalInfoProps> = ({ formData, handleChange, prevStep, handleSubmit }) => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Additional Information</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="accessibilityNeeds" className="block mb-1 font-medium">Do you have any accessibility needs or preferences for in-home care?</label>
          <input
            type="text"
            id="accessibilityNeeds"
            value={formData.accessibilityNeeds}
            onChange={(e) => handleChange('accessibilityNeeds', e.target.value)}
            placeholder="If yes, please specify"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="additionalInfo" className="block mb-1 font-medium">Is there anything else you&apos;d like us to know about your healthcare needs?</label>
          <textarea
            id="additionalInfo"
            value={formData.additionalInfo}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-4">
            By submitting this form, you acknowledge that the information provided is accurate to the best of your knowledge. 
            You understand that RUSH will use this information to assess your healthcare needs and provide appropriate services.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            All patient information collected through this survey is protected under HIPAA regulations and will be used solely 
            for the purpose of providing healthcare services through RUSH.
          </p>
        </div>
        <div className="flex justify-between">
          <button type="button" onClick={prevStep} className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition duration-300">
            Previous
          </button>
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdditionalInfo