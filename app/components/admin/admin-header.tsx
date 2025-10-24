"use client"

import { useState } from "react"
import Link from "next/link"
import { SlMenu } from "react-icons/sl"
import { FaBell, FaUser } from "react-icons/fa"

export function AdminHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout.php", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        window.location.href = "/admin"
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <SlMenu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 flex justify-center md:justify-start">
          <h1 className="text-xl font-bold text-gray-800 md:ml-2 font-poppins">RUSH Healthcare Admin</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <FaBell className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-[#1586D6] flex items-center justify-center text-white">
                <FaUser className="h-4 w-4" />
              </div>
              <span className="hidden md:inline-block font-medium">Admin</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link
                  href="/admin/dashboard/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  href="/admin/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsProfileOpen(false)
                    handleLogout()
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1586D6] text-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/admin/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/dashboard/applications"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Applications
            </Link>
            <Link
              href="/admin/dashboard/documents"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Documents
            </Link>
            <Link
              href="/admin/dashboard/communications"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Communications
            </Link>
            <Link
              href="/admin/dashboard/settings"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                handleLogout()
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  )
}