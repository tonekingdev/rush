"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/app/components/admin/auth-guard"
import { FaSearch, FaUser, FaUserMd, FaUserShield, FaPlus } from "react-icons/fa"
import { CreateUserModal } from "@/app/components/admin/create-user-modal"

interface PlatformUser {
  id: number
  identifier: string
  full_name: string
  email: string
  phone?: string
  role: string
  status: "active" | "inactive" | "suspended"
  created_at: string
  last_login?: string
  user_type: "patient" | "provider" | "admin"
  original_id: number
}

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  status: string
  created_at: string
  last_login?: string
}

export function UserManagement() {
  const { user } = useAuth()
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [accessDenied, setAccessDenied] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      })

      if (roleFilter !== "all") {
        params.append("role", roleFilter)
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/all-users.php?${params}`, {
        credentials: "include",
      })

      if (response.status === 401) {
        setAccessDenied(true)
        return
      }

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsers(data.users)
          setTotalPages(data.pagination.pages)
          setTotalUsers(data.pagination.total)
        } else {
          setError(data.message || "Failed to fetch users")
        }
      } else {
        setError("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("An error occurred while fetching users")
    } finally {
      setLoading(false)
    }
  }, [currentPage, roleFilter, statusFilter, searchTerm])

  useEffect(() => {
    // Check if user is super_admin
    if (user && user.role !== "super_admin") {
      setAccessDenied(true)
      setLoading(false)
      return
    }

    fetchUsers()
  }, [user, fetchUsers])

  const handleStatusUpdate = async (
    userId: number,
    userType: string,
    newStatus: "active" | "inactive" | "suspended",
  ) => {
    try {
      const response = await fetch("/api/all-users.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: userId,
          user_type: userType,
          status: newStatus,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Refresh the users list
          fetchUsers()
        } else {
          setError(data.message || "Failed to update user status")
        }
      } else {
        setError("Failed to update user status")
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      setError("An error occurred while updating user status")
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchUsers()
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    fetchUsers()
  }

  const handleUserCreated = (newUser: AdminUser) => {
    console.log("New admin user created:", newUser)
    setShowCreateModal(false)

    // Show success message
    setError("")

    // Refresh the users list to show the new admin user
    // This will fetch all users including the newly created admin
    fetchUsers()

    // Optional: Show a success notification
    // You could add a success state here if you want to show a green success message
  }

  const getRoleIcon = (userType: string) => {
    switch (userType) {
      case "admin":
        return <FaUserShield className="h-5 w-5 text-purple-600" />
      case "provider":
        return <FaUserMd className="h-5 w-5 text-green-600" />
      case "patient":
        return <FaUser className="h-5 w-5 text-blue-600" />
      default:
        return <FaUser className="h-5 w-5 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    if (role.includes("Super Admin")) return "bg-purple-100 text-purple-800"
    if (role.includes("Admin")) return "bg-indigo-100 text-indigo-800"
    if (role === "Provider") return "bg-green-100 text-green-800"
    if (role === "Patient") return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1586D6]"></div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You do not have permission to access this page.</p>
          <p className="mt-1 text-sm text-gray-500">Only super administrators can manage users.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Platform Users ({totalUsers})</h3>
            <p className="text-sm text-gray-500">Manage all admins, patients, and providers</p>
          </div>
          {user?.role === "super_admin" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1586D6] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1586D6]"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Create Admin User
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
            <button onClick={() => setError("")} className="ml-2 text-red-800 hover:text-red-900">
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              handleFilterChange()
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="patient">Patients</option>
            <option value="provider">Providers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              handleFilterChange()
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#1586D6] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:ring-offset-2"
          >
            Search
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={`${user.user_type}-${user.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getRoleIcon(user.user_type)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.identifier}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.status}
                      onChange={(e) =>
                        handleStatusUpdate(
                          user.original_id,
                          user.user_type,
                          e.target.value as "active" | "inactive" | "suspended",
                        )
                      }
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(user.status)}`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      {user.user_type !== "admin" && <option value="suspended">Suspended</option>}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.last_login || "")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No users found</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages} ({totalUsers} total users)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} onUserCreated={handleUserCreated} />
      )}
    </div>
  )
}