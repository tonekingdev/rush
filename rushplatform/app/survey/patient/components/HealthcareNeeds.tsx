import React from 'react'

interface HealthcareNeedsProps {
  formData: {
    interestReasons: string[]
    anticipatedServices: string[]
  }
  handleChange: (input: string, value: string[]) => void
  nextStep: () => void
  prevStep: () => void
}

const HealthcareNeeds: React.FC<HealthcareNeedsProps> = ({ formData, handleChange, nextStep, prevStep }) => {
  const handleCheckboxChange = (input: string, value: string) => {
    let updatedFormData: { interestReasons: string[]; anticipatedServices: string[] }

    if (input === 'interestReasons') {
      updatedFormData = {
        ...formData,
        interestReasons: formData.interestReasons.includes(value) ? formData.interestReasons.filter((item) => item !== value) : [...formData.interestReasons, value],
      }
    } else if (input === 'anticipatedServices') {
      updatedFormData = {
        ...formData,
        anticipatedServices: formData.anticipatedServices.includes(value) ? formData.anticipatedServices.filter((item) => item !== value) : [...formData.anticipatedServices, value],
      }
    } else {
      // Handle invalid input (optional)
      console.error("Invalid input:", input)
      return
    }

    handleChange(input, updatedFormData[input])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Healthcare Needs</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Why are you interested in RUSH?</label>
          {['Convenience of in-home healthcare', 'Lack of access to primary care', 'Shorter wait times for non-emergent care', 'Flexibility for scheduling appointments', 'Other'].map((reason) => (
            <div key={reason} className="flex items-center mt-2">
              <input
                type="checkbox"
                id={reason}
                checked={formData.interestReasons.includes(reason)}
                onChange={() => handleCheckboxChange('interestReasons', reason)}
                className="mr-2"
              />
              <label htmlFor={reason}>{reason}</label>
            </div>
          ))}
        </div>
        <div>
          <label className="block mb-1 font-medium">What type of services do you anticipate needing?</label>
          {['Wound care', 'Medication administration', 'Physical therapy', 'Telehealth consultation', 'Preventive care', 'Other'].map((service) => (
            <div key={service} className="flex items-center mt-2">
              <input
                type="checkbox"
                id={service}
                checked={formData.anticipatedServices.includes(service)}
                onChange={() => handleCheckboxChange('anticipatedServices', service)}
                className="mr-2"
              />
              <label htmlFor={service}>{service}</label>
            </div>
          ))}
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

export default HealthcareNeeds

