"use client"

import { useState, useEffect, useCallback } from "react"
import { ProviderList } from "./provider-list"
import { ProviderFilters as FilterComponent } from "./provider-filters"

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

interface ProviderFilters {
  status: string
  specialty: string
  search: string
}

export function ProviderManagement() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<ProviderFilters>({
    status: "",
    specialty: "",
    search: "",
  })

  const applyFilters = useCallback(() => {
    let filtered = [...providers]

    if (filters.status) {
      filtered = filtered.filter((provider) => provider.status === filters.status)
    }

    if (filters.specialty) {
      filtered = filtered.filter((provider) => provider.specialty === filters.specialty)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (provider) =>
          provider.name.toLowerCase().includes(searchLower) ||
          provider.email.toLowerCase().includes(searchLower) ||
          (provider.practice_name && provider.practice_name.toLowerCase().includes(searchLower)) ||
          (provider.license_number && provider.license_number.toLowerCase().includes(searchLower)),
      )
    }

    setFilteredProviders(filtered)
  }, [providers, filters.status, filters.specialty, filters.search])

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/providers.php", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProviders(data.providers || [])
        } else {
          setError(data.message || "Failed to fetch providers")
        }
      } else {
        setError("Failed to fetch providers")
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
      setError("An error occurred while fetching providers")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (providerId: number, newStatus: string) => {
    try {
      const response = await fetch("/api/providers.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: providerId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update the provider in the list
          setProviders((prev) =>
            prev.map((provider) => (provider.id === providerId ? { ...provider, status: newStatus } : provider)),
          )
        } else {
          setError(data.message || "Failed to update provider status")
        }
      } else {
        setError("Failed to update provider status")
      }
    } catch (error) {
      console.error("Error updating provider status:", error)
      setError("An error occurred while updating provider status")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1586D6]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
        <button
          onClick={() => {
            setError("")
            fetchProviders()
          }}
          className="mt-4 bg-[#1586D6] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Providers ({filteredProviders.length})</h3>
          <div className="flex space-x-3">
            <button
              onClick={fetchProviders}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
            >
              Refresh
            </button>
            <button className="bg-[#1586D6] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
              Export
            </button>
          </div>
        </div>

        <FilterComponent filters={filters} onFiltersChange={setFilters} />

        <div className="mt-6">
          <ProviderList providers={filteredProviders} onStatusUpdate={handleStatusUpdate} />
        </div>
      </div>
    </div>
  )
}