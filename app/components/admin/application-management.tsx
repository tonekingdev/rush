"use client"

import { useState, useEffect, useCallback } from "react"
import { ApplicationList } from "./application-list"
import { ApplicationFilters } from "./application-filters"
import { ExportButton } from "./export-button"

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

interface IApplicationFilters {
  status: string
  search: string
  dateFrom: string
  dateTo: string
  completion: string
  licenseType: string
}

export function ApplicationManagement() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  })
  const [filters, setFilters] = useState<IApplicationFilters>({
    status: "",
    search: "",
    dateFrom: "",
    dateTo: "",
    completion: "",
    licenseType: "",
  })

  const applyFilters = useCallback(() => {
    let filtered = [...applications]

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((app) => app.status === filters.status)
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          (app.name?.toLowerCase() || "").includes(searchLower) ||
          (app.email?.toLowerCase() || "").includes(searchLower) ||
          (app.phone?.toLowerCase() || "").includes(searchLower) ||
          (app.license_number?.toLowerCase() || "").includes(searchLower) ||
          (app.provider_id?.toLowerCase() || "").includes(searchLower),
      )
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter((app) => new Date(app.created_at) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo)
      dateTo.setHours(23, 59, 59, 999) // Include the entire day
      filtered = filtered.filter((app) => new Date(app.created_at) <= dateTo)
    }

    // Completion filter
    if (filters.completion === "complete") {
      filtered = filtered.filter((app) => app.is_complete)
    } else if (filters.completion === "incomplete") {
      filtered = filtered.filter((app) => !app.is_complete)
    }

    // License type filter
    if (filters.licenseType) {
      filtered = filtered.filter((app) => app.license_type === filters.licenseType)
    }

    setFilteredApplications(filtered)

    // Update pagination
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      pages: Math.ceil(filtered.length / prev.limit),
      page: 1, // Reset to first page when filters change
    }))
  }, [applications, filters])

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/provider-applications.php", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApplications(data.applications)
          setPagination((prev) => ({
            ...prev,
            total: data.applications.length,
            pages: Math.ceil(data.applications.length / prev.limit),
          }))
        } else {
          setError(data.error || "Failed to fetch applications")
        }
      } else if (response.status === 401) {
        setError("Session expired. Please log in again.")
        // Redirect to login page
        window.location.href = "/admin"
      } else {
        setError("Failed to fetch applications")
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      setError("An error occurred while fetching applications")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    try {
      const response = await fetch("/api/provider-applications.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: applicationId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))

          // Show success message (you can implement toast notifications here)
          console.log(`Application status updated to ${newStatus}`)
        } else {
          setError(data.error || "Failed to update application status")
        }
      } else {
        setError("Failed to update application status")
      }
    } catch (error) {
      console.error("Error updating application status:", error)
      setError("An error occurred while updating application status")
    }
  }

  const handleApplicationUpdate = (updatedApplication: Application) => {
    setApplications((prev) => prev.map((app) => (app.id === updatedApplication.id ? updatedApplication : app)))
  }

  const handleApplicationDelete = (deletedApplication: Application) => {
    setApplications((prev) => prev.filter((app) => app.id !== deletedApplication.id))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleFiltersChange = (newFilters: IApplicationFilters) => {
    setFilters(newFilters)
  }

  // Get paginated applications
  const getPaginatedApplications = () => {
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    return filteredApplications.slice(startIndex, endIndex)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1586D6]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Error Loading Applications</h3>
              <p className="mt-1 text-sm">{error}</p>
              <div className="mt-3">
                <button
                  onClick={fetchApplications}
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Provider Applications ({filteredApplications.length})</h3>
            <p className="mt-1 text-sm text-gray-500">Manage and review healthcare provider applications</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <ExportButton type="applications" />
          </div>
        </div>

        {/* Summary Statistics */}
        {applications.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {applications.filter((app) => app.status === "pending").length}
              </div>
              <div className="text-sm text-blue-800">Pending Review</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter((app) => app.status === "under_review").length}
              </div>
              <div className="text-sm text-yellow-800">Under Review</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter((app) => app.status === "approved").length}
              </div>
              <div className="text-sm text-green-800">Approved</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {applications.filter((app) => app.status === "rejected").length}
              </div>
              <div className="text-sm text-red-800">Rejected</div>
            </div>
          </div>
        )}

        <ApplicationFilters filters={filters} onFiltersChange={handleFiltersChange} />

        <div className="mt-6">
          <ApplicationList
            applications={getPaginatedApplications()}
            pagination={pagination}
            onPageChange={handlePageChange}
            onStatusUpdate={handleStatusUpdate}
            onApplicationUpdate={handleApplicationUpdate}
            onApplicationDelete={handleApplicationDelete}
          />
        </div>
      </div>
    </div>
  )
}