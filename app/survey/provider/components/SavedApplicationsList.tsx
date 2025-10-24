"use client"

import React from "react"
import { ApplicationStorageManager, type SavedApplication } from "../utils/storage-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Clock, User, Mail, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SavedApplicationsListProps {
  onLoadApplication?: (applicationId: string) => void
  onDeleteApplication?: (applicationId: string) => void
  className?: string
}

export function SavedApplicationsList({
  onLoadApplication,
  onDeleteApplication,
  className = "",
}: SavedApplicationsListProps) {
  const { toast } = useToast()
  const [applications, setApplications] = React.useState<SavedApplication[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Fixed: Added loadApplications to dependency array
  const loadApplications = React.useCallback(() => {
    setIsLoading(true)
    try {
      const savedApps = ApplicationStorageManager.getAllSavedApplications()
      setApplications(savedApps)
    } catch (error) {
      console.error("Failed to load applications:", error)
      toast({
        title: "Error",
        description: "Failed to load saved applications.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Load saved applications on mount
  React.useEffect(() => {
    loadApplications()
  }, [loadApplications])

  const handleLoadApplication = (applicationId: string) => {
    if (onLoadApplication) {
      onLoadApplication(applicationId)
    }
  }

  const handleDeleteApplication = (applicationId: string, applicantName: string) => {
    if (
      confirm(`Are you sure you want to delete the application for ${applicantName}? This action cannot be undone.`)
    ) {
      const success = ApplicationStorageManager.deleteApplication(applicationId)
      if (success) {
        setApplications((prev) => prev.filter((app) => app.applicationId !== applicationId))
        toast({
          title: "Application Deleted",
          description: `Application for ${applicantName} has been deleted.`,
        })
        if (onDeleteApplication) {
          onDeleteApplication(applicationId)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete application. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleClearAll = () => {
    if (applications.length === 0) return

    if (
      confirm(
        `Are you sure you want to delete all ${applications.length} saved applications? This action cannot be undone.`,
      )
    ) {
      const success = ApplicationStorageManager.clearAllApplications()
      if (success) {
        setApplications([])
        toast({
          title: "All Applications Deleted",
          description: "All saved applications have been cleared.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to clear applications. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStepName = (step: number) => {
    const steps = [
      "Personal Information",
      "Professional Credentials",
      "Work History",
      "References",
      "Forms & Agreements",
    ]
    return steps[step - 1] || "Unknown Step"
  }

  const getProgressColor = (progress: number) => {
    if (progress < 25) return "bg-red-500"
    if (progress < 50) return "bg-orange-500"
    if (progress < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Saved Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (applications.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Saved Applications
          </CardTitle>
          <CardDescription>
            No saved applications found. Your progress will be automatically saved as you fill out the form.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Saved Applications ({applications.length})
            </CardTitle>
            <CardDescription>Resume your application from where you left off</CardDescription>
          </div>
          {applications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.applicationId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <h3 className="font-medium text-gray-900 truncate">{app.applicantName}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      Step {app.currentStep}/5
                    </Badge>
                  </div>

                  {app.email && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{app.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Last saved: {formatDate(app.lastModified)}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{getStepName(app.currentStep)}</span>
                        <span className="text-gray-500">{Math.round(app.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(app.progress)}`}
                          style={{ width: `${app.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t">
                <Button onClick={() => handleLoadApplication(app.applicationId)} size="sm" className="flex-1">
                  Resume Application
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteApplication(app.applicationId, app.applicantName)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Storage Info */}
        <div className="mt-6 pt-4 border-t">
          <StorageInfo />
        </div>
      </CardContent>
    </Card>
  )
}

// Storage information component
function StorageInfo() {
  const [storageInfo, setStorageInfo] = React.useState({ used: 0, available: 0, percentage: 0 })

  React.useEffect(() => {
    const info = ApplicationStorageManager.getStorageInfo()
    setStorageInfo(info)
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="text-sm text-gray-600">
      <div className="flex items-center justify-between mb-2">
        <span>Storage Usage</span>
        <span>{formatBytes(storageInfo.used)} used</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
        />
      </div>
      {storageInfo.percentage > 80 && (
        <p className="text-xs text-orange-600 mt-1">Storage is getting full. Consider clearing old applications.</p>
      )}
    </div>
  )
}

export default SavedApplicationsList