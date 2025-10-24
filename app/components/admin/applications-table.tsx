// app/components/admin/applications-table.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FaSearch, FaEye, FaFileDownload, FaSort, FaSortUp, FaSortDown } from "react-icons/fa"

interface Application {
  id: number
  name: string
  email: string
  phone: string
  status: string
  date: string
}

type SortField = 'name' | 'email' | 'date' | 'status'
type SortDirection = 'asc' | 'desc'

export function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(
          `/api/applications.php?page=${currentPage}&search=${searchTerm}&sort=${sortField}&direction=${sortDirection}`
        )
        const data = await response.json()
        
        if (data.success) {
          setApplications(data.applications)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch applications', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchApplications()
  }, [currentPage, searchTerm, sortField, sortDirection])
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FaSort className="ml-1 h-3 w-3 inline" />
    }
    return sortDirection === 'asc' ? 
      <FaSortUp className="ml-1 h-3 w-3 inline text-blue-500" /> : 
      <FaSortDown className="ml-1 h-3 w-3 inline text-blue-500" />
  }
  
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'in review':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse p-4">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Provider Applications</h2>
          
          <div className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search applications..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Link 
              href="/admin/export-applications.php" 
              className="ml-4 px-4 py-2 bg-[#1586D6] text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
            >
              <FaFileDownload className="mr-2" />
              Export
            </Link>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('email')}
              >
                Email {getSortIcon('email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                Date {getSortIcon('date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.length > 0 ? (
              applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{application.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{application.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{application.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      href={`/admin/dashboard/applications/${application.id}`}
                      className="text-[#1586D6] hover:text-blue-800 mr-4"
                    >
                      <FaEye className="inline mr-1" /> View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}