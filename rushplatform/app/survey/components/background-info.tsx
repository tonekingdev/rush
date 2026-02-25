import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChangeEvent, FormEvent } from 'react'

type FormData = {
    role: string;
    experience: string;
    expertise: string;
    schedule: string;
}

type BackgroundInfoProps = {
    onNext: (FormData: FormData) => void;
}

export default function BackgroundInfo({ onNext }: BackgroundInfoProps) {
  const [formData, setFormData] = useState<FormData>({
    role: '',
    experience: '',
    expertise: '',
    schedule: '',
  })

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          What is your current role?
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select a role</option>
          <option value="RN">Registered Nurse (RN)</option>
          <option value="LPN">Licensed Practical Nurse (LPN)</option>
          <option value="CNA">Nurse Assistant (CNA)</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
          How many years of experience do you have in your current role?
        </label>
        <select
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select years of experience</option>
          <option value="0-1">Less than 1 year</option>
          <option value="1-3">1–3 years</option>
          <option value="4-7">4–7 years</option>
          <option value="8+">8+ years</option>
        </select>
      </div>

      <div>
        <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">
          What is your primary area of expertise?
        </label>
        <select
          id="expertise"
          name="expertise"
          value={formData.expertise}
          onChange={handleChange}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select area of expertise</option>
          <option value="acute">Acute care</option>
          <option value="long-term">Long-term care</option>
          <option value="home-health">Home health</option>
          <option value="pediatrics">Pediatrics</option>
          <option value="geriatrics">Geriatrics</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
          What is your typical work schedule?
        </label>
        <select
          id="schedule"
          name="schedule"
          value={formData.schedule}
          onChange={handleChange}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select work schedule</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="per-diem">Per diem</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1586D6] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Next
        </button>
      </div>
    </motion.form>
  )
}