"use client"

import type React from "react"

import { useState } from "react"
import { FaTimes, FaEnvelope, FaExclamationTriangle, FaCheckCircle, FaSpinner } from "react-icons/fa"

interface SendCompletionLinkModalProps {
  isOpen: boolean
  onClose: () => void
  provider: {
    id: number
    provider_id: string
    full_name: string
    email: string
    application_id?: number
  } | null
}

const AVAILABLE_FIELDS = [
  { key: "license_number", label: "License Number" },
  { key: "license_type", label: "License Type" },
  { key: "license_state", label: "License State" },
  { key: "specialty", label: "Medical Specialty" },
  { key: "practice_name", label: "Practice Name" },
  { key: "practice_address", label: "Practice Address" },
  { key: "practice_phone", label: "Practice Phone" },
  { key: "practice_email", label: "Practice Email" },
  { key: "npi_number", label: "NPI Number" },
  { key: "dea_number", label: "DEA Number" },
  { key: "phone", label: "Phone Number" },
  { key: "drivers_license_image", label: "Driver's License" },
  { key: "bls_cpr_image", label: "BLS/CPR Certification" },
  { key: "tb_test_image", label: "TB Test Results (within 12 months)" },
  { key: "wound_care_image", label: "Wound Care Certification" },
  { key: "profile_image", label: "Profile Image" },
  { key: "education_image", label: "Education Document" },
  { key: "license_image", label: "Professional License Document" },
  { key: "liability_pdf", label: "Liability Agreement PDF" },
  { key: "exclusion_pdf", label: "Exclusion Screening PDF" },
  { key: "drug_alcohol_pdf", label: "Drug & Alcohol Policy PDF" },
]

export function SendCompletionLinkModal({ isOpen, onClose, provider }: SendCompletionLinkModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields((prev) => (prev.includes(fieldKey) ? prev.filter((f) => f !== fieldKey) : [...prev, fieldKey]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!provider) {
      setError("No provider selected")
      return
    }

    if (selectedFields.length === 0) {
      setError("Please select at least one missing field")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("Sending completion link with data:", {
        provider_id: provider.provider_id,
        application_id: provider.application_id || provider.id,
        provider_email: provider.email,
        missing_fields: selectedFields,
      })

      const response = await fetch("/api/send-completion-link.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          provider_id: provider.provider_id,
          application_id: provider.application_id || provider.id,
          provider_email: provider.email,
          missing_fields: selectedFields,
        }),
      })

      const responseText = await response.text()
      console.log("Raw response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", e)
        throw new Error("Server returned invalid JSON: " + responseText)
      }

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setSelectedFields([])
        }, 2000)
      } else {
        setError(data.message || "Failed to send completion link")
      }
    } catch (error) {
      console.error("Error sending completion link:", error)
      setError(error instanceof Error ? error.message : "Failed to send completion link")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError("")
      setSuccess(false)
      setSelectedFields([])
    }
  }

  if (!isOpen || !provider) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <FaEnvelope className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Send Completion Link</h3>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Link Sent Successfully!</h4>
              <p className="text-gray-600">The completion link has been sent to {provider.email}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Provider Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Provider Information</h4>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Name:</strong> {provider.full_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {provider.email}
                  </p>
                  <p>
                    <strong>Provider ID:</strong> {provider.provider_id}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Missing Fields Selection */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Select Missing Fields</h4>
                <p className="text-sm text-gray-600 mb-4">Choose the fields that the provider needs to complete:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {AVAILABLE_FIELDS.map((field) => (
                    <label
                      key={field.key}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field.key)}
                        onChange={() => handleFieldToggle(field.key)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FaExclamationTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium mb-1">Important Notes:</p>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• The completion link will expire in 72 hours</li>
                      <li>• The provider can only use the link once</li>
                      <li>• Only one active link per provider is allowed</li>
                      <li>• The provider will receive an email with instructions</li>
                      <li>• Required certifications: Driver&apos;s License, BLS/CPR, TB Test (within 12 months)</li>
                      <li>• Wound Care Certification required only if provider has wound care experience</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedFields.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
                  <span>{loading ? "Sending..." : "Send Completion Link"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}