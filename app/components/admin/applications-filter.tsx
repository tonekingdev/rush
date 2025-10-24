// app/components/admin/applications-filter.tsx
"use client"

import { useState } from "react"
import { FaFilter, FaTimes } from "react-icons/fa"

interface FilterProps {
  onFilterChange?: (filters: FilterState) => void
}

interface FilterState {
  status: string[]
  dateRange: {
    start: string
    end: string
  }
  isCNA: boolean | null
}

export function ApplicationsFilter({ onFilterChange }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    dateRange: {
      start: '',
      end: ''
    },
    isCNA: null
  })
  
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]
  
  const handleStatusChange = (status: string) => {
    const updatedStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    
    const updatedFilters = {
      ...filters,
      status: updatedStatus
    }
    
    setFilters(updatedFilters)
    onFilterChange?.(updatedFilters)
  }
  
  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const updatedFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    }
    
    setFilters(updatedFilters)
    onFilterChange?.(updatedFilters)
  }
  
  const handleCNAChange = (value: boolean | null) => {
    const updatedFilters = {
      ...filters,
      isCNA: value
    }
    
    setFilters(updatedFilters)
    onFilterChange?.(updatedFilters)
  }
  
  const clearFilters = () => {
    const resetFilters = {
      status: [],
      dateRange: {
        start: '',
        end: ''
      },
      isCNA: null
    }
    
    setFilters(resetFilters)
    onFilterChange?.(resetFilters)
  }
  
  const hasActiveFilters = filters.status.length > 0 || 
    filters.dateRange.start || 
    filters.dateRange.end || 
    filters.isCNA !== null
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <FaFilter className="text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-700">Filter Applications</h3>
          {hasActiveFilters && (
            <span className="ml-2 bg-[#1586D6] text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          {isOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Status</h4>
              <div className="space-y-2">
                {statusOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={() => handleStatusChange(option.value)}
                      className="rounded border-gray-300 text-[#1586D6] focus:ring-[#1586D6]"
                    />
                    <span className="ml-2 text-sm text-gray-600">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Date Range Filter */}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Date Range</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-[#1586D6] focus:ring focus:ring-[#1586D6] focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-[#1586D6] focus:ring focus:ring-[#1586D6] focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>
            
            {/* CNA Filter */}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">CNA Status</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={filters.isCNA === true}
                    onChange={() => handleCNAChange(true)}
                    className="border-gray-300 text-[#1586D6] focus:ring-[#1586D6]"
                  />
                  <span className="ml-2 text-sm text-gray-600">CNA</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={filters.isCNA === false}
                    onChange={() => handleCNAChange(false)}
                    className="border-gray-300 text-[#1586D6] focus:ring-[#1586D6]"
                  />
                  <span className="ml-2 text-sm text-gray-600">Non-CNA</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={filters.isCNA === null}
                    onChange={() => handleCNAChange(null)}
                    className="border-gray-300 text-[#1586D6] focus:ring-[#1586D6]"
                  />
                  <span className="ml-2 text-sm text-gray-600">All</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center mr-2"
            >
              <FaTimes className="mr-2" />
              Clear Filters
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-[#1586D6] text-white rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}