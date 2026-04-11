"use client"

interface ProviderFilters {
  status: string
  specialty: string
  search: string
}

interface ProviderFiltersProps {
  filters: ProviderFilters
  onFiltersChange: (filters: ProviderFilters) => void
}

export function ProviderFilters({ filters, onFiltersChange }: ProviderFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: "",
      specialty: "",
      search: "",
    })
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Name, email, practice..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
            Specialty
          </label>
          <select
            id="specialty"
            value={filters.specialty}
            onChange={(e) => handleFilterChange("specialty", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
          >
            <option value="">All Specialties</option>
            <option value="Family Medicine">Family Medicine</option>
            <option value="Internal Medicine">Internal Medicine</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Neurology">Neurology</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Emergency Medicine">Emergency Medicine</option>
            <option value="Radiology">Radiology</option>
            <option value="Anesthesiology">Anesthesiology</option>
            <option value="Surgery">Surgery</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}