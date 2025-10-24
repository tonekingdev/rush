"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"

interface CustomSignaturePadProps {
  onSave: (dataURL: string) => void
  onClear: () => void
  width?: number
  height?: number
  penColor?: string
  backgroundColor?: string
  existingSignature?: string
}

export const CustomSignaturePad: React.FC<CustomSignaturePadProps> = ({
  onSave,
  onClear,
  width = 400,
  height = 160,
  penColor = "#000000",
  backgroundColor = "#ffffff",
  existingSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [currentSignature, setCurrentSignature] = useState<string>("")
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize canvas
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Set up canvas dimensions
    canvas.width = width
    canvas.height = height

    // Set up drawing context
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = penColor
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.imageSmoothingEnabled = true
  }, [width, height, backgroundColor, penColor])

  // Load existing signature
  const loadExistingSignature = useCallback(() => {
    if (!existingSignature || !canvasRef.current || !isMounted) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      // Clear and initialize canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw the existing signature
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setIsEmpty(false)
      setCurrentSignature(existingSignature)
    }

    img.onerror = () => {
      console.error("Failed to load existing signature")
      setIsEmpty(true)
      setCurrentSignature("")
    }

    img.src = existingSignature
  }, [existingSignature, backgroundColor, isMounted])

  // Initialize canvas when mounted
  useEffect(() => {
    if (!isMounted) return
    initializeCanvas()
  }, [isMounted, initializeCanvas])

  // Load existing signature when it changes
  useEffect(() => {
    if (existingSignature && existingSignature !== currentSignature) {
      loadExistingSignature()
    } else if (!existingSignature && currentSignature) {
      // Clear if no existing signature
      initializeCanvas()
      setIsEmpty(true)
      setCurrentSignature("")
    }
  }, [existingSignature, currentSignature, loadExistingSignature, initializeCanvas])

  const getCoordinates = useCallback((event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in event) {
      const touch = event.touches[0] || event.changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      }
    }
  }, [])

  const startDrawing = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault()
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx) return

      setIsDrawing(true)
      setIsEmpty(false)

      const { x, y } = getCoordinates(event)
      ctx.beginPath()
      ctx.moveTo(x, y)
    },
    [getCoordinates],
  )

  const draw = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault()
      if (!isDrawing) return

      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx) return

      const { x, y } = getCoordinates(event)
      ctx.lineTo(x, y)
      ctx.stroke()
    },
    [isDrawing, getCoordinates],
  )

  const stopDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    event.preventDefault()
    setIsDrawing(false)
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    initializeCanvas()
    setIsEmpty(true)
    setCurrentSignature("")
    setShowSavedMessage(false)
    onClear()
  }, [initializeCanvas, onClear])

  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Check if canvas has any drawing on it
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get image data to check if canvas is empty (besides background)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Check if there's any non-background color
    let hasDrawing = false
    for (let i = 0; i < data.length; i += 4) {
      // Check if pixel is not white (background)
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
        hasDrawing = true
        break
      }
    }

    if (!hasDrawing && !currentSignature) {
      return // No signature to save
    }

    const dataURL = canvas.toDataURL("image/png")
    setCurrentSignature(dataURL)
    setIsEmpty(false)
    onSave(dataURL)

    // Show confirmation message
    setShowSavedMessage(true)
    setTimeout(() => {
      setShowSavedMessage(false)
    }, 2000) // Hide after 2 seconds
  }, [currentSignature, onSave])

  // Set up event listeners
  useEffect(() => {
    if (!isMounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => startDrawing(e)
    const handleMouseMove = (e: MouseEvent) => draw(e)
    const handleMouseUp = (e: MouseEvent) => stopDrawing(e)
    const handleMouseLeave = (e: MouseEvent) => stopDrawing(e)

    // Touch events
    const handleTouchStart = (e: TouchEvent) => startDrawing(e)
    const handleTouchMove = (e: TouchEvent) => draw(e)
    const handleTouchEnd = (e: TouchEvent) => stopDrawing(e)

    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseLeave)

      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMounted, startDrawing, draw, stopDrawing])

  if (!isMounted) {
    return (
      <div className="border rounded-md bg-gray-50 flex items-center justify-center" style={{ width, height }}>
        <span className="text-gray-500">Loading signature pad...</span>
      </div>
    )
  }

  return (
    <div className="signature-pad-container">
      <canvas
        ref={canvasRef}
        className="border rounded-md cursor-crosshair touch-none"
        style={{
          width: "100%",
          height: `${height}px`,
          maxWidth: `${width}px`,
        }}
        aria-label="Signature pad - draw your signature here"
      />
      <div className="flex justify-end mt-2 space-x-2">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
        >
          Clear
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={saveSignature}
            disabled={isEmpty}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Signature
          </button>
          {showSavedMessage && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-green-500 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
              ✓ Signature saved!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}