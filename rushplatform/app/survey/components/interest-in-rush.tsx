import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChangeEvent, FormEvent } from 'react'

type FormData = {
  likelihood: string
  features: string[]
  concerns: string[]
}

type InterestInRushProps = {
  onNext: (formData: FormData) => void
  onPrevious: () => void
}

export default function InterestInRush({ onNext, onPrevious }: InterestInRushProps) {
  const [formData, setFormData] = useState<FormData>({
    likelihood: '',
    features: [],
    concerns: [],
  })

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target
    if (name === 'features') {
      setFormData((prev) => ({
        ...prev,
        features: checked
          ? [...prev.features, value]
          : prev.features.filter((item) => item !== value)
      }))
    } else if (name === 'concerns') {
      setFormData((prev) => ({
        ...prev,
        concerns: checked
          ? [...prev.concerns, value]
          : prev.concerns.filter((item) => item !== value)
      }))
    }
  }

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, likelihood: e.target.value }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <motion.form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <label htmlFor="likelihood" className="block text-sm font-medium text-gray-700">
          How likely are you to sign up for a platform like RUSH?
        </label>
        <select
          id='likelihood'
          name='likelihood'
          value={formData.likelihood}
          onChange={handleSelectChange} //Handling select changes
          required
          className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
        >
          <option value="">Select likelihood</option>
          <option value="very-likely">Very likely</option>
          <option value="somewhat-likely">Somewhat likely</option>
          <option value="neutral">Neutral</option>
          <option value="somewhat-unlikely">Somewhat unlikely</option>
          <option value="very-unlikely">Very unlikely</option>
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700">
          What features would make you more likely to use the RUSH app?
        </span>
        <div className="mt-2 space-y-2">
          {['Flexible scheduling', 'Competitive pay rates', 'Easy-to-use interface', 'Reliable payment system', 'Opportunity to specialize'].map((feature) => (
              <div key={feature} className="flex items-center">
                <input
                  id={`feature-${feature}`}
                  name="features"
                  type="checkbox"
                  value={feature}
                  checked={formData.features.includes(feature)}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`feature-${feature}`} className="ml-2 block text-sm text-gray-900">
                  {feature}
                </label>
              </div>
            ))}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700">
          What concerns, if any, would you have about using a platform like RUSH?
        </span>
        <div className="mt-2 space-y-2">
          {['Security of patient information', 'Liability coverage', 'Reliability of scheduling', 'Payment processing'].map((concern) => (
            <div key={concern} className="flex items-center">
              <input
                id={`concern-${concern}`}
                name="concerns"
                type="checkbox"
                value={concern}
                checked={formData.concerns.includes(concern)}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`concern-${concern}`} className="ml-2 block text-sm text-gray-900">
                {concern}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type='button'
          onClick={onPrevious}
          className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
        >
          Previous
        </button>
        <button
          type='submit'
          className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#1586D6] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          Next
        </button>
      </div>
    </motion.form>
  )
}