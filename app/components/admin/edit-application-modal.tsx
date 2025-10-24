"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FaTimes, FaSave } from "react-icons/fa"

interface Application {
  id: number
  name: string // Maps to full_name from API
  email: string
  phone: string
  address: string
  is_cna: number
  work_ethic: string
  education: string
  licenses: string
  years_experience: number
  license_type: string
  license_number: string
  malpractice_provider: string
  profile_image: string
  education_image: string
  license_image: string
  work_history: string
  references_data: string
  liability_signed: number
  liability_signature: string
  background_acknowledged: number
  malpractice_acknowledged: number
  exclusion_screening_signed: number
  exclusion_screening_signature: string
  exclusion_screening_date: string
  additional_data: string
  status: string
  created_at: string
  drug_alcohol_signed: number
  drug_alcohol_signature: string
  drug_alcohol_date: string
  drug_alcohol_pdf: string
  liability_pdf: string
  exclusion_pdf: string
  // NEW: Non-Compete Clause fields
  non_compete_signed: number
  non_compete_signature: string
  non_compete_date: string
  non_compete_pdf: string
  specialty: string // Maps to license_type for display
  missing_fields: string[]
  is_complete: boolean
  provider_id: string
}

interface EditApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application | null
  onSuccess: (updatedApplication: Application) => void
}

export function EditApplicationModal({ isOpen, onClose, application, onSuccess }: EditApplicationModalProps) {
  const [formData, setFormData] = useState<Partial<Application>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (application) {
      setFormData({
        name: application.name,
        email: application.email,
        phone: application.phone,
        address: application.address,
        license_type: application.license_type,
        license_number: application.license_number,
        years_experience: application.years_experience,
        malpractice_provider: application.malpractice_provider,
        status: application.status,
      })
    }
  }, [application])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!application) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/provider-applications.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: application.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update application")
      }

      const data = await response.json()

      if (data.success) {
        // Create updated application object with all required fields
        const updatedApplication: Application = {
          ...application,
          ...formData,
          // Ensure all required fields are present
          non_compete_signed: application.non_compete_signed || 0,
          non_compete_signature: application.non_compete_signature || "",
          non_compete_date: application.non_compete_date || "",
          non_compete_pdf: application.non_compete_pdf || "",
        } as Application

        onSuccess(updatedApplication)
        onClose()
      } else {
        throw new Error(data.error || "Failed to update application")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "years_experience" ? Number.parseInt(value) || 0 : value,
    }))
  }

  if (!isOpen || !application) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Application</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1586D6] focus:border-[#1586D6]"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1586D6] focus:border-[#1586D6]"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1586D6] focus:border-[#1586D6]"
                required
              />
            </div>

            <div>
              <label htmlFor="license_type" className="block text-sm font-medium text-gray-700">
                License Type
              </label>
              <input
                type="text"
                id="license_type"
                name="license_type"
                value={formData.license_type || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1586D6] focus:border-[#1586D6]"
              />
            </div>

            <div>
              <label htmlFor="license_number" className="block text-sm font-medium text-gray-700">
                License Number
              </label>
              <input
                type="text"
                id="license_number"
                name="license_number"
                value={formData.license_number || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1586D6] focus:border-[#1586D6]"
              />
            </div>

            <div>
              <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <input
                type="number"
                id="years_experience"
                name="years_experience"
                value={formData.years_experience || 0}
                onChange={handleInputChange}
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1586D6] focus:border-[#1586D6]"
              />
            </div>

            <div>
              <label htmlFor="malpractice_provider" className="block text-sm font-medium text-gray-700">
                Malpractice Provider
              </label>
              <input
                type="text"
                id="malpractice_provider"
                name="malpractice_provider"
                value={formData.malpractice_provider || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1586D6] focus:border-[#1586D6]"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1586D6] focus:border-[#1586D6]"
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1586D6] focus:border-[#1586D6]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1586D6] border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1586D6] disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FaSave className="h-4 w-4" />
              )}
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
