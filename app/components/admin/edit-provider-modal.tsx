"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FaTimes, FaSave, FaSpinner, FaUser, FaBuilding, FaIdCard } from "react-icons/fa"

interface Provider {
  id: number
  name: string
  email: string
  phone?: string
  specialty: string
  status: string
  created_at: string
  updated_at?: string // Add this field
  license_number?: string
  license_type?: string
  license_state?: string
  practice_name?: string
  practice_address?: string
  practice_phone?: string
  practice_email?: string
  npi_number?: string
  dea_number?: string
  notes?: string
  years_experience?: number
  malpractice_provider?: string
  work_ethic?: string
  education?: string
  licenses?: string
  additional_data?: string
}

interface EditProviderModalProps {
  isOpen: boolean
  onClose: () => void
  provider: Provider | null
  onSuccess: (updatedProvider: Provider) => void
}

export function EditProviderModal({ isOpen, onClose, provider, onSuccess }: EditProviderModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialty: "",
    license_number: "",
    license_type: "",
    license_state: "",
    practice_name: "",
    practice_address: "",
    practice_phone: "",
    practice_email: "",
    npi_number: "",
    dea_number: "",
    status: "active",
    notes: "",
    years_experience: 0,
    malpractice_provider: "",
    work_ethic: "",
    education: "",
    licenses: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (provider) {
      setFormData({
        full_name: provider.name || "",
        email: provider.email || "",
        phone: provider.phone || "",
        specialty: provider.specialty || "",
        license_number: provider.license_number || "",
        license_type: provider.license_type || "",
        license_state: provider.license_state || "",
        practice_name: provider.practice_name || "",
        practice_address: provider.practice_address || "",
        practice_phone: provider.practice_phone || "",
        practice_email: provider.practice_email || "",
        npi_number: provider.npi_number || "",
        dea_number: provider.dea_number || "",
        status: provider.status || "active",
        notes: provider.notes || "",
        years_experience: provider.years_experience || 0,
        malpractice_provider: provider.malpractice_provider || "",
        work_ethic: provider.work_ethic || "",
        education: provider.education || "",
        licenses: provider.licenses || "",
      })
    }
  }, [provider])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!provider) return

    setLoading(true)
    setError("")

    try {
      const submitData = {
        id: provider.id,
        ...formData,
      }

      console.log("Submitting provider data:", submitData)

      const response = await fetch("/api/providers.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submitData),
      })

      const data = await response.json()
      console.log("Response:", data)

      if (response.ok && data.success) {
        // Create updated provider object
        const updatedProvider: Provider = {
          ...provider,
          name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          specialty: formData.specialty,
          status: formData.status,
          license_number: formData.license_number,
          license_type: formData.license_type,
          license_state: formData.license_state,
          practice_name: formData.practice_name,
          practice_address: formData.practice_address,
          practice_phone: formData.practice_phone,
          practice_email: formData.practice_email,
          npi_number: formData.npi_number,
          dea_number: formData.dea_number,
          notes: formData.notes,
          years_experience: formData.years_experience,
          malpractice_provider: formData.malpractice_provider,
          work_ethic: formData.work_ethic,
          education: formData.education,
          licenses: formData.licenses,
        }

        onSuccess(updatedProvider)
        onClose()
      } else {
        setError(data.error || data.message || "Failed to update provider")
      }
    } catch (error) {
      console.error("Error updating provider:", error)
      setError("An error occurred while updating the provider")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !provider) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Edit Provider - {provider.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={loading}>
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2 flex items-center">
                <FaUser className="h-4 w-4 mr-2" />
                Personal Information
              </h4>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty *
                </label>
                <select
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                >
                  <option value="">Select Specialty</option>
                  <option value="Family Medicine">Family Medicine</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Anesthesiology">Anesthesiology</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                  <option value="Licensed Practical Nurse (LPN)">Licensed Practical Nurse (LPN)</option>
                  <option value="Certified Nursing Assistant (CNA)">Certified Nursing Assistant (CNA)</option>
                  <option value="Home Health Aide (HHA)">Home Health Aide (HHA)</option>
                  <option value="Physical Therapist (PT)">Physical Therapist (PT)</option>
                  <option value="Occupational Therapist (OT)">Occupational Therapist (OT)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 border-b pb-2 flex items-center">
                <FaIdCard className="h-4 w-4 mr-2" />
                Professional Information
              </h4>

              <div>
                <label htmlFor="license_type" className="block text-sm font-medium text-gray-700 mb-1">
                  License Type
                </label>
                <select
                  id="license_type"
                  name="license_type"
                  value={formData.license_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                >
                  <option value="">Select License Type</option>
                  <option value="MD">Doctor of Medicine (MD)</option>
                  <option value="DO">Doctor of Osteopathic Medicine (DO)</option>
                  <option value="RN">Registered Nurse (RN)</option>
                  <option value="LPN">Licensed Practical Nurse (LPN)</option>
                  <option value="CNA">Certified Nursing Assistant (CNA)</option>
                  <option value="NP">Nurse Practitioner (NP)</option>
                  <option value="PA">Physician Assistant (PA)</option>
                  <option value="PT">Physical Therapist (PT)</option>
                  <option value="OT">Occupational Therapist (OT)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  id="license_number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="license_state" className="block text-sm font-medium text-gray-700 mb-1">
                  License State
                </label>
                <input
                  type="text"
                  id="license_state"
                  name="license_state"
                  value={formData.license_state}
                  onChange={handleInputChange}
                  placeholder="e.g., CA, NY, TX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="npi_number" className="block text-sm font-medium text-gray-700 mb-1">
                  NPI Number
                </label>
                <input
                  type="text"
                  id="npi_number"
                  name="npi_number"
                  value={formData.npi_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="dea_number" className="block text-sm font-medium text-gray-700 mb-1">
                  DEA Number
                </label>
                <input
                  type="text"
                  id="dea_number"
                  name="dea_number"
                  value={formData.dea_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Practice Information */}
          <div className="mt-6 space-y-4">
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 flex items-center">
              <FaBuilding className="h-4 w-4 mr-2" />
              Practice Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="practice_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Practice Name
                </label>
                <input
                  type="text"
                  id="practice_name"
                  name="practice_name"
                  value={formData.practice_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="practice_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Practice Phone
                </label>
                <input
                  type="tel"
                  id="practice_phone"
                  name="practice_phone"
                  value={formData.practice_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="practice_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Practice Email
                </label>
                <input
                  type="email"
                  id="practice_email"
                  name="practice_email"
                  value={formData.practice_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="years_experience"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="practice_address" className="block text-sm font-medium text-gray-700 mb-1">
                  Practice Address
                </label>
                <textarea
                  id="practice_address"
                  name="practice_address"
                  value={formData.practice_address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 space-y-4">
            <h4 className="text-md font-medium text-gray-900 border-b pb-2">Additional Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="malpractice_provider" className="block text-sm font-medium text-gray-700 mb-1">
                  Malpractice Insurance Provider
                </label>
                <input
                  type="text"
                  id="malpractice_provider"
                  name="malpractice_provider"
                  value={formData.malpractice_provider}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="licenses" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Licenses/Certifications
                </label>
                <textarea
                  id="licenses"
                  name="licenses"
                  value={formData.licenses}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="work_ethic" className="block text-sm font-medium text-gray-700 mb-1">
                  Work Philosophy/Ethics
                </label>
                <textarea
                  id="work_ethic"
                  name="work_ethic"
                  value={formData.work_ethic}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                  placeholder="Internal notes for administrative use..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1586D6] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1586D6] border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1586D6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}