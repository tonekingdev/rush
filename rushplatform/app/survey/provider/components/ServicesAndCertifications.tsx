import React from 'react'

interface ServicesAndCertificationsProps {
  formData: {
    services: string[]
    certifications: string
  }
  handleChange: (input: string, value: string | string[]) => void
  nextStep: () => void
  prevStep: () => void
}

const ServicesAndCertifications: React.FC<ServicesAndCertificationsProps> = ({ formData, handleChange, nextStep, prevStep }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  const handleCheckboxChange = (service: string) => {
    const updatedServices = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service]
    handleChange('services', updatedServices)
  }

  const services = [
    'Medication management',
    'Vital sign monitoring',
    'Basic wound care',
    'Assistance with activities of daily living (ADLs)',
    'Physical therapy',
    'Occupational therapy',
    'Speech therapy',
    'Other'
  ]

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Services and Certifications</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Services Offered</label>
          {services.map((service) => (
            <div key={service} className="flex items-center mt-2">
              <input
                type="checkbox"
                id={service}
                checked={formData.services.includes(service)}
                onChange={() => handleCheckboxChange(service)}
                className="mr-2"
              />
              <label htmlFor={service}>{service}</label>
            </div>
          ))}
        </div>
        <div>
          <label htmlFor="certifications" className="block mb-1 font-medium">Certifications</label>
          <input
            type="text"
            id="certifications"
            value={formData.certifications}
            onChange={(e) => handleChange('certifications', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., BLS, ACLS, PALS"
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

export default ServicesAndCertifications