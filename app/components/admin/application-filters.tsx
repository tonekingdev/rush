"use client"

interface ApplicationFilters {
  status: string
  search: string
  dateFrom: string
  dateTo: string
  completion: string
  licenseType: string
}

interface ApplicationFiltersProps {
  filters: ApplicationFilters
  onFiltersChange: (filters: ApplicationFilters) => void
}

export function ApplicationFilters({ filters, onFiltersChange }: ApplicationFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      completion: "",
      licenseType: "",
    })
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Name, email, phone, ID..."
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
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label htmlFor="completion" className="block text-sm font-medium text-gray-700 mb-1">
            Completion
          </label>
          <select
            id="completion"
            value={filters.completion}
            onChange={(e) => handleFilterChange("completion", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
          >
            <option value="">All Applications</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        <div>
          <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 mb-1">
            License Type
          </label>
          <select
            id="licenseType"
            value={filters.licenseType}
            onChange={(e) => handleFilterChange("licenseType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
          >
            <option value="">All License Types</option>
            <option value="RN">Registered Nurse (RN)</option>
            <option value="LPN">Licensed Practical Nurse (LPN)</option>
            <option value="CNA">Certified Nursing Assistant (CNA)</option>
            <option value="HHA">Home Health Aide (HHA)</option>
            <option value="PCA">Personal Care Assistant (PCA)</option>
            <option value="CMA">Certified Medical Assistant (CMA)</option>
            <option value="PT">Physical Therapist (PT)</option>
            <option value="PTA">Physical Therapist Assistant (PTA)</option>
            <option value="OT">Occupational Therapist (OT)</option>
            <option value="COTA">Certified Occupational Therapy Assistant (COTA)</option>
            <option value="SLP">Speech-Language Pathologist (SLP)</option>
            <option value="MSW">Medical Social Worker (MSW)</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            id="dateFrom"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
          />
        </div>

        <div>
          <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            id="dateTo"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={clearFilters}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}