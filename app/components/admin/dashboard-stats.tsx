// app/components/admin/dashboard-stats.tsx
"use client"

import { useState, useEffect } from "react"
import { FaUserPlus, FaCheckCircle, FaHourglass, FaExclamationTriangle } from "react-icons/fa"

interface StatsData {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard-stats.php')
        const data = await response.json()
        
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-[#1586D6]">
            <FaUserPlus className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Applications</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <FaHourglass className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <FaCheckCircle className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Approved</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.approvedApplications}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <FaExclamationTriangle className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Rejected</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.rejectedApplications}</p>
          </div>
        </div>
      </div>
    </div>
  )
}