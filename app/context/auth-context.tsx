"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

interface User {
  id: number
  username: string
  email: string
  role: string
  status: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  checkAuth: () => Promise<void>
  hasPricingAccess: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasPricingAccess, setHasPricingAccess] = useState(false)

  const checkPricingAccess = useCallback(async () => {
    try {
      const response = await fetch("/api/check-pricing-access.php", {
        credentials: "include",
      })
      const data = await response.json()
      setHasPricingAccess(data.hasAccess || false)
    } catch (error) {
      console.error("Pricing access check failed:", error)
      setHasPricingAccess(false)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/check-auth.php", {
        credentials: "include",
      })
      const data = await response.json()

      if (data.authenticated && data.user) {
        setUser(data.user)
        setIsAuthenticated(true)

        // Check pricing access for this user
        await checkPricingAccess()
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setHasPricingAccess(false)
      }
    } catch (error) {
      console.error("Authentication check failed:", error)
      setUser(null)
      setIsAuthenticated(false)
      setHasPricingAccess(false)
    } finally {
      setIsLoading(false)
    }
  }, [checkPricingAccess])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    checkAuth,
    hasPricingAccess,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}