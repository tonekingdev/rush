// app/components/admin/mobile-menu.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  FaHome, 
  FaClipboardList, 
  FaUserMd, 
  FaFileAlt, 
  FaEnvelope, 
  FaCog,
  FaSignOutAlt,
  FaUsers,
  FaBars,
  FaTimes
} from "react-icons/fa"
import { useAuth } from "./auth-provider"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    await logout()
    window.location.href = "/admin"
  }
  
  const isActive = (path: string) => {
    return pathname?.startsWith(path) ? "bg-blue-700" : ""
  }
  
  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-[#1586D6] text-white p-3 rounded-full shadow-lg"
      >
        {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div 
            className="fixed bottom-0 left-0 right-0 bg-[#1586D6] text-white rounded-t-xl p-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setIsOpen(false)}>
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/admin/dashboard" 
                    className={`flex items-center px-4 py-3 rounded-md ${isActive('/admin/dashboard')} hover:bg-blue-700`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaHome className="mr-3" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/dashboard/applications" 
                    className={`flex items-center px-4 py-3 rounded-md ${isActive('/admin/dashboard/applications')} hover:bg-blue-700`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaClipboardList className="mr-3" />
                    Applications
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/dashboard/providers" 
                    className={`flex items-center px-4 py-3 rounded-md ${isActive('/admin/dashboard/providers')} hover:bg-blue-700`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUserMd className="mr-3" />
                    Providers
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/dashboard/documents" 
                    className={`flex items-center px-4 py-3 rounded-md ${isActive('/admin/dashboard/documents')} hover:bg-blue-700`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaFileAlt className="mr-3" />
                    Documents
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/dashboard/communications" 
                    className={`flex items-center px-4 py-3 rounded-md ${isActive('/admin/dashboard/communications')} hover:bg-blue-700`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaEnvelope className="mr-3" />
                    Communications
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/dashboard/users" 
                    className={`flex items-center px-4 py-3 rounded-md ${isActive('/admin/dashboard/users')} hover:bg-blue-700`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUsers className="mr-3" />
                    Users
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/dashboard/settings" 
                    className={`flex items-center px-4 py-3 rounded-md ${isActive('/admin/dashboard/settings')} hover:bg-blue-700`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaCog className="mr-3" />
                    Settings
                  </Link>
                </li>
                <li>
                  <a 
                    href="#"
                    onClick={(e) => {
                      setIsOpen(false)
                      handleLogout(e)
                    }}
                    className="flex items-center px-4 py-3 rounded-md hover:bg-blue-700"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Logout
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}