"use client"

import { useState, useEffect, useCallback } from "react"
import { FaEye, FaCheck, FaTimes, FaSearch } from "react-icons/fa"

interface PatientSurvey {
  id: number
  full_name: string
  email: string
  phone_number: string
  date_of_birth: string
  zip_code: string
  interest_reasons: string
  anticipated_services: string
  medical_conditions: string
  has_pcp: boolean
  taking_medications: boolean
  has_insurance: boolean
  insurance_provider: string
  interested_in_payment_plans: boolean
  accessibility_needs: string
  additional_info: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: number
  reviewed_by_name?: string
}

export function PatientSurveyManagement() {
  const [surveys, setSurveys] = useState<PatientSurvey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedSurvey, setSelectedSurvey] = useState<PatientSurvey | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/patient-surveys.php?${params}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSurveys(data.surveys)
          setPagination(data.pagination)
        } else {
          setError(data.message || "Failed to fetch surveys")
        }
      } else {
        setError("Failed to fetch surveys")
      }
    } catch (error) {
      console.error("Error fetching surveys:", error)
      setError("An error occurred while fetching surveys")
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => {
    fetchSurveys()
  }, [filters, pagination.page, fetchSurveys])

  const handleStatusUpdate = async (surveyId: number, status: "approved" | "rejected") => {
    try {
      const response = await fetch("/api/patient-surveys.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: surveyId,
          status: status,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          fetchSurveys() // Refresh the list
          setShowModal(false)
          setSelectedSurvey(null)
        } else {
          setError(data.message || "Failed to update survey")
        }
      } else {
        setError("Failed to update survey")
      }
    } catch (error) {
      console.error("Error updating survey:", error)
      setError("An error occurred while updating survey")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1586D6]"></div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>}

        {/* Surveys Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{survey.full_name}</div>
                      <div className="text-sm text-gray-500">DOB: {survey.date_of_birth}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{survey.email}</div>
                    <div className="text-sm text-gray-500">{survey.phone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(survey.status)}`}
                    >
                      {survey.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(survey.submitted_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSurvey(survey)
                          setShowModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title="View Details"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      {survey.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(survey.id, "approved")}
                            className="text-green-600 hover:text-green-700"
                            title="Approve"
                          >
                            <FaCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(survey.id, "rejected")}
                            className="text-red-600 hover:text-red-700"
                            title="Reject"
                          >
                            <FaTimes className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Survey Details Modal */}
      {showModal && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Patient Survey Details</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedSurvey.full_name}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedSurvey.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {selectedSurvey.phone_number}
                    </div>
                    <div>
                      <strong>Date of Birth:</strong> {selectedSurvey.date_of_birth}
                    </div>
                    <div>
                      <strong>Zip Code:</strong> {selectedSurvey.zip_code}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Medical Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Has PCP:</strong> {selectedSurvey.has_pcp ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Taking Medications:</strong> {selectedSurvey.taking_medications ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Has Insurance:</strong> {selectedSurvey.has_insurance ? "Yes" : "No"}
                    </div>
                    {selectedSurvey.insurance_provider && (
                      <div>
                        <strong>Insurance Provider:</strong> {selectedSurvey.insurance_provider}
                      </div>
                    )}
                    <div>
                      <strong>Interested in Payment Plans:</strong>{" "}
                      {selectedSurvey.interested_in_payment_plans ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                  <div className="space-y-3 text-sm">
                    {selectedSurvey.interest_reasons && (
                      <div>
                        <strong>Interest Reasons:</strong>
                        <p className="mt-1 text-gray-600">{selectedSurvey.interest_reasons}</p>
                      </div>
                    )}
                    {selectedSurvey.anticipated_services && (
                      <div>
                        <strong>Anticipated Services:</strong>
                        <p className="mt-1 text-gray-600">{selectedSurvey.anticipated_services}</p>
                      </div>
                    )}
                    {selectedSurvey.medical_conditions && (
                      <div>
                        <strong>Medical Conditions:</strong>
                        <p className="mt-1 text-gray-600">{selectedSurvey.medical_conditions}</p>
                      </div>
                    )}
                    {selectedSurvey.accessibility_needs && (
                      <div>
                        <strong>Accessibility Needs:</strong>
                        <p className="mt-1 text-gray-600">{selectedSurvey.accessibility_needs}</p>
                      </div>
                    )}
                    {selectedSurvey.additional_info && (
                      <div>
                        <strong>Additional Information:</strong>
                        <p className="mt-1 text-gray-600">{selectedSurvey.additional_info}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedSurvey.status === "pending" && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedSurvey.id, "rejected")}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedSurvey.id, "approved")}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve & Create Patient
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}