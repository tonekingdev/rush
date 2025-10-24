"use client"

import { useState, useEffect } from "react"
import { IoTimeOutline, IoCloseOutline } from "react-icons/io5"
import { motion } from "framer-motion"
import { FadeInView } from "./FadeInView"

export default function MaintenanceAlert() {
  const [isVisible, setIsVisible] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState("")

  // Calculate time remaining until maintenance
  useEffect(() => {
    const maintenanceDate = new Date("April 1, 2025 08:30:00")

    const updateTimeRemaining = () => {
      const now = new Date()
      const difference = maintenanceDate.getTime() - now.getTime()

      // If maintenance has passed, don't show the alert
      if (difference < 0) {
        setIsVisible(false)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <FadeInView>
      <motion.div
        className="bg-blue-50 border-b border-blue-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 relative">
          <div className="flex items-center justify-center gap-3 text-sm md:text-base">
            <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
              <IoTimeOutline className="text-[#1586D6]" />
            </div>
            <div className="text-gray-700">
              <span className="font-semibold">Scheduled Maintenance:</span> Our system will undergo maintenance on
              <span className="font-semibold"> April 1, 2025 (8:30 AM - 9:30 AM)</span>. You may experience brief
              service interruptions during this time.
            </div>
            <div className="hidden md:block bg-blue-100 px-3 py-1 rounded-full text-[#1586D6] font-medium text-sm">
              {timeRemaining}
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label="Close maintenance alert"
            >
              <IoCloseOutline size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </FadeInView>
  )
}