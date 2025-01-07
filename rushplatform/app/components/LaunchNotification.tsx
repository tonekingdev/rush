'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LaunchNotification = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50"
        >
          <h3 className="text-lg font-semibold mb-2">RUSH Healthcare is Launching Soon!</h3>
          <p className="mb-4">Stay tuned for updates on our revolutionary in-home healthcare service.</p>
          <button
            onClick={handleClose}
            className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100 transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LaunchNotification

