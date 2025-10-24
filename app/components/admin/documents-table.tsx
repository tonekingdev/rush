"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { FaFileAlt, FaEye, FaDownload, FaCheck, FaTimes, FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa"

interface Document {
  id: string
  name: string
  type: string
  applicationId: string
  providerName: string
  size: string
  uploadDate: string
  status: string
}

interface DocumentsTableProps {
  applicationId?: string
}

type SortField = "name" | "providerName" | "uploadDate" | "status"
type SortDirection = "asc" | "desc"

export function DocumentsTable({ applicationId }: DocumentsTableProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState<SortField>("uploadDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        sort: sortField,
        direction: sortDirection,
        ...(applicationId && { applicationId }),
      })

      const response = await fetch(`/api/documents.php?${params}`)
      const data = await response.json()

      if (data.success) {
        setDocuments(data.documents)
        setTotalPages(data.totalPages)
      } else {
        setIsError(true)
        setMessage(data.message || "Failed to load documents")
      }
    } catch {
      setIsError(true)
      setMessage("An error occurred while fetching documents")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, sortField, sortDirection, applicationId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FaSort className="ml-1 h-3 w-3 inline" />
    }
    return sortDirection === "asc" ? (
      <FaSortUp className="ml-1 h-3 w-3 inline text-blue-500" />
    ) : (
      <FaSortDown className="ml-1 h-3 w-3 inline text-blue-500" />
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const handleDownload = (documentId: string) => {
    window.open(`/api/download-document.php?id=${documentId}`, "_blank")
  }

  const handleView = (documentId: string) => {
    window.open(`/api/view-document.php?id=${documentId}`, "_blank")
  }

  const handleVerify = async (documentId: string) => {
    try {
      const response = await fetch("/api/verify-document.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId, status: "verified" }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Document verified successfully")
        setIsError(false)
        fetchDocuments()
      } else {
        setIsError(true)
        setMessage(data.message || "Verification failed")
      }
    } catch {
      setIsError(true)
      setMessage("An error occurred during verification")
    }
  }

  const handleReject = async (documentId: string) => {
    try {
      const response = await fetch("/api/verify-document.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId, status: "rejected" }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Document rejected")
        setIsError(false)
        fetchDocuments()
      } else {
        setIsError(true)
        setMessage(data.message || "Rejection failed")
      }
    } catch {
      setIsError(true)
      setMessage("An error occurred during rejection")
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse p-4">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">
            {applicationId ? "Application Documents" : "All Documents"}
          </h2>

          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 mx-4 mt-4 rounded-md ${isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
        >
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Document {getSortIcon("name")}
              </th>
              {!applicationId && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("providerName")}
                >
                  Provider {getSortIcon("providerName")}
                </th>
              )}
              {!applicationId && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application ID
                </th>
              )}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("uploadDate")}
              >
                Upload Date {getSortIcon("uploadDate")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status {getSortIcon("status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.length > 0 ? (
              documents.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-800 mr-3">
                        <FaFileAlt className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{document.name}</div>
                        <div className="text-sm text-gray-500">{document.size}</div>
                      </div>
                    </div>
                  </td>
                  {!applicationId && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{document.providerName}</div>
                    </td>
                  )}
                  {!applicationId && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/dashboard/applications/${document.applicationId}`}
                        className="text-sm text-[#1586D6] hover:text-blue-800"
                      >
                        {document.applicationId}
                      </Link>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(document.uploadDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(document.status)}`}>
                      {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(document.id)}
                        className="text-gray-500 hover:text-gray-700"
                        title="View"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(document.id)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Download"
                      >
                        <FaDownload className="h-4 w-4" />
                      </button>
                      {document.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleVerify(document.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Verify"
                          >
                            <FaCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(document.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <FaTimes className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={applicationId ? 4 : 6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Previous
          </button>

          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}