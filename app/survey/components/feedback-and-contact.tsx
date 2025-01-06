import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChangeEvent, FormEvent } from 'react'

type FormData = {
  additionalResources: string
  contactForUpdates: boolean
  email: string
  suggestions: string
}

type FeedbackAndContactProps = {
  onSubmit: (formData: FormData) => void
  onPrevious: () => void
}

export default function FeedbackAndContact({ onSubmit, onPrevious }: FeedbackAndContactProps) {
  const [formData, setFormData] = useState<FormData>({
    additionalResources: '',
    contactForUpdates: false,
    email: '',
    suggestions: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked 
        : value
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="additionalResources" className="block text-sm font-medium text-gray-700">
          What additional resources or support would you like RUSH to provide to healthcare professionals?
        </label>
        <textarea
          id="additionalResources"
          name="additionalResources"
          rows={3}
          value={formData.additionalResources}
          onChange={handleChange}
          className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
        />
      </div>

      <div>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="contactForUpdates"
              name="contactForUpdates"
              type="checkbox"
              checked={formData.contactForUpdates}
              onChange={handleChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="contactForUpdates" className="font-medium text-gray-700">
              Would you like to be contacted with updates or for future opportunities with RUSH?
            </label>
          </div>
        </div>
      </div>

      {formData.contactForUpdates && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
            placeholder="you@example.com"
          />
        </div>
      )}

      <div>
        <label htmlFor="suggestions" className="block text-sm font-medium text-gray-700">
          Do you have any other suggestions or comments about how RUSH can better meet your needs as a healthcare professional?
        </label>
        <textarea
          id="suggestions"
          name="suggestions"
          rows={3}
          value={formData.suggestions}
          onChange={handleChange}
          className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
        />
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
          Submit
        </button>
      </div>
    </motion.form>
  )
}