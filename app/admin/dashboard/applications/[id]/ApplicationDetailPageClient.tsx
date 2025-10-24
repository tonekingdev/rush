"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ApplicationDetails } from "@/app/components/admin/application-details"
import ApplicationNotes from "@/app/components/admin/application-notes"
import ApplicationDocuments from "@/app/components/admin/application-documents"
import { ApplicationCompletionLinks } from "@/app/components/admin/application-completion-links"

interface ProviderData {
  id: number
  provider_id: string
  full_name: string
  email: string
  application_id: number
  loading?: boolean
  error?: string
}

export default function ApplicationDetailPageClient() {
  const params = useParams()
  const id = params?.id as string
  const [providerData, setProviderData] = useState<ProviderData>({
    id: 0,
    provider_id: "",
    full_name: "Loading...",
    email: "",
    application_id: 0,
    loading: true,
  })

  useEffect(() => {
    if (id) {
      const fetchProviderData = async () => {
        try {
          setProviderData((prev) => ({ ...prev, loading: true }))

          // Fetch the actual provider data from the API
          const response = await fetch(`/api/provider-applications.php?id=${id}`, {
            credentials: "include", // Important for sending cookies/session data
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch provider data: ${response.status}`)
          }

          const data = await response.json()

          if (data && data.success && data.application) {
            // Use the real provider data
            setProviderData({
              id: Number(id),
              provider_id: data.application.provider_id || `APP${id}`,
              full_name: data.application.full_name || data.application.name || "Unknown Provider",
              email: data.application.email || "No email provided",
              application_id: Number(id),
              loading: false,
            })
          } else {
            throw new Error("Invalid data format received from API")
          }
        } catch (error) {
          console.error("Error fetching provider data:", error)
          setProviderData({
            id: Number(id),
            provider_id: `APP${id}`,
            full_name: "Error loading provider",
            email: "Could not load email",
            application_id: Number(id),
            loading: false,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      fetchProviderData()
    }
  }, [id])

  if (!id) {
    return <div>Loading application ID...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Application Details</h1>
        <p className="text-gray-600">Review and manage application #{id}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Main application details with status management */}
        <ApplicationDetails applicationId={id} />

        {/* Completion links section */}
        <ApplicationCompletionLinks applicationId={id} providerData={providerData} />

        {/* Additional components in a grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ApplicationDocuments applicationId={id} />
          <ApplicationNotes applicationId={id} />
        </div>
      </div>
    </div>
  )
}