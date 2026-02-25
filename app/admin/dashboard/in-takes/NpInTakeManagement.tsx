"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, FileText } from "lucide-react"

interface Application {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  npi: string
  license: string
  experience: number
  status: string
  created_at: string
}

export function NpIntakeManagement() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Use the consolidated API endpoint
        const response = await fetch("/api/np-intakes.php", { 
          credentials: "include", 
        })
        const data = await response.json()

        if (!response.ok || data.error || !data.success) {
          throw new Error(data.message || "Failed to fetch applications list.")
        }
        
        // FIXED: Access the nested applications array from data.data
        setApplications(data.data.applications || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.")
        console.error("Error fetching NP intake list:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const getStatusBadge = (status: string) => {
    let color = ""
    let bgColor = ""
    switch (status.toLowerCase()) {
      case "approved":
        color = "text-green-800"
        bgColor = "bg-green-100"
        break
      case "reviewed":
        color = "text-blue-800"
        bgColor = "bg-blue-100"
        break
      case "rejected":
        color = "text-red-800"
        bgColor = "bg-red-100"
        break
      case "pending":
      default:
        color = "text-yellow-800"
        bgColor = "bg-yellow-100"
        break
    }
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${color} capitalize`}>
        {status}
      </span>
    )
  }
  
  const formatDateTime = (dateTimeString: string) => {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-600 border-r-blue-600 border-b-blue-600 border-l-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-3" />
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <h3 className="text-xl font-semibold text-gray-800">Total Submissions ({applications.length})</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NPI / License</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.firstName} {app.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="block">{app.email}</span>
                    <span className="block text-xs">{app.phone}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="block font-medium">NPI: {app.npi || 'N/A'}</span>
                    <span className="block text-xs">Lic: {app.license || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.experience > 0 ? `${app.experience} years` : 'Less than 1 year'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(app.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(app.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    // VIEW IN-TAKE DETAILS
                    href={`/admin/dashboard/np-intakes/${app.id}`} 
                    className="text-blue-600 hover:text-blue-900 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-1" /> View
                  </Link>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
                <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No NP intake applications found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}