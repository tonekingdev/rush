"use client"

import { useState } from "react"
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaExclamationCircle,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaUserPlus,
  FaSpinner,
} from "react-icons/fa"
import Link from "next/link"
import { SendCompletionLinkModal } from "./send-completion-link-modal"
import { EditApplicationModal } from "./edit-application-modal"
import { DeleteApplicationModal } from "./delete-application-modal"

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

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

interface ApplicationListProps {
  applications: Application[]
  pagination: PaginationData
  onPageChange: (page: number) => void
  onStatusUpdate: (applicationId: number, newStatus: string) => void
  onApplicationUpdate?: (updatedApplication: Application) => void
  onApplicationDelete?: (deletedApplication: Application) => void
}

export function ApplicationList({
  applications,
  pagination,
  onPageChange,
  onStatusUpdate,
  onApplicationUpdate,
  onApplicationDelete,
}: ApplicationListProps) {
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [creatingProviders, setCreatingProviders] = useState<Set<number>>(new Set())

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "under_review":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { page, pages } = pagination
    const pageNumbers = []

    // Always show first page
    pageNumbers.push(1)

    // Current page and surrounding pages
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      pageNumbers.push(i)
    }

    // Always show last page if there are more than 1 page
    if (pages > 1) {
      pageNumbers.push(pages)
    }

    // Add ellipsis indicators
    const result = []
    let prev = 0

    for (const num of pageNumbers) {
      if (prev && num - prev > 1) {
        result.push(-1) // -1 represents ellipsis
      }
      result.push(num)
      prev = num
    }

    return result
  }

  const handleEditClick = (application: Application) => {
    setSelectedApplication(application)
    setShowEditModal(true)
  }

  const handleDeleteClick = (application: Application) => {
    setSelectedApplication(application)
    setShowDeleteModal(true)
  }

  const handleEditSuccess = (updatedApplication: Application) => {
    setShowEditModal(false)
    setSelectedApplication(null)
    if (onApplicationUpdate) {
      onApplicationUpdate(updatedApplication)
    }
  }

  const handleDeleteSuccess = (deletedApplication: Application) => {
    setShowDeleteModal(false)
    setSelectedApplication(null)
    if (onApplicationDelete) {
      onApplicationDelete(deletedApplication)
    }
  }

  const handleCreateProvider = async (application: Application) => {
    setCreatingProviders((prev) => new Set(prev).add(application.id))

    try {
      const response = await fetch("/api/create-provider.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          application_id: application.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create provider")
      }

      const data = await response.json()

      if (data.success) {
        if (data.already_exists) {
          alert(`Provider already exists in the system (ID: ${data.provider_id})`)
        } else {
          alert(`Provider created successfully! Provider ID: ${data.provider_code}`)
        }
      } else {
        throw new Error(data.error || "Failed to create provider")
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Failed to create provider"}`)
    } finally {
      setCreatingProviders((prev) => {
        const newSet = new Set(prev)
        newSet.delete(application.id)
        return newSet
      })
    }
  }

  const handleStatusUpdateWithProvider = async (applicationId: number, newStatus: string) => {
    // First update the status
    await onStatusUpdate(applicationId, newStatus)

    // If status is approved, automatically create provider
    if (newStatus === "approved") {
      const application = applications.find((app) => app.id === applicationId)
      if (application) {
        setTimeout(() => {
          handleCreateProvider(application)
        }, 500) // Small delay to let the status update complete
      }
    }
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <p className="text-lg font-medium">No applications found</p>
          <p className="text-sm">Try adjusting your filters or search criteria.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Horizontal scrollable container */}
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                License Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                Completion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Applied
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                  <div>
                    <Link
                      href={`/admin/dashboard/applications/${application.id}`}
                      className="text-sm font-medium text-[#1586D6] hover:text-blue-700 hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = `/admin/dashboard/applications/${application.id}`
                      }}
                    >
                      {application.name}
                    </Link>
                    <div className="text-xs text-gray-400">ID: {application.provider_id}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap min-w-[250px]">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <FaEnvelope className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{application.email}</span>
                    </div>
                    {application.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FaPhone className="h-3 w-3 mr-2 text-gray-400 flex-shrink-0" />
                        <span>{application.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap min-w-[180px]">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{application.license_type || "Not specified"}</div>
                    {application.license_number && (
                      <div className="text-xs text-gray-500">#{application.license_number}</div>
                    )}
                    {application.years_experience && (
                      <div className="text-xs text-gray-500">{application.years_experience} years exp.</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                  <div className="flex items-center">
                    {application.is_complete ? (
                      <div className="flex items-center text-green-600">
                        <FaCheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-sm font-medium">Complete</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-orange-600">
                        <FaExclamationCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-sm font-medium">{application.missing_fields.length} missing</span>
                      </div>
                    )}
                  </div>
                  {!application.is_complete && application.missing_fields.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {application.missing_fields.slice(0, 2).join(", ")}
                      {application.missing_fields.length > 2 && "..."}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                  <div className="flex flex-col space-y-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        application.status,
                      )}`}
                    >
                      {formatStatus(application.status)}
                    </span>
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusUpdateWithProvider(application.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded-md px-2 py-1 w-full"
                    >
                      <option value="pending">{formatStatus("pending")}</option>
                      <option value="under_review">{formatStatus("under_review")}</option>
                      <option value="approved">{formatStatus("approved")}</option>
                      <option value="rejected">{formatStatus("rejected")}</option>
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                  {formatDate(application.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium min-w-[180px]">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/dashboard/applications/${application.id}`}
                      className="text-[#1586D6] hover:text-blue-700"
                      title="View Details"
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = `/admin/dashboard/applications/${application.id}`
                      }}
                    >
                      <FaEye className="h-4 w-4" />
                    </Link>
                    {!application.is_complete && (
                      <button
                        onClick={() => {
                          setSelectedApplication(application)
                          setShowCompletionModal(true)
                        }}
                        className="text-orange-600 hover:text-orange-700"
                        title="Send Completion Link"
                      >
                        <FaExclamationCircle className="h-4 w-4" />
                      </button>
                    )}
                    {application.status === "approved" && (
                      <button
                        onClick={() => handleCreateProvider(application)}
                        disabled={creatingProviders.has(application.id)}
                        className="text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Create Provider Account"
                      >
                        {creatingProviders.has(application.id) ? (
                          <FaSpinner className="h-4 w-4 animate-spin" />
                        ) : (
                          <FaUserPlus className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleEditClick(application)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit Application"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(application)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete Application"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                pagination.page === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                pagination.page === pagination.pages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
                <span className="font-medium">{pagination.total}</span> applications
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    pagination.page === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <FaChevronLeft className="h-3 w-3" aria-hidden="true" />
                </button>

                {getPageNumbers().map((pageNum, index) =>
                  pageNum === -1 ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === pagination.page
                          ? "bg-[#1586D6] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1586D6]"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}

                <button
                  onClick={() => onPageChange(Math.min(pagination.pages, pagination.page + 1))}
                  disabled={pagination.page === pagination.pages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    pagination.page === pagination.pages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <FaChevronRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SendCompletionLinkModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false)
          setSelectedApplication(null)
        }}
        provider={
          selectedApplication
            ? {
                id: selectedApplication.id,
                provider_id: selectedApplication.provider_id,
                full_name: selectedApplication.name,
                email: selectedApplication.email,
                application_id: selectedApplication.id,
              }
            : null
        }
      />

      <EditApplicationModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedApplication(null)
        }}
        application={selectedApplication}
        onSuccess={handleEditSuccess}
      />

      <DeleteApplicationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedApplication(null)
        }}
        application={selectedApplication}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}