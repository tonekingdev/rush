"use client"

import { useState } from "react"
import { FaTimes, FaTrash, FaExclamationTriangle } from "react-icons/fa"

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

interface DeleteApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application | null
  onSuccess: (deletedApplication: Application) => void
}

export function DeleteApplicationModal({ isOpen, onClose, application, onSuccess }: DeleteApplicationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!application) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/provider-applications.php", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: application.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete application")
      }

      const data = await response.json()

      if (data.success) {
        onSuccess(application)
        onClose()
      } else {
        throw new Error(data.error || "Failed to delete application")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !application) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Delete Application</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <FaExclamationTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Application Details:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Name:</strong> {application.name}
              </p>
              <p>
                <strong>Email:</strong> {application.email}
              </p>
              <p>
                <strong>Phone:</strong> {application.phone}
              </p>
              <p>
                <strong>Status:</strong> {application.status}
              </p>
              <p>
                <strong>Applied:</strong> {new Date(application.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Deleting this application will permanently remove all associated data, including uploaded documents,
            signatures, and form submissions. This action cannot be reversed.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FaTrash className="h-4 w-4" />
            )}
            <span>{loading ? "Deleting..." : "Delete Application"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}