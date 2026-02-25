// /components/admin/NpIntakeDetailPageClient.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, Clock } from "lucide-react"

// Define the data type for NP Intake submission
interface NpIntakeData {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  npi_number: string
  np_license_number: string
  years_experience: number
  status: string
  submitted_at: string
}

interface DetailState {
  application: NpIntakeData | null
  loading: boolean
  error: string | null
}

// Helper function to render a status badge
const StatusBadge = ({ status }: { status: string }) => {
  let color = "bg-gray-100 text-gray-800"
  if (status === "pending") color = "bg-yellow-100 text-yellow-800"
  if (status === "reviewed") color = "bg-blue-100 text-blue-800"
  if (status === "approved") color = "bg-green-100 text-green-800"
  if (status === "rejected") color = "bg-red-100 text-red-800"

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${color}`}>
      {status}
    </span>
  )
}

// Simple component for displaying detail items
const DetailItem = ({ label, value }: { label: string, value: string | number }) => (
    <div>
        <span className="block text-sm font-medium text-gray-500">{label}</span>
        <span className="block text-lg font-medium text-gray-900 break-words">{value || 'N/A'}</span>
    </div>
)

// Main Client Component
export default function NpIntakeDetailPageClient() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  
  const [state, setState] = useState<DetailState>({
    application: null,
    loading: true,
    error: null,
  })

  const [formattedDate, setFormattedDate] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchDetails = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        // Use the consolidated API endpoint for the detail view
        const response = await fetch(`/api/np-intakes.php?id=${id}`, {
          credentials: "include", 
        })

        const data = await response.json()

        if (!response.ok || data.error || !data.success) {
          throw new Error(data.message || "Failed to fetch application details.")
        }
        
        setState({
          // The detail API now returns the application data under the 'application' key
          application: data.data.application,
          loading: false,
          error: null,
        })

        // Format date after data is loaded
        if (data.data.application?.submitted_at) {
          setFormattedDate(new Date(data.data.application.submitted_at).toLocaleString())
        }
      } catch (error) {
        console.error("Error fetching NP intake data:", error)
        setState({
          application: null,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    fetchDetails()
  }, [id])

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-600 border-r-blue-600 border-b-blue-600 border-l-transparent"></div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-3" />
          <h2 className="text-lg font-semibold">Error Loading Application</h2>
        </div>
        <p className="mt-2">{state.error}</p>
      </div>
    )
  }

  const app = state.application
  if (!app) {
     return <div className="p-6 text-center text-gray-500">Application not found.</div>
  }

  return (
    <div className="space-y-6">
      <button 
          onClick={() => router.push('/admin/dashboard/np-intakes')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
      >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to NP Intake List
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">
              {app.firstName} {app.lastName} - Quick Intake
            </h1>
            <p className="text-gray-600 mt-1">Application ID: {app.id}</p>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" /> Submitted: {formattedDate || 'Loading date...'}
            </p>
          </div>
          <StatusBadge status={app.status} />
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Credentials & Contact</h3>
            
            <DetailItem label="Email" value={app.email} />
            <DetailItem label="Phone" value={app.phone} />
            <DetailItem label="NPI Number" value={app.npi_number} />
            <DetailItem label="License Number" value={app.np_license_number} />
            
            <DetailItem label="Years Experience" value={`${app.years_experience} years`} />

        </div>
        
        {/* Placeholder for Action/Status Component */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Actions</h3>
            <p className="text-gray-500">
                This area is reserved for updating the application status (e.g., Pending, Reviewed, Approved).
            </p>
            {/* You would integrate a component like ApplicationStatusUpdater here */}
        </div>
      </div>
      
      {/* Example Status Update Utility Component */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Status Update</h3>
        <p className="text-gray-500">The current status is **{app.status.toUpperCase()}**.</p>
        <div className="mt-4 flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Mark as Reviewed</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Approve</button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Reject</button>
        </div>
      </div>
    </div>
  )
}