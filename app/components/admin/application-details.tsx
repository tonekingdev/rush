"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaUsers,
  FaFileContract,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaIdCard,
  FaUserPlus,
  FaSpinner,
} from "react-icons/fa"
import Image from "next/image"

interface ApplicationData {
  id: number
  full_name: string
  email: string
  phone: string
  address: string
  drivers_license_image: string
  bls_cpr_image: string
  tb_test_image: string
  wound_care_image: string
  has_bls_cpr: number
  has_wound_care_experience: number
  is_cna_hha_caregiver: number
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
  work_history: string | WorkHistoryItem[]
  references_data: string | ReferenceItem[]
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
  provider_id?: string
}

interface WorkHistoryItem {
  employerName: string
  employerAddress: string
  startDate: string
  endDate: string
  workDuties: string
}

interface ReferenceItem {
  referenceName: string
  referenceContact: string
  professionalRelationship: string
}

interface ApplicationDetailsProps {
  applicationId: string
}

export function ApplicationDetails({ applicationId }: ApplicationDetailsProps) {
  const [application, setApplication] = useState<ApplicationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("personal")
  const [isCreatingProvider, setIsCreatingProvider] = useState(false)
  const [providerCreationMessage, setProviderCreationMessage] = useState<string | null>(null)

  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/provider-applications.php?id=${applicationId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch application details")
      }

      const data = await response.json()

      if (data.success) {
        setApplication(data.application)
      } else {
        setError(data.error || "Failed to load application")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    fetchApplicationDetails()
  }, [fetchApplicationDetails])

  const createProvider = async () => {
    if (!application) return

    setIsCreatingProvider(true)
    setProviderCreationMessage(null)

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
          setProviderCreationMessage(`Provider already exists in the system (ID: ${data.provider_id})`)
        } else {
          setProviderCreationMessage(
            `Provider created successfully! Provider ID: ${data.provider_code} (Database ID: ${data.provider_id})`,
          )
        }
      } else {
        throw new Error(data.error || "Failed to create provider")
      }
    } catch (err) {
      setProviderCreationMessage(`Error: ${err instanceof Error ? err.message : "Failed to create provider"}`)
    } finally {
      setIsCreatingProvider(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await fetch("/api/provider-applications.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: applicationId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      const data = await response.json()

      if (data.success && application) {
        setApplication({ ...application, status: newStatus })

        // If status is changed to approved, automatically create provider
        if (newStatus === "approved") {
          setTimeout(() => {
            createProvider()
          }, 500) // Small delay to let the status update complete
        }
      } else {
        throw new Error(data.error || "Failed to update status")
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

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

  const parseWorkHistory = (workHistoryData: string | WorkHistoryItem[]): WorkHistoryItem[] => {
    console.log("Raw work_history data:", workHistoryData)
    console.log("Type:", typeof workHistoryData)

    // If it's already an array, return it
    if (Array.isArray(workHistoryData)) {
      console.log("Work history is already an array:", workHistoryData)
      return workHistoryData
    }

    // If it's a string, try to parse it
    if (typeof workHistoryData === "string") {
      if (!workHistoryData || workHistoryData.trim() === "") {
        console.log("Work history string is empty")
        return []
      }

      try {
        const parsed = JSON.parse(workHistoryData)
        console.log("Successfully parsed work history:", parsed)
        return Array.isArray(parsed) ? parsed : []
      } catch (error) {
        console.error("Failed to parse work history JSON:", error)
        console.log("Raw data that failed to parse:", workHistoryData)
        return []
      }
    }

    console.log("Work history data is neither string nor array:", workHistoryData)
    return []
  }

  const parseReferences = (referencesData: string | ReferenceItem[]): ReferenceItem[] => {
    console.log("Raw references_data:", referencesData)
    console.log("Type:", typeof referencesData)

    // If it's already an array, return it
    if (Array.isArray(referencesData)) {
      console.log("References is already an array:", referencesData)
      return referencesData
    }

    // If it's a string, try to parse it
    if (typeof referencesData === "string") {
      if (!referencesData || referencesData.trim() === "") {
        console.log("References string is empty")
        return []
      }

      try {
        const parsed = JSON.parse(referencesData)
        console.log("Successfully parsed references:", parsed)
        return Array.isArray(parsed) ? parsed : []
      } catch (error) {
        console.error("Failed to parse references JSON:", error)
        console.log("Raw data that failed to parse:", referencesData)
        return []
      }
    }

    console.log("References data is neither string nor array:", referencesData)
    return []
  }

  // Helper function to ensure correct file URL
  const getFileUrl = (filePath: string) => {
    if (!filePath) return "/placeholder.svg?height=300&width=400"

    // If it's a full URL (starts with http:// or https://), use as-is
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath
    }

    // Clean the path by removing leading slashes and normalizing
    const cleanPath = filePath.trim().replace(/^\/+/, "")

    // If the path is empty after cleaning, return placeholder
    if (!cleanPath) return "/placeholder.svg?height=300&width=400"

    // If it already starts with 'uploads/', just add leading slash
    if (cleanPath.startsWith("uploads/")) {
      return `/${cleanPath}`
    }

    // Otherwise, prepend /uploads/
    return `/uploads/${cleanPath}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1586D6]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
      </div>
    )
  }

  const workHistory = parseWorkHistory(application.work_history)
  const references = parseReferences(application.references_data)

  const tabs = [
    { id: "personal", label: "Personal Info", icon: FaUser },
    { id: "credentials", label: "Credentials", icon: FaGraduationCap },
    { id: "work", label: "Work History", icon: FaBriefcase },
    { id: "references", label: "References", icon: FaUsers },
    { id: "forms", label: "Forms & Agreements", icon: FaFileContract },
  ]

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{application.full_name}</h1>
            <p className="text-sm text-gray-500">Application ID: #{application.id}</p>
            <p className="text-sm text-gray-500">Submitted: {formatDate(application.created_at)}</p>
            {application.provider_id && <p className="text-sm text-gray-500">Provider ID: {application.provider_id}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}
            >
              {formatStatus(application.status)}
            </span>
            <select
              value={application.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Provider Creation Section */}
        {application.status === "approved" && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800">Provider Account</h3>
                <p className="text-sm text-green-600">
                  This application has been approved. Create a provider account to complete the onboarding process.
                </p>
              </div>
              <button
                onClick={createProvider}
                disabled={isCreatingProvider}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingProvider ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="h-4 w-4 mr-2" />
                    Create Provider Account
                  </>
                )}
              </button>
            </div>

            {/* Provider Creation Message */}
            {providerCreationMessage && (
              <div className="mt-3 p-3 bg-white border border-green-300 rounded-md">
                <p
                  className={`text-sm ${
                    providerCreationMessage.startsWith("Error") ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {providerCreationMessage}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-[#1586D6] text-[#1586D6]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "personal" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Image</h3>
                <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mx-auto">
                  {application.profile_image ? (
                    <Image
                      src={getFileUrl(application.profile_image) || "/placeholder.svg?height=128&width=128"}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <FaUser className="h-12 w-12" />
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{application.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{application.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 md:col-span-2">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">{application.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCheckCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">CNA/HHA/Caregiver Status</p>
                      <p className="text-sm text-gray-600">{application.is_cna_hha_caregiver ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver's License Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Driver&apos;s License</h3>
              <div className="flex items-center space-x-4">
                <FaIdCard className="h-8 w-8 text-green-500" />
                <div className="flex-1">
                  {application.drivers_license_image ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Driver&apos;s License Uploaded</p>
                      <div className="mt-2">
                        <Image
                          src={getFileUrl(application.drivers_license_image) || "/placeholder.svg"}
                          alt="Driver's License"
                          width={300}
                          height={200}
                          className="border rounded-md max-w-full h-auto"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-red-600">Driver&apos;s License Not Provided</p>
                      <p className="text-xs text-gray-500">Required document missing</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "credentials" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-900">License Type</p>
                  <p className="text-sm text-gray-600 mt-1">{application.license_type || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">License Number</p>
                  <p className="text-sm text-gray-600 mt-1">{application.license_number || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Years of Experience</p>
                  <p className="text-sm text-gray-600 mt-1">{application.years_experience} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Malpractice Provider</p>
                  <p className="text-sm text-gray-600 mt-1">{application.malpractice_provider || "Not provided"}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Work Ethic</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">{application.work_ethic}</p>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Education</h4>
              <p className="text-sm text-gray-600">{application.education}</p>
              {application.education_image && (
                <div className="mt-2">
                  <Image
                    src={getFileUrl(application.education_image) || "/placeholder.svg"}
                    alt="Education Document"
                    width={400}
                    height={300}
                    className="border rounded-md max-w-full h-auto"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              )}
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Licenses & Certifications</h4>
              <p className="text-sm text-gray-600">{application.licenses}</p>
              {application.license_image && (
                <div className="mt-2">
                  <Image
                    src={getFileUrl(application.license_image) || "/placeholder.svg"}
                    alt="License Document"
                    width={400}
                    height={300}
                    className="border rounded-md max-w-full h-auto"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              )}
            </div>

            {/* BLS/CPR Certification */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">BLS/CPR Certification</h4>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  {application.bls_cpr_image ? (
                    <div>
                      <p className="text-sm font-medium text-green-600">BLS/CPR Certificate Uploaded</p>
                      <div className="mt-2">
                        <Image
                          src={getFileUrl(application.bls_cpr_image) || "/placeholder.svg"}
                          alt="BLS/CPR Certificate"
                          width={300}
                          height={200}
                          className="border rounded-md max-w-full h-auto"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-red-600">BLS/CPR Certificate Not Provided</p>
                      <p className="text-xs text-gray-500">Required certification missing</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TB Test Results */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">TB Test Results (within 12 months)</h4>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  {application.tb_test_image ? (
                    <div>
                      <p className="text-sm font-medium text-green-600">TB Test Results Uploaded</p>
                      <div className="mt-2">
                        <Image
                          src={getFileUrl(application.tb_test_image) || "/placeholder.svg"}
                          alt="TB Test Results"
                          width={300}
                          height={200}
                          className="border rounded-md max-w-full h-auto"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-red-600">TB Test Results Not Provided</p>
                      <p className="text-xs text-gray-500">Required document missing</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Wound Care Certification */}
            {application.has_wound_care_experience ? (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Wound Care Certification</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    {application.wound_care_image ? (
                      <div>
                        <p className="text-sm font-medium text-green-600">Wound Care Certificate Uploaded</p>
                        <div className="mt-2">
                          <Image
                            src={getFileUrl(application.wound_care_image) || "/placeholder.svg"}
                            alt="Wound Care Certificate"
                            width={300}
                            height={200}
                            className="border rounded-md max-w-full h-auto"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-red-600">Wound Care Certificate Not Provided</p>
                        <p className="text-xs text-gray-500">Required for wound care experience</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Wound Care Certification</h4>
                <p className="text-sm text-gray-500">Not applicable - no wound care experience indicated</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "work" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Work History</h3>

            {workHistory.length > 0 ? (
              <div className="space-y-4">
                {workHistory.map((work: WorkHistoryItem, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Employer</p>
                        <p className="text-sm text-gray-600">{work.employerName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Address</p>
                        <p className="text-sm text-gray-600">{work.employerAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Start Date</p>
                        <p className="text-sm text-gray-600">
                          {work.startDate ? formatDate(work.startDate) : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">End Date</p>
                        <p className="text-sm text-gray-600">{work.endDate ? formatDate(work.endDate) : "Current"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Work Duties</p>
                      <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded-md">{work.workDuties}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500">No work history provided</p>
                {/* Show raw data if parsing failed */}
                {application.work_history && (
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h4 className="font-medium text-yellow-800 mb-2">Raw Data (for debugging):</h4>
                    <pre className="text-xs text-yellow-700 whitespace-pre-wrap">
                      {typeof application.work_history === "string"
                        ? application.work_history
                        : JSON.stringify(application.work_history, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "references" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Professional References</h3>

            {references.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {references.map((ref: ReferenceItem, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Reference {index + 1}</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Name</p>
                        <p className="text-sm text-gray-600">{ref.referenceName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Contact</p>
                        <p className="text-sm text-gray-600">{ref.referenceContact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Relationship</p>
                        <p className="text-sm text-gray-600">{ref.professionalRelationship}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500">No references provided</p>
                {/* Show raw data if parsing failed */}
                {application.references_data && (
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h4 className="font-medium text-yellow-800 mb-2">Raw Data (for debugging):</h4>
                    <pre className="text-xs text-yellow-700 whitespace-pre-wrap">
                      {typeof application.references_data === "string"
                        ? application.references_data
                        : JSON.stringify(application.references_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "forms" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Forms & Agreements</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Liability Waiver</h4>
                <div className="flex items-center space-x-2 mb-2">
                  {application.liability_signed ? (
                    <FaCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FaTimesCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {application.liability_signed ? "Signed" : "Not signed"}
                  </span>
                </div>
                {application.liability_pdf && (
                  <a
                    href={getFileUrl(application.liability_pdf)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <FaDownload className="h-4 w-4" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Background Check</h4>
                <div className="flex items-center space-x-2">
                  {application.background_acknowledged ? (
                    <FaCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FaTimesCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {application.background_acknowledged ? "Acknowledged" : "Not acknowledged"}
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Malpractice Insurance</h4>
                <div className="flex items-center space-x-2">
                  {application.malpractice_acknowledged ? (
                    <FaCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FaTimesCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {application.malpractice_acknowledged ? "Acknowledged" : "Not acknowledged"}
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Exclusion Screening</h4>
                <div className="flex items-center space-x-2 mb-2">
                  {application.exclusion_screening_signed ? (
                    <FaCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FaTimesCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {application.exclusion_screening_signed ? "Signed" : "Not signed"}
                  </span>
                </div>
                {application.exclusion_screening_date && (
                  <p className="text-xs text-gray-500">Signed: {formatDate(application.exclusion_screening_date)}</p>
                )}
                {application.exclusion_pdf && (
                  <a
                    href={getFileUrl(application.exclusion_pdf)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                  >
                    <FaDownload className="h-4 w-4" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Drug & Alcohol Policy</h4>
                <div className="flex items-center space-x-2 mb-2">
                  {application.drug_alcohol_signed ? (
                    <FaCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FaTimesCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {application.drug_alcohol_signed ? "Signed" : "Not signed"}
                  </span>
                </div>
                {application.drug_alcohol_date && (
                  <p className="text-xs text-gray-500">Signed: {formatDate(application.drug_alcohol_date)}</p>
                )}
                {application.drug_alcohol_pdf && (
                  <a
                    href={getFileUrl(application.drug_alcohol_pdf)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                  >
                    <FaDownload className="h-4 w-4" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

              {/* NEW: Non-Compete Clause */}
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Non-Compete Clause</h4>
                <div className="flex items-center space-x-2 mb-2">
                  {application.non_compete_signed ? (
                    <FaCheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <FaTimesCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {application.non_compete_signed ? "Signed" : "Not signed"}
                  </span>
                </div>
                {application.non_compete_date && (
                  <p className="text-xs text-gray-500">Signed: {formatDate(application.non_compete_date)}</p>
                )}
                {application.non_compete_pdf && (
                  <a
                    href={getFileUrl(application.non_compete_pdf)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                  >
                    <FaDownload className="h-4 w-4" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}