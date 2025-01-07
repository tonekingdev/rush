'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const ProviderSurvey = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    experience: '',
    specialization: '',
    availability: '',
    preferredAreas: '',
    certifications: '',
    additionalComments: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/submit-survey.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, type: 'provider', submittedAt: new Date() }),
      })
      if (response.ok) {
        router.push('/thank-you')
      } else {
        throw new Error('Failed to submit survey')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to submit survey. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Healthcare Provider Survey</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block mb-1 font-medium">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="role" className="block mb-1 font-medium">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select role</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="therapist">Therapist</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="experience" className="block mb-1 font-medium">Years of Experience</label>
          <input
            type="number"
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="specialization" className="block mb-1 font-medium">Specialization</label>
          <input
            type="text"
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="availability" className="block mb-1 font-medium">Availability</label>
          <input
            type="text"
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Weekdays, Weekends, Evenings"
          />
        </div>
        <div>
          <label htmlFor="preferredAreas" className="block mb-1 font-medium">Preferred Service Areas</label>
          <input
            type="text"
            id="preferredAreas"
            name="preferredAreas"
            value={formData.preferredAreas}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Downtown, North Side, South Side"
          />
        </div>
        <div>
          <label htmlFor="certifications" className="block mb-1 font-medium">Certifications</label>
          <input
            type="text"
            id="certifications"
            name="certifications"
            value={formData.certifications}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., BLS, ACLS, PALS"
          />
        </div>
        <div>
          <label htmlFor="additionalComments" className="block mb-1 font-medium">Additional Comments</label>
          <textarea
            id="additionalComments"
            name="additionalComments"
            value={formData.additionalComments}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          ></textarea>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300">
          Submit
        </button>
      </form>
    </div>
  )
}

export default ProviderSurvey

