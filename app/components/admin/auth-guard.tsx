"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

interface SessionData {
  user: {
    id: number
    username: string
    email: string
    role: string
  }
  timestamp: number
  expires: number
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<SessionData["user"] | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem("admin_session")

        if (!sessionData) {
          console.log("No session found, redirecting to login")
          setIsAuthenticated(false)
          router.push("/admin")
          return
        }

        const session: SessionData = JSON.parse(sessionData)

        // Check if session is expired
        if (Date.now() > session.expires) {
          console.log("Session expired, redirecting to login")
          localStorage.removeItem("admin_session")
          setIsAuthenticated(false)
          router.push("/admin")
          return
        }

        console.log("Valid session found for user:", session.user.email)
        setUser(session.user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error checking authentication:", error)
        localStorage.removeItem("admin_session")
        setIsAuthenticated(false)
        router.push("/admin")
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1586D6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, the redirect will happen in useEffect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Provide user context to children
  return <div data-user={JSON.stringify(user)}>{children}</div>
}

// Hook to get current user from context
export function useAuth() {
  const [user, setUser] = useState<SessionData["user"] | null>(null)

  useEffect(() => {
    try {
      const sessionData = localStorage.getItem("admin_session")
      if (sessionData) {
        const session: SessionData = JSON.parse(sessionData)
        if (Date.now() <= session.expires) {
          setUser(session.user)
        }
      }
    } catch (error) {
      console.error("Error getting user from session:", error)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("admin_session")
    setUser(null)
    window.location.href = "/admin"
  }

  return { user, logout }
}