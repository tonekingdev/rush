"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Communication {
  id: number
  subject: string
  recipient: string
  body: string
  created_at: string
}

interface CommunicationsTableProps {
  initialCommunications: Communication[]
  initialTotalPages: number
}

const CommunicationsTable: React.FC<CommunicationsTableProps> = ({ initialCommunications, initialTotalPages }) => {
  const [communications, setCommunications] = useState<Communication[]>(initialCommunications)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(false)

  const fetchCommunications = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        sort: sortField,
        direction: sortDirection,
      })

      const response = await fetch(`/api/communications?${params}`)
      const data = await response.json()

      if (data.success) {
        setCommunications(data.communications)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch communications", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, sortField, sortDirection])

  useEffect(() => {
    if (initialCommunications.length === 0) {
      fetchCommunications()
    }
  }, [fetchCommunications, initialCommunications.length])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1) // Reset to the first page when searching
  }

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }

  const generatePageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
    return pageNumbers
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncateText = (text: string, maxLength = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communications</CardTitle>
        <CardDescription>Manage and view all email communications with providers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communications..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading communications...</span>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSortChange("id")}>
                      <div className="flex items-center">
                        ID
                        {renderSortIcon("id")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSortChange("subject")}>
                      <div className="flex items-center">
                        Subject
                        {renderSortIcon("subject")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSortChange("recipient")}
                    >
                      <div className="flex items-center">
                        Recipient
                        {renderSortIcon("recipient")}
                      </div>
                    </TableHead>
                    <TableHead>Body</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSortChange("created_at")}
                    >
                      <div className="flex items-center">
                        Created At
                        {renderSortIcon("created_at")}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No communications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    communications.map((communication) => (
                      <TableRow key={communication.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{communication.id}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={communication.subject}>
                            {communication.subject}
                          </div>
                        </TableCell>
                        <TableCell>{communication.recipient}</TableCell>
                        <TableCell className="max-w-md">
                          <div className="text-sm text-muted-foreground" title={communication.body}>
                            {truncateText(communication.body)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(communication.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {generatePageNumbers().map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default CommunicationsTable