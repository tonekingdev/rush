"use client"

import React from "react"

import { useState } from "react"
import { FaEye, FaEdit, FaTrash, FaPhone, FaEnvelope } from "react-icons/fa"
import { EditProviderModal } from "./edit-provider-modal"
import { DeleteProviderModal } from "./delete-provider-modal"

interface Provider {
  id: number
  name: string
  email: string
  specialty: string
  status: string
  created_at: string
  updated_at?: string
  phone?: string
  license_number?: string
  practice_name?: string
  license_type?: string
  license_state?: string
  practice_address?: string
  practice_phone?: string
  practice_email?: string
  npi_number?: string
  dea_number?: string
  notes?: string
  years_experience?: number
  malpractice_provider?: string
  work_ethic?: string
  education?: string
  licenses?: string
  additional_data?: string
}

interface ProviderListProps {
  providers: Provider[]
  onStatusUpdate: (providerId: number, newStatus: string) => void
}

export function ProviderList({ providers, onStatusUpdate }: ProviderListProps) {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(null)
  const [localProviders, setLocalProviders] = useState<Provider[]>(providers)

  // Update local providers when props change
  React.useEffect(() => {
    setLocalProviders(providers)
  }, [providers])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleEditSuccess = (updatedProvider: Provider) => {
    setLocalProviders((prev) =>
      prev.map((provider) => (provider.id === updatedProvider.id ? updatedProvider : provider)),
    )
  }

  const handleDeleteSuccess = (deletedProvider: Provider) => {
    setLocalProviders((prev) => prev.filter((provider) => provider.id !== deletedProvider.id))
  }

  if (localProviders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <p className="text-lg font-medium">No providers found</p>
          <p className="text-sm">Try adjusting your filters or search criteria.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {localProviders.map((provider) => (
              <tr key={provider.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                    {provider.practice_name && <div className="text-sm text-gray-500">{provider.practice_name}</div>}
                    {provider.license_number && (
                      <div className="text-xs text-gray-400">License: {provider.license_number}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <FaEnvelope className="h-3 w-3 mr-2 text-gray-400" />
                      {provider.email}
                    </div>
                    {provider.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FaPhone className="h-3 w-3 mr-2 text-gray-400" />
                        {provider.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{provider.specialty}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={provider.status}
                    onChange={(e) => onStatusUpdate(provider.id, e.target.value)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(
                      provider.status,
                    )}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(provider.created_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedProvider(provider)}
                      className="text-[#1586D6] hover:text-blue-700"
                      title="View Details"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingProvider(provider)}
                      className="text-green-600 hover:text-green-700"
                      title="Edit Provider"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingProvider(provider)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete Provider"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Provider Details</h3>
                <button onClick={() => setSelectedProvider(null)} className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProvider.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProvider.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specialty</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProvider.specialty}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProvider.status)}`}
                    >
                      {selectedProvider.status}
                    </span>
                  </div>
                  {selectedProvider.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProvider.phone}</p>
                    </div>
                  )}
                  {selectedProvider.license_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">License Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProvider.license_number}</p>
                    </div>
                  )}
                  {selectedProvider.practice_name && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Practice Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProvider.practice_name}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joined Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedProvider.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Provider Modal */}
      <EditProviderModal
        isOpen={!!editingProvider}
        onClose={() => setEditingProvider(null)}
        provider={editingProvider}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Provider Modal */}
      <DeleteProviderModal
        isOpen={!!deletingProvider}
        onClose={() => setDeletingProvider(null)}
        provider={deletingProvider}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}