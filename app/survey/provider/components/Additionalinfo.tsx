"use client"

import type React from "react"

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
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="additionalComments" className="block mb-2 text-base font-medium text-gray-900">
            Additional Comments
          </label>
          <textarea
            id="additionalComments"
            value={formData.additionalComments}
            onChange={(e) => handleChange("additionalComments", e.target.value)}
            rows={4}
            placeholder="Share any additional information here"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          ></textarea>
        </div>
        <div>
          <p className="text-base text-gray-700 mb-4">
            By submitting this form, you acknowledge that the information provided is accurate to the best of your
            knowledge. You understand that RUSH will use this information to assess your qualifications and provide
            appropriate opportunities.
          </p>
          <p className="text-base text-gray-700 mb-4">
            All information collected through this survey is protected under HIPAA regulations and will be used solely
            for the purpose of providing healthcare services through RUSH.
          </p>
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
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdditionalInfo