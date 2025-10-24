import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChangeEvent, FormEvent } from 'react'

type FormData = {
  providesInHomeServices: string
  services: string[]
  certifications: string[]
  patientPopulations: string[]
}

type ProfessionalRequirementsProps = {
  onNext: (FormData: FormData) => void
  onPrevious: () => void
}

export default function ProfessionalRequirements({ onNext, onPrevious }: ProfessionalRequirementsProps) {
  const [formData, setFormData] = useState<FormData>({
    providesInHomeServices: '',
    services: [],
    certifications: [],
    patientPopulations: [],
  })

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      providesInHomeServices: e.target.value
    }))
  }

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const { value, checked } = e.target
    if (fieldName === 'services') {
      setFormData((prev) => ({
        ...prev,
        services: checked ? [...prev.services, value] : prev.services.filter((item) => item !== value)
      }))
    } else if (fieldName === 'certifications') {
      setFormData((prev) => ({
        ...prev,
        certifications: checked ? [...prev.certifications, value] : prev.certifications.filter((item) => item !== value)
      }))
    } else if (fieldName === 'patientPopulations') {
      setFormData((prev) => ({
        ...prev,
        patientPopulations: checked ? [...prev.patientPopulations, value] : prev.patientPopulations.filter((item) => item !== value)
      }))
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="providesInHomeServices" className="block text-sm font-medium text-gray-700">
          Do you currently provide any in-home healthcare services?
        </label>
        <select
          id="providesInHomeServices"
          name="providesInHomeServices"
          value={formData.providesInHomeServices}
          onChange={handleSelectChange}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select an option</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      {formData.providesInHomeServices === 'yes' && (
        <div>
          <span className="block text-sm font-medium text-gray-700">
            What types of services do you typically provide?
          </span>
          <div className="mt-2 space-y-2">
            {['Medication management', 'Vital sign monitoring', 'Basic wound care', 'Assistance with activities of daily living (ADLs)'].map((service) => (
              <div key={service} className="flex items-center">
                <input
                  id={`service-${service}`}
                  name="services"
                  type="checkbox"
                  value={service}
                  checked={formData.services.includes(service)}
                  onChange={(e) => handleCheckboxChange(e, 'services')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`service-${service}`} className="ml-2 block text-sm text-gray-900">
                  {service}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="block text-sm font-medium text-gray-700">
          What certifications or licenses do you currently hold?
        </span>
        <div className="mt-2 space-y-2">
          {['CPR/BLS', 'IV Certification', 'Wound Care Certification'].map((certification) => (
            <div key={certification} className="flex items-center">
              <input
                id={`certification-${certification}`}
                name="certifications"
                type="checkbox"
                value={certification}
                checked={formData.certifications.includes(certification)}
                onChange={(e) => handleCheckboxChange(e, 'certifications')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`certification-${certification}`} className="ml-2 block text-sm text-gray-900">
                {certification}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700">
          Are you comfortable working with the following patient populations?
        </span>
        <div className="mt-2 space-y-2">
          {['Pediatric patients', 'Elderly patients', 'Patients with chronic conditions', 'Post-operative patients'].map((population) => (
            <div key={population} className="flex items-center">
              <input
                id={`population-${population}`}
                name="patientPopulations"
                type="checkbox"
                value={population}
                checked={formData.patientPopulations.includes(population)}
                onChange={(e) => handleCheckboxChange(e, 'patientPopulations')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`population-${population}`} className="ml-2 block text-sm text-gray-900">
                {population}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Previous
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#1586D6] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Next
        </button>
      </div>
    </motion.form>
  )
}