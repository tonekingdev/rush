// app/components/admin/recent-applications.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FaEye } from "react-icons/fa"

interface Application {
  id: number
  name: string
  date: string
  status: string
}

export function RecentApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentApplications = async () => {
      try {
        const response = await fetch('/api/recent-applications.php')
        const data = await response.json()
        
        if (data.success) {
          setApplications(data.applications)
        } else {
          setError(data.message || 'Failed to load recent applications')
        }
      } catch (error) {
        setError('An error occurred while fetching recent applications')
        console.error('Recent applications fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRecentApplications()
  }, [])

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'in review':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No recent applications found</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {applications.map((application) => (
        <div key={application.id} className="py-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">{application.name}</h3>
            <p className="text-xs text-gray-500">{application.date}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(application.status)}`}>
              {application.status}
            </span>
            <Link 
              href={`/admin/dashboard/applications/${application.id}`}
              className="text-[#1586D6] hover:text-blue-800"
            >
              <FaEye className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ))}
      
      <div className="pt-3">
        <Link 
          href="/admin/dashboard/applications"
          className="text-[#1586D6] hover:text-blue-800 text-sm font-medium"
        >
          View all applications
        </Link>
      </div>
    </div>
  )
}