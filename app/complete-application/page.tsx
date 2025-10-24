"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { FaCheckCircle, FaExclamationTriangle, FaSpinner, FaClock, FaUser, FaEnvelope } from "react-icons/fa"

interface TokenData {
  provider_id: string
  provider_email: string
  provider_name: string
  specialty: string
  missing_fields: string[]
  expires_at: string
  admin_username: string
}

export default function CompleteApplicationPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const validateToken = useCallback(async () => {
    if (!token) {
      setError("No completion token provided")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/validate-completion-token.php?token=${token}`)
      const data = await response.json()

      if (data.success) {
        setTokenData(data.token_data)

        // Initialize form data with current values
        const initialFormData: Record<string, string> = {}
        data.token_data.missing_fields.forEach((field: string) => {
          initialFormData[field] = data.provider_data[field] || ""
        })
        setFormData(initialFormData)
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error("Error validating token:", error)
      setError("Failed to validate completion link")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    validateToken()
  }, [validateToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      // Validate required fields
      const missingRequiredFields = tokenData?.missing_fields.filter((field) => !formData[field]?.trim())
      if (missingRequiredFields && missingRequiredFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingRequiredFields.join(", ")}`)
      }

      const response = await fetch("/api/complete-application.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          updates: formData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.message)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete application"
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      license_number: "License Number",
      license_type: "License Type",
      license_state: "License State",
      specialty: "Medical Specialty",
      practice_name: "Practice Name",
      practice_address: "Practice Address",
      practice_phone: "Practice Phone",
      practice_email: "Practice Email",
      npi_number: "NPI Number",
      dea_number: "DEA Number",
      phone: "Phone Number",
    }
    return labels[field] || field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getFieldType = (field: string) => {
    if (field.includes("email")) return "email"
    if (field.includes("phone")) return "tel"
    if (field === "practice_address") return "textarea"
    return "text"
  }

  const formatExpiryTime = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (diff <= 0) return "Expired"
    return `${hours}h ${minutes}m remaining`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validating completion link...</p>
        </div>
      </div>
    )
  }

  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              This link may have expired, been used already, or is invalid. Please contact support if you need
              assistance.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Completed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for completing your provider application. Your information has been updated successfully.
            </p>
            <p className="text-sm text-gray-500">Our team will review your updated application and contact you soon.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Complete Your Provider Application</h1>
            <p className="text-blue-100">Please provide the missing information to complete your application</p>
          </div>

          {/* Provider Info */}
          <div className="bg-gray-50 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaUser className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{tokenData?.provider_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{tokenData?.provider_email}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <FaClock className="w-4 h-4 text-orange-500" />
                <span className="text-orange-600 font-medium">
                  {tokenData && formatExpiryTime(tokenData.expires_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Missing Information</h3>
              <p className="text-gray-600 text-sm mb-4">
                Please complete the following fields to proceed with your application:
              </p>
            </div>

            <div className="space-y-6">
              {tokenData?.missing_fields.map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-2">
                    {getFieldLabel(field)} <span className="text-red-500">*</span>
                  </label>
                  {getFieldType(field) === "textarea" ? (
                    <textarea
                      id={field}
                      value={formData[field] || ""}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter your ${getFieldLabel(field).toLowerCase()}`}
                      required
                    />
                  ) : (
                    <input
                      type={getFieldType(field)}
                      id={field}
                      value={formData[field] || ""}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter your ${getFieldLabel(field).toLowerCase()}`}
                      required
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting && <FaSpinner className="w-4 h-4 animate-spin" />}
                <span>{submitting ? "Submitting..." : "Complete Application"}</span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
            <p>
              Request sent by: <strong>{tokenData?.admin_username}</strong> | Need help? Contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}