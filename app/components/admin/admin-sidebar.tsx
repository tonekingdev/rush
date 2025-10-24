"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/app/components/admin/auth-guard"
import { useAuth as useAuthContext } from "@/app/context/auth-context"
import {
  FaHome,
  FaClipboardList,
  FaUserMd,
  FaFileAlt,
  FaEnvelope,
  FaUsers,
  FaUserFriends,
  FaCog,
  FaSignOutAlt,
  FaQuestionCircle,
  FaDollarSign,
  FaCalendarCheck,
} from "react-icons/fa"

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth() // Use existing auth guard for logout
  const { hasPricingAccess } = useAuthContext() // Use auth context for pricing access

  const isActive = (path: string) => {
    // Exact match for dashboard
    if (path === "/admin/dashboard") {
      return pathname === "/admin/dashboard"
    }
    // For other paths, check if current path starts with the nav path
    return pathname?.startsWith(path)
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: FaHome,
    },
    {
      name: "Applications",
      href: "/admin/dashboard/applications",
      icon: FaClipboardList,
    },
    {
      name: "Providers",
      href: "/admin/dashboard/providers",
      icon: FaUserMd,
    },
  ]

  // Add pricing management for authorized users
  if (hasPricingAccess) {
    navItems.push({
      name: "Pricing Management",
      href: "/admin/dashboard/pricing",
      icon: FaDollarSign,
    })
  }

  navItems.push(
    {
      name: "RUSH Subscriptions",
      href: "/admin/dashboard/rush-subscriptions",
      icon: FaCalendarCheck,
    },
    {
      name: "Patient Surveys",
      href: "/admin/dashboard/patient-surveys",
      icon: FaClipboardList,
    },
    {
      name: "Patients",
      href: "/admin/dashboard/patients",
      icon: FaUserFriends,
    },
    {
      name: "Documents",
      href: "/admin/dashboard/documents",
      icon: FaFileAlt,
    },
    {
      name: "Communications",
      href: "/admin/dashboard/communications",
      icon: FaEnvelope,
    },
  )

  // Only show User Management for super_admin
  if (user?.role === "super_admin") {
    navItems.push({
      name: "User Management",
      href: "/admin/dashboard/users",
      icon: FaUsers,
    })
  }

  navItems.push(
    {
      name: "Settings",
      href: "/admin/dashboard/settings",
      icon: FaCog,
    },
    {
      name: "Help & Documentation",
      href: "/admin/dashboard/help",
      icon: FaQuestionCircle,
    },
  )

  return (
    <div className="bg-white shadow-sm h-full">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Link href="/admin/dashboard" className="flex items-center">
            <Image src="/img/logo.png" alt="RUSH Healthcare" width={150} height={60} priority />
          </Link>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  active ? "bg-[#1586D6] text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${active ? "text-white" : "text-gray-400"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
          >
            <FaSignOutAlt className="mr-3 h-5 w-5 text-gray-400" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}