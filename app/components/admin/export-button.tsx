"use client"

import { useState } from "react"
import { FaDownload, FaSpinner } from "react-icons/fa"

interface ExportButtonProps {
  type: "applications" | "providers" | "communications"
}

export function ExportButton({ type }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true)
    setShowOptions(false)

    try {
      const url = `/api/export.php?type=${type}&format=${format}`

      if (format === "csv") {
        // For CSV, trigger download
        const link = document.createElement("a")
        link.href = url
        link.download = `${type}_export_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For JSON, fetch and download
        const response = await fetch(url, {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${type}_export_${new Date().toISOString().split("T")[0]}.json`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className="bg-[#1586D6] text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center space-x-2 disabled:opacity-50"
      >
        {isExporting ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaDownload className="h-4 w-4" />}
        <span>{isExporting ? "Exporting..." : "Export"}</span>
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
          <button
            onClick={() => handleExport("csv")}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Export as CSV
          </button>
          <button
            onClick={() => handleExport("json")}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Export as JSON
          </button>
        </div>
      )}
    </div>
  )
}