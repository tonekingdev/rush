import React from 'react'

interface AdditionalInfoProps {
  formData: {
    additionalComments: string
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
          <label htmlFor="additionalComments" className="block mb-1 font-medium">Additional Comments</label>
          <textarea
            id="additionalComments"
            value={formData.additionalComments}
            onChange={(e) => handleChange('additionalComments', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-4">
            By submitting this form, you acknowledge that the information provided is accurate to the best of your knowledge. 
            You understand that RUSH will use this information to assess your qualifications and provide appropriate opportunities.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            All information collected through this survey is protected under HIPAA regulations and will be used solely 
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