// app/components/admin/activity-log.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  FaUserEdit, 
  FaFileAlt, 
  FaEnvelope, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUser,
  FaSync
} from "react-icons/fa"

interface Activity {
  id: number
  action: string
  user: string
  timestamp: string
  details: string
}

export function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/activity-log.php')
      const data = await response.json()
      
      if (data.success) {
        setActivities(data.activities)
      } else {
        setError(data.message || 'Failed to load activity log')
      }
    } catch (error) {
      setError('An error occurred while fetching activity log')
      console.error('Activity log fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'edit':
      case 'update':
        return <FaUserEdit className="h-4 w-4 text-blue-500" />
      case 'document':
      case 'upload':
        return <FaFileAlt className="h-4 w-4 text-yellow-500" />
      case 'email':
      case 'message':
        return <FaEnvelope className="h-4 w-4 text-purple-500" />
      case 'approve':
        return <FaCheckCircle className="h-4 w-4 text-green-500" />
      case 'reject':
        return <FaTimesCircle className="h-4 w-4 text-red-500" />
      default:
        return <FaUser className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start py-3 border-b border-gray-200">
            <div className="h-8 w-8 rounded-full bg-gray-200 mr-3"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchActivities}
          className="px-4 py-2 bg-[#1586D6] text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
        >
          <FaSync className="mr-2" /> Retry
        </button>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No recent activity found</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {activities.map((activity) => (
        <div key={activity.id} className="py-3 flex items-start">
          <div className="mr-3 mt-1">
            {getActivityIcon(activity.action)}
          </div>
          <div>
            <p className="text-sm">
              <span className="font-medium">{activity.user}</span> {activity.details}
            </p>
            <p className="text-xs text-gray-500">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}