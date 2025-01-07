import React from 'react'

interface InsurancePaymentProps {
  formData: {
    hasInsurance: string
    insuranceProvider: string
    interestedInPaymentPlans: string
  }
  handleChange: (input: string, value: string) => void
  nextStep: () => void
  prevStep: () => void
}

const InsurancePayment: React.FC<InsurancePaymentProps> = ({ formData, handleChange, nextStep, prevStep }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Insurance and Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Do you currently have health insurance?</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="Yes"
                checked={formData.hasInsurance === 'Yes'}
                onChange={(e) => handleChange('hasInsurance', e.target.value)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="No"
                checked={formData.hasInsurance === 'No'}
                onChange={(e) => handleChange('hasInsurance', e.target.value)}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>
        {formData.hasInsurance === 'Yes' && (
          <div>
            <label htmlFor="insuranceProvider" className="block mb-1 font-medium">Insurance Provider Name</label>
            <input
              type="text"
              id="insuranceProvider"
              value={formData.insuranceProvider}
              onChange={(e) => handleChange('insuranceProvider', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div>
          <label className="block mb-1 font-medium">Would you be interested in flexible payment plans or financial assistance for services?</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="Yes"
                checked={formData.interestedInPaymentPlans === 'Yes'}
                onChange={(e) => handleChange('interestedInPaymentPlans', e.target.value)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="No"
                checked={formData.interestedInPaymentPlans === 'No'}
                onChange={(e) => handleChange('interestedInPaymentPlans', e.target.value)}
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

export default InsurancePayment

