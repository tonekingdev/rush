"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/app/components/admin/admin-sidebar"
import { AdminHeader } from "@/app/components/admin/admin-header"
import { AuthProvider } from "@/app/context/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/check-auth.php")
        const data = await response.json()

        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          router.push("/admin")
        }
      } catch (error) {
        console.error("Authentication check failed", error)
        router.push("/admin")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="h-12 w-12 rounded-full border-4 border-t-[#1586D6] border-r-[#1586D6] border-b-[#1586D6] border-l-transparent animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}