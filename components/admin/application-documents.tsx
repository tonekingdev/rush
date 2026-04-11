"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FaDownload,
  FaEye,
  FaImage,
  FaFilePdf,
  FaExclamationTriangle,
  FaCheckCircle,
  FaIdCard,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa"
import { SlideInNotification } from "@/app/components/SlideInNotification"

interface ProviderApplication {
  id: number
  full_name: string
  email: string
  phone: string
  address: string | null
  drivers_license_image: string | null
  bls_cpr_image: string | null
  tb_test_image: string | null
  wound_care_image: string | null
  has_bls_cpr: number
  has_wound_care_experience: number
  is_cna_hha_caregiver: number
  work_ethic: string | null
  education: string | null
  licenses: string | null
  years_experience: number | null
  license_type: string | null
  license_number: string | null
  malpractice_provider: string | null
  profile_image: string | null
  education_image: string | null
  license_image: string | null
  work_history: string | null
  references_data: string | null
  liability_signed: number
  liability_signature: string | null
  background_acknowledged: number
  malpractice_acknowledged: number
  exclusion_screening_signed: number
  exclusion_screening_signature: string | null
  exclusion_screening_date: string | null
  additional_data: string | null
  status: string
  created_at: string
  drug_alcohol_signed: number
  drug_alcohol_signature: string | null
  drug_alcohol_date: string | null
  drug_alcohol_pdf: string | null
  liability_pdf: string | null
  exclusion_pdf: string | null
  // NEW: Non-Compete Clause fields
  non_compete_signed: number
  non_compete_signature: string | null
  non_compete_date: string | null
  non_compete_pdf: string | null
}

interface ApplicationDocumentsProps {
  applicationId: string
}

interface NotificationMessage {
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  id: string
}

export default function ApplicationDocuments({ applicationId }: ApplicationDocumentsProps) {
  const [application, setApplication] = useState<ProviderApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationMessage[]>([])
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set())

  const fetchApplicationData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/provider-applications.php?id=${applicationId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch application data")
      }

      const data = await response.json()
      if (data.success) {
        setApplication(data.application)
      } else {
        throw new Error(data.error || "Failed to load application")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load application data")
      console.error("Error fetching application:", err)
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    fetchApplicationData()
  }, [fetchApplicationData])

  // Notification management
  const addNotification = (notification: Omit<NotificationMessage, "id">) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id }
    setNotifications((prev) => [...prev, newNotification])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getDocumentStatus = (documentField: keyof ProviderApplication) => {
    const fieldValue = application?.[documentField]
    return fieldValue && typeof fieldValue === "string" && fieldValue.trim() !== "" ? "uploaded" : "missing"
  }

  const getFileIcon = (type: string) => {
    if (type.includes("image")) {
      return <FaImage className="h-5 w-5 text-blue-500" />
    } else if (type.includes("pdf")) {
      return <FaFilePdf className="h-5 w-5 text-red-500" />
    } else if (type.includes("license")) {
      return <FaIdCard className="h-5 w-5 text-green-500" />
    } else {
      return <FaImage className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploaded":
        return "bg-green-100 text-green-800"
      case "missing":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Helper function to ensure correct file URL
  const getFileUrl = (filePath: string) => {
    if (!filePath) return ""

    // If it's a full URL (starts with http:// or https://), use as-is
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath
    }

    // Clean the path by removing the full server path and extracting just the filename
    let cleanPath = filePath.trim()

    // Remove the full server path if it exists
    if (cleanPath.includes("/public_html/uploads/")) {
      // Extract everything after "/public_html/uploads/"
      cleanPath = cleanPath.split("/public_html/uploads/")[1]
    } else if (cleanPath.includes("uploads/")) {
      // Extract everything after "uploads/"
      cleanPath = cleanPath.split("uploads/")[1]
    } else {
      // Remove any leading slashes
      cleanPath = cleanPath.replace(/^\/+/, "")
    }

    // If the path is empty after cleaning, return empty
    if (!cleanPath) return ""

    // Construct the correct web URL
    return `https://rushhealthc.com/uploads/${cleanPath}`
  }

  const handleDownload = async (documentUrl: string, fileName: string) => {
    const actionId = `download-${fileName}`
    setProcessingActions((prev) => new Set(prev).add(actionId))

    try {
      const fullUrl = getFileUrl(documentUrl)

      if (!fullUrl) {
        throw new Error("Invalid file path")
      }

      // Check if file exists before attempting download
      const response = await fetch(fullUrl, { method: "HEAD" })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("File not found on server")
        } else {
          throw new Error(`Server error: ${response.status}`)
        }
      }

      const link = window.document.createElement("a")
      link.href = fullUrl
      link.download = fileName
      link.target = "_blank"
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)

      addNotification({
        type: "success",
        title: "Download Started",
        message: `${fileName} download has been initiated successfully.`,
      })
    } catch (error) {
      console.error("Download error:", error)
      addNotification({
        type: "error",
        title: "Download Failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to download the document. Please try again or contact support.",
      })
    } finally {
      setProcessingActions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(actionId)
        return newSet
      })
    }
  }

  const handlePreview = async (documentUrl: string, documentName: string) => {
    const actionId = `preview-${documentName}`
    setProcessingActions((prev) => new Set(prev).add(actionId))

    try {
      const fullUrl = getFileUrl(documentUrl)
      console.log("Original document URL:", documentUrl)
      console.log("Constructed full URL:", fullUrl)

      if (!fullUrl) {
        throw new Error("Invalid file path")
      }

      // Check if file exists before attempting preview
      try {
        const response = await fetch(fullUrl, { method: "HEAD" })
        console.log("File check response status:", response.status)
        console.log("File check response headers:", response.headers)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Document not found on server")
          } else if (response.status === 403) {
            throw new Error("Access denied to document")
          } else {
            throw new Error(`Server error: ${response.status}`)
          }
        }
      } catch (fetchError) {
        console.error("File check failed:", fetchError)
        // If HEAD request fails, try direct navigation anyway
        console.log("HEAD request failed, attempting direct navigation...")
      }

      console.log("Opening document URL:", fullUrl)

      // Try to open in new tab/window with specific window features
      const newWindow = window.open(
        fullUrl,
        "_blank",
        "noopener,noreferrer,width=1200,height=800,scrollbars=yes,resizable=yes",
      )

      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        console.log("Popup blocked, trying alternative method...")

        // Alternative method: create a temporary link and click it
        const link = document.createElement("a")
        link.href = fullUrl
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        addNotification({
          type: "warning",
          title: "Popup Blocked",
          message: "Your browser blocked the popup. We've opened the document in a new tab instead.",
        })
        return
      }

      // Check if the new window navigated to the correct URL after a short delay
      setTimeout(() => {
        try {
          if (newWindow && !newWindow.closed) {
            console.log("New window location:", newWindow.location.href)
          }
        } catch {
          // Cross-origin restrictions prevent access to location
          console.log("Cannot access new window location due to cross-origin restrictions")
        }
      }, 1000)

      addNotification({
        type: "success",
        title: "Document Opened",
        message: `${documentName} has been opened in a new tab.`,
      })
    } catch (error) {
      console.error("Preview error:", error)
      addNotification({
        type: "error",
        title: "Preview Failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to preview the document. Please try downloading it instead or contact support.",
      })
    } finally {
      setProcessingActions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(actionId)
        return newSet
      })
    }
  }

  interface DocumentInfo {
    name: string
    field: keyof ProviderApplication
    type: string
    required: boolean
  }

  const documents: DocumentInfo[] = [
    {
      name: "Profile Image",
      field: "profile_image",
      type: "image",
      required: true,
    },
    {
      name: "Driver's License",
      field: "drivers_license_image",
      type: "license",
      required: true,
    },
    {
      name: "BLS/CPR Certification",
      field: "bls_cpr_image",
      type: "image",
      required: true,
    },
    {
      name: "TB Test Results (within 12 months)",
      field: "tb_test_image",
      type: "image",
      required: true,
    },
    {
      name: "Wound Care Certification",
      field: "wound_care_image",
      type: "image",
      required: false, // Conditional based on experience
    },
    {
      name: "Education Document",
      field: "education_image",
      type: "image",
      required: true,
    },
    {
      name: "Professional License Document",
      field: "license_image",
      type: "image",
      required: true,
    },
    {
      name: "Drug & Alcohol Policy PDF",
      field: "drug_alcohol_pdf",
      type: "pdf",
      required: true,
    },
    {
      name: "Liability Agreement PDF",
      field: "liability_pdf",
      type: "pdf",
      required: true,
    },
    {
      name: "Exclusion Screening PDF",
      field: "exclusion_pdf",
      type: "pdf",
      required: true,
    },
    // NEW: Non-Compete Clause PDF
    {
      name: "Non-Compete Clause PDF",
      field: "non_compete_pdf",
      type: "pdf",
      required: true,
    },
  ]

  // Notification Component
  const NotificationToast = ({ notification }: { notification: NotificationMessage }) => {
    const getNotificationStyles = (type: string) => {
      switch (type) {
        case "success":
          return "bg-green-50 border-green-200 text-green-800"
        case "error":
          return "bg-red-50 border-red-200 text-red-800"
        case "warning":
          return "bg-yellow-50 border-yellow-200 text-yellow-800"
        case "info":
          return "bg-blue-50 border-blue-200 text-blue-800"
        default:
          return "bg-gray-50 border-gray-200 text-gray-800"
      }
    }

    const getNotificationIcon = (type: string) => {
      switch (type) {
        case "success":
          return <FaCheckCircle className="h-5 w-5 text-green-500" />
        case "error":
          return <FaExclamationTriangle className="h-5 w-5 text-red-500" />
        case "warning":
          return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
        case "info":
          return <FaInfoCircle className="h-5 w-5 text-blue-500" />
        default:
          return <FaInfoCircle className="h-5 w-5 text-gray-500" />
      }
    }

    return (
      <SlideInNotification>
        <div className={`border rounded-lg p-4 shadow-lg ${getNotificationStyles(notification.type)}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              <p className="text-sm mt-1">{notification.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => removeNotification(notification.id)}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </SlideInNotification>
    )
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Notification Container */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <NotificationToast key={notification.id} notification={notification} />
          ))}
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium">Error Loading Documents</h4>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {documents.map((document) => {
          const status = getDocumentStatus(document.field)
          const documentUrl = application?.[document.field]
          const isProcessingPreview = processingActions.has(`preview-${document.name}`)
          const isProcessingDownload = processingActions.has(`download-${document.name}`)

          return (
            <div
              key={document.field}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">{getFileIcon(document.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{document.name}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {document.required && <span className="text-red-500">Required</span>}
                    {documentUrl && (
                      <span className="text-green-600">
                        <FaCheckCircle className="inline h-3 w-3 mr-1" />
                        Available
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {status === "uploaded" && documentUrl && typeof documentUrl === "string" && (
                  <>
                    <button
                      onClick={() => handlePreview(documentUrl, document.name)}
                      disabled={isProcessingPreview}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Preview document"
                    >
                      {isProcessingPreview ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <FaEye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload(documentUrl, document.name)}
                      disabled={isProcessingDownload}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download document"
                    >
                      {isProcessingDownload ? (
                        <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <FaDownload className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {status === "missing" && (
                  <div className="p-2 text-red-500" title="Document missing">
                    <FaExclamationTriangle className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Document requirements info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Required Documents</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Profile Image (profile_image)</li>
          <li>• Driver&apos;s License (drivers_license_image)</li>
          <li>• BLS/CPR Certification (bls_cpr_image)</li>
          <li>• TB Test Results - within 12 months (tb_test_image)</li>
          <li>• Wound Care Certification - if applicable (wound_care_image)</li>
          <li>• Educational Credentials (education_image)</li>
          <li>• Professional License (license_image)</li>
          <li>• Drug & Alcohol Policy (drug_alcohol_pdf)</li>
          <li>• Liability Agreement (liability_pdf)</li>
          <li>• Exclusion Screening (exclusion_pdf)</li>
          <li>• Non-Compete Clause (non_compete_pdf)</li>
        </ul>
      </div>
    </div>
  )
}