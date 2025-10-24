"use client"

import { useEffect, useCallback } from "react"

interface UseBeforeUnloadOptions {
  when: boolean
  message?: string
}

// Debug mode - set to false to reduce console logs
const DEBUG_MODE = false

export function useBeforeUnload({
  when,
  message = "You have unsaved changes. Are you sure you want to leave?",
}: UseBeforeUnloadOptions) {
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (when) {
        // Modern browsers ignore the custom message, but we still set it
        event.preventDefault()
        event.returnValue = message

        // For debugging
        if (DEBUG_MODE) console.log("Browser warning triggered:", message)

        return message
      }
    },
    [when, message],
  )

  const handleUnload = useCallback(() => {
    if (when && DEBUG_MODE) {
      console.log("Page unloading with unsaved changes")
    }
  }, [when])

  useEffect(() => {
    if (when) {
      if (DEBUG_MODE) console.log("Setting up beforeunload listener")
      window.addEventListener("beforeunload", handleBeforeUnload)
      window.addEventListener("unload", handleUnload)

      return () => {
        if (DEBUG_MODE) console.log("Removing beforeunload listener")
        window.removeEventListener("beforeunload", handleBeforeUnload)
        window.removeEventListener("unload", handleUnload)
      }
    }
  }, [when, handleBeforeUnload, handleUnload])
}