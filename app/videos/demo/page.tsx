"use client"

import type React from "react"

import Link from "next/link"
import { useRef, useState } from "react"
import {
  FaCompress,
  FaExpand,
  FaHome,
  FaInstagram,
  FaLinkedin,
  FaPause,
  FaPlay,
  FaEnvelope,
  FaUser,
  FaBriefcase,
} from "react-icons/fa"

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [emailForm, setEmailForm] = useState({
    name: "",
    occupation: "",
    email: "",
    website: "", // honeypot field - should remain empty
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0)
  const [formStartTime] = useState<number>(Date.now())

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  const handleVideoPlay = () => {
    setIsPlaying(true)
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    // Name validation
    if (!emailForm.name.trim()) {
      errors.name = "Name is required"
    } else if (emailForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    } else if (emailForm.name.trim().length > 100) {
      errors.name = "Name must be less than 100 characters"
    } else if (!/^[a-zA-Z\s'-]+$/.test(emailForm.name.trim())) {
      errors.name = "Name can only contain letters, spaces, hyphens, and apostrophes"
    }

    // Occupation validation
    if (!emailForm.occupation.trim()) {
      errors.occupation = "Occupation is required"
    } else if (emailForm.occupation.trim().length < 2) {
      errors.occupation = "Occupation must be at least 2 characters"
    } else if (emailForm.occupation.trim().length > 100) {
      errors.occupation = "Occupation must be less than 100 characters"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailForm.email.trim()) {
      errors.email = "Email is required"
    } else if (!emailRegex.test(emailForm.email.trim())) {
      errors.email = "Please enter a valid email address"
    }

    // Honeypot validation (should be empty)
    if (emailForm.website.trim() !== "") {
      errors.spam = "Spam detected"
    }

    // Time-based validation (form should take at least 3 seconds to fill)
    const timeTaken = Date.now() - formStartTime
    if (timeTaken < 3000) {
      errors.time = "Please take your time to fill out the form"
    }

    // Rate limiting (prevent multiple submissions within 60 seconds)
    const timeSinceLastSubmission = Date.now() - lastSubmissionTime
    if (lastSubmissionTime > 0 && timeSinceLastSubmission < 60000) {
      errors.rate = "Please wait before submitting again"
    }

    return errors
  }

  const handleEmailFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitMessage("")

    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      setSubmitMessage("Please correct the errors below")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/submit-email-connect.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          name: emailForm.name.trim(),
          occupation: emailForm.occupation.trim(),
          email: emailForm.email.trim(),
          website: emailForm.website,
          form_start_time: formStartTime.toString(),
          submission_time: Date.now().toString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitMessage(
          "Thank you! Your request to connect with Sonita Lewis has been sent. Please allow 2-5 business days for a response.",
        )
        setEmailForm({ name: "", occupation: "", email: "", website: "" })
        setFormErrors({})
        setLastSubmissionTime(Date.now())
      } else {
        setSubmitMessage("Error: " + result.message)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setSubmitMessage(`An error occurred: ${errorMessage}. Please try again later.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-800 font-poppins">App Demo</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Video Section */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-12">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center font-poppins">RUSH Healthcare Demo</h2>

            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-auto"
                controls
                autoPlay
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                style={{ maxHeight: "70vh" }}
              >
                <source src="/assets/App_Demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Custom Controls */}
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={togglePlay}
                className="bg-[#1586D6] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium flex items-center"
              >
                {isPlaying ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </button>

              <button
                onClick={toggleFullscreen}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-300 font-medium flex items-center"
              >
                {isFullscreen ? <FaCompress className="mr-2" /> : <FaExpand className="mr-2" />}
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 font-poppins">Connect with Sonita Lewis</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Follow our founder and CEO on social media for the latest updates and insights.
            </p>

            <div className="flex justify-center space-x-8">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/r.u.s.h.healthc/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-6 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition duration-300"
              >
                <FaInstagram className="text-4xl mb-3" />
                <span className="font-semibold text-lg">Instagram</span>
                <span className="text-sm opacity-90">@r.u.s.h.healthc</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/sonita-lewis-276b47274/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-6 bg-[#0077B5] text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition duration-300"
              >
                <FaLinkedin className="text-4xl mb-3" />
                <span className="font-semibold text-lg">LinkedIn</span>
                <span className="text-sm opacity-90">Sonita Lewis</span>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 font-poppins">Email Connect with Sonita Lewis</h3>
            <p className="text-gray-600 text-lg">
              Want to connect directly via email? Fill out the form below and Sonita will reach out to you within 2-5
              business days.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={emailForm.name}
                  onChange={handleEmailFormChange}
                  required
                  maxLength={100}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1586D6] focus:border-transparent transition duration-200 ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBriefcase className="inline mr-2" />
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={emailForm.occupation}
                  onChange={handleEmailFormChange}
                  required
                  maxLength={100}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1586D6] focus:border-transparent transition duration-200 ${
                    formErrors.occupation ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your occupation"
                />
                {formErrors.occupation && <p className="mt-1 text-sm text-red-600">{formErrors.occupation}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={emailForm.email}
                  onChange={handleEmailFormChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1586D6] focus:border-transparent transition duration-200 ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email address"
                />
                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
              </div>

              <div style={{ display: "none" }}>
                <label htmlFor="website">Website (leave blank)</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={emailForm.website}
                  onChange={handleEmailFormChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1586D6] text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <FaEnvelope className="mr-2" />
                    Connect via Email
                  </>
                )}
              </button>

              {submitMessage && (
                <div
                  className={`p-4 rounded-lg text-center ${
                    submitMessage.includes("Thank you")
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="mx-auto flex items-center justify-center py-8">
          <Link
            href="/"
            className="bg-[#1586D6] text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-medium flex items-center"
          >
            <FaHome className="mr-2" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}