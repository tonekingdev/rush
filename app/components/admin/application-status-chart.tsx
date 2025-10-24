// app/components/admin/application-status-chart.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { TooltipItem } from "chart.js"
import { FaSync } from "react-icons/fa"

// Register Chart.js components
Chart.register(...registerables)

interface StatusData {
  status: string
  count: number
}

export function ApplicationStatusChart() {
  const [statusData, setStatusData] = useState<StatusData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/application-status-chart.php")
      const data = await response.json()

      if (data.success) {
        setStatusData(data.data)
      } else {
        setError(data.message || "Failed to load chart data")
      }
    } catch (error) {
      setError("An error occurred while fetching chart data")
      console.error("Chart data fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!chartRef.current || statusData.length === 0) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare data for the chart
    const labels = statusData.map((item) => item.status)
    const counts = statusData.map((item) => item.count)

    // Define colors for different statuses
    const backgroundColors = statusData.map((item) => {
      switch (item.status.toLowerCase()) {
        case "approved":
          return "rgba(34, 197, 94, 0.6)" // green
        case "pending":
          return "rgba(234, 179, 8, 0.6)" // yellow
        case "rejected":
          return "rgba(239, 68, 68, 0.6)" // red
        case "in review":
          return "rgba(59, 130, 246, 0.6)" // blue
        default:
          return "rgba(107, 114, 128, 0.6)" // gray
      }
    })

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: counts,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map((color) => color.replace("0.6", "1")),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context: TooltipItem<"doughnut">) => {
                  const label = context.label || ""
                  const value = Number(context.raw) || 0
                  const total = counts.reduce((a: number, b: number) => a + b, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${label}: ${value} (${percentage}%)`
                },
              },
            },
          },
        },
      })
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [statusData])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1586D6]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-[#1586D6] text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
        >
          <FaSync className="mr-2" /> Retry
        </button>
      </div>
    )
  }

  if (statusData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No application status data available</p>
      </div>
    )
  }

  return (
    <div className="relative h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}