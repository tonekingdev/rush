"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

interface ApplicationStatusUpdateProps {
  applicationId: string
  currentStatus: string
}

const ApplicationStatusUpdate: React.FC<ApplicationStatusUpdateProps> = ({ applicationId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update application status")
      }

      toast.success("Application status updated successfully!")
      router.refresh()
    } catch {
      toast.error("Failed to update application status.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="status">Status:</label>
        <select id="status" value={status} onChange={handleStatusChange} disabled={isLoading}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Status"}
      </button>
    </form>
  )
}

export default ApplicationStatusUpdate
