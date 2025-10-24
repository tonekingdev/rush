"use client"

import { FaEdit, FaTrash, FaUser } from "react-icons/fa"

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  status: string
  created_at: string
  last_login?: string
}

interface UserListProps {
  users: AdminUser[]
  onStatusUpdate: (userId: number, newStatus: string) => void
}

export function UserList({ users, onStatusUpdate }: UserListProps) {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "super_admin":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
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

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <FaUser className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new admin user.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-[#1586D6] flex items-center justify-center">
                      <FaUser className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                  {user.role.replace("_", " ").toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.status}
                  onChange={(e) => onStatusUpdate(user.id, e.target.value)}
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(user.status)}`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.last_login || "")}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.created_at)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button className="text-green-600 hover:text-green-700" title="Edit User">
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-700" title="Delete User">
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}