"use client"

import { useState, useEffect, useCallback } from "react"
import { FaEnvelope, FaExclamationCircle, FaSpinner, FaClock, FaCheckCircle } from "react-icons/fa"
import { SendCompletionLinkModal } from "./send-completion-link-modal"

interface CompletionLink {
  id: number
  token: string
  provider_id: string
  provider_email: string
  missing_fields: string[]
  admin_username: string
  expires_at: string
  used_at: string | null
  created_at: string
}

interface ApplicationCompletionLinksProps {
  applicationId: string
  providerData: {
    id: number
    provider_id: string
    full_name: string
    email: string
  }
}

export function ApplicationCompletionLinks({ applicationId, providerData }: ApplicationCompletionLinksProps) {
  const [loading, setLoading] = useState(true)
  const [completionLinks, setCompletionLinks] = useState<CompletionLink[]>([])
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState("")

  const fetchCompletionLinks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/get-completion-links.php?application_id=${applicationId}`, {
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        setCompletionLinks(data.links || [])
      } else {
        setError(data.message || "Failed to load completion links")
      }
    } catch (error) {
      console.error("Error fetching completion links:", error)
      setError("An error occurred while loading completion links")
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    fetchCompletionLinks()
  }, [fetchCompletionLinks])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getTimeRemaining = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m remaining`
  }

  const hasActiveLink = completionLinks.some((link) => !link.used_at && new Date(link.expires_at) > new Date())

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-orange-50 to-orange-100 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaEnvelope className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-medium text-gray-900">Completion Links</h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={hasActiveLink}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title={hasActiveLink ? "An active completion link already exists" : "Send a new completion link"}
          >
            <FaExclamationCircle className="mr-1.5 h-4 w-4" />
            Send Completion Link
          </button>
        </div>
      </div>

      <div className="px-4 py-5 sm:p-6">
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-4">
            <FaSpinner className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : completionLinks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No completion links have been sent for this application.</p>
            <p className="text-sm mt-1">
              Send a completion link when the provider needs to submit missing information.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Missing Fields
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent By
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent On
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completionLinks.map((link) => {
                  const isActive = !link.used_at && new Date(link.expires_at) > new Date()
                  const isExpired = !link.used_at && new Date(link.expires_at) <= new Date()
                  const isCompleted = !!link.used_at

                  return (
                    <tr key={link.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isActive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FaClock className="mr-1 h-3 w-3" />
                            Active
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Expired
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCheckCircle className="mr-1 h-3 w-3" />
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {Array.isArray(link.missing_fields)
                            ? link.missing_fields.map((field) => field.replace(/_/g, " ")).join(", ")
                            : typeof link.missing_fields === "string"
                              ? JSON.parse(link.missing_fields)
                                  .map((field: string) => field.replace(/_/g, " "))
                                  .join(", ")
                              : "Unknown fields"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{link.admin_username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(link.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="text-sm text-orange-600 font-medium">
                            {getTimeRemaining(link.expires_at)}
                          </span>
                        ) : isCompleted ? (
                          <span className="text-sm text-gray-500">
                            Completed on {formatDate(link.used_at as string)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Expired</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SendCompletionLinkModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          fetchCompletionLinks() // Refresh the list after sending
        }}
        provider={providerData}
      />
    </div>
  )
}