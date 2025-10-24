"use client"

import { useState, useEffect } from "react"
import { Save, Check, AlertCircle, Wifi, WifiOff, Clock } from "lucide-react"

interface AutoSaveIndicatorProps {
  lastSaved?: string
  isSaving?: boolean
  hasUnsavedChanges?: boolean
  isOnline?: boolean
}

export function AutoSaveIndicator({
  lastSaved,
  isSaving = false,
  hasUnsavedChanges = false,
  isOnline = true,
}: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (lastSaved && !isSaving) {
      setShowSaved(true)
      const timer = setTimeout(() => setShowSaved(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved, isSaving])

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
        <WifiOff className="h-4 w-4" />
        <span>Offline - Changes will be saved when connection is restored</span>
      </div>
    )
  }

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
        <Save className="h-4 w-4 animate-pulse" />
        <span>Saving...</span>
      </div>
    )
  }

  if (showSaved && lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
        <Check className="h-4 w-4" />
        <span>Saved at {new Date(lastSaved).toLocaleTimeString()}</span>
      </div>
    )
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
        <AlertCircle className="h-4 w-4" />
        <span>Unsaved changes - Auto-save in progress</span>
      </div>
    )
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
        <Clock className="h-4 w-4" />
        <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
      <Wifi className="h-4 w-4" />
      <span>Ready to save</span>
    </div>
  )
}