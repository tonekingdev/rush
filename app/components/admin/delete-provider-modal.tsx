"use client"

import { useState } from "react"
import {
  FaTimes,
  FaTrash,
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendar,
  FaExclamationTriangle,
  FaBuilding,
} from "react-icons/fa"

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
  practice_name?: string
}

interface DeleteProviderModalProps {
  isOpen: boolean
  onClose: () => void
  provider: Provider | null
  onSuccess: (deletedProvider: Provider) => void
}

export function DeleteProviderModal({ isOpen, onClose, provider, onSuccess }: DeleteProviderModalProps) {
  const [confirmText, setConfirmText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!provider || confirmText !== "DELETE") {
      setError("Please type DELETE to confirm deletion")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/providers.php", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: provider.id }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onSuccess(provider)
        onClose()
        // Reset form
        setConfirmText("")
      } else {
        setError(data.error || "Failed to delete provider")
      }
    } catch (error) {
      console.error("Error deleting provider:", error)
      setError("An error occurred while deleting the provider")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setConfirmText("")
      setError("")
      onClose()
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Active"
      case "suspended":
        return "Suspended"
      case "inactive":
        return "Inactive"
      case "pending":
        return "Pending"
      default:
        return "Unknown"
    }
  }

  if (!isOpen || !provider) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FaTrash className="h-5 w-5 mr-2 text-red-600" />
            Delete Provider
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>
          )}

          {/* Provider Details */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">Provider Details</h4>

            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <FaUser className="h-4 w-4 mr-3 text-gray-400" />
                <span className="font-medium">Name:</span>
                <span className="ml-2">{provider.name}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <FaEnvelope className="h-4 w-4 mr-3 text-gray-400" />
                <span className="font-medium">Email:</span>
                <span className="ml-2">{provider.email}</span>
              </div>

              {provider.phone && (
                <div className="flex items-center text-gray-700">
                  <FaPhone className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">{provider.phone}</span>
                </div>
              )}

              <div className="flex items-center text-gray-700">
                <span className="font-medium">Specialty:</span>
                <span className="ml-2">{provider.specialty}</span>
              </div>

              {provider.license_number && (
                <div className="flex items-center text-gray-700">
                  <FaIdCard className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium">License:</span>
                  <span className="ml-2">
                    {provider.license_type} - {provider.license_number}
                  </span>
                </div>
              )}

              {provider.practice_name && (
                <div className="flex items-center text-gray-700">
                  <FaBuilding className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium">Practice:</span>
                  <span className="ml-2">{provider.practice_name}</span>
                </div>
              )}

              <div className="flex items-center text-gray-700">
                <span className="font-medium">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                  {getStatusText(provider.status)}
                </span>
              </div>

              <div className="flex items-center text-gray-700">
                <FaCalendar className="h-4 w-4 mr-3 text-gray-400" />
                <span className="font-medium">Joined:</span>
                <span className="ml-2">{formatDate(provider.created_at)}</span>
              </div>

              {provider.updated_at && (
                <div className="flex items-center text-gray-700">
                  <FaCalendar className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2">{formatDate(provider.updated_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Warning Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-red-800 font-medium mb-2">Warning: Permanent Deletion</h4>
                <p className="text-red-700 mb-3">This action will permanently delete:</p>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
                    All provider profile information
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
                    Professional credentials and licenses
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
                    Practice information and contact details
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
                    Provider schedules and availability
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
                    Service assignments and history
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
                    Any associated patient assignments
                  </li>
                </ul>
                <p className="text-red-800 font-medium mt-3">This action cannot be undone!</p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">
              To confirm deletion, type <span className="font-bold text-red-600">DELETE</span> in the field below:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || confirmText !== "DELETE"}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="h-4 w-4 mr-2" />
                Delete Provider
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}