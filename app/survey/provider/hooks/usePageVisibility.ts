"use client"

import { useEffect, useCallback } from "react"

interface UsePageVisibilityOptions {
  onVisibilityChange?: (isVisible: boolean) => void
  onBeforeHide?: () => void
}

export function usePageVisibility({ onVisibilityChange, onBeforeHide }: UsePageVisibilityOptions = {}) {
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden

    if (!isVisible && onBeforeHide) {
      onBeforeHide()
    }

    if (onVisibilityChange) {
      onVisibilityChange(isVisible)
    }
  }, [onVisibilityChange, onBeforeHide])

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Also listen for page unload events
    const handleBeforeUnload = () => {
      if (onBeforeHide) {
        onBeforeHide()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [handleVisibilityChange, onBeforeHide])
}