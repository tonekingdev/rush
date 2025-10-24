"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { FaTrash, FaShieldAlt, FaHome, FaEnvelope, FaUser, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa"
import { FadeInView } from "../components/FadeInView"
import { SlideInView } from "../components/SlideInView"
import { DropInView } from "../components/DropInView"

interface FormData {
  firstName: string
  lastName: string
  email: string
}

export default function AccountDeletionPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/account-deletion.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned invalid response format")
      }

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
      } else {
        throw new Error(result.message || "Failed to submit deletion request")
      }
    } catch (error) {
      console.error("Submission error:", error)
      setError(error instanceof Error ? error.message : "There was an error submitting your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Image src="/img/logo.png" alt="RUSH Healthcare" width={120} height={48} />
              </div>
              <Link
                href="/"
                className="bg-[#1586D6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-medium flex items-center"
              >
                <FaHome className="mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FadeInView>
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="mb-6">
                <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted Successfully</h1>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Thank you, {formData.firstName}. Your account deletion request has been submitted successfully.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h2>
                <ul className="text-sm text-blue-800 text-left space-y-2">
                  <li>• You will receive a confirmation email shortly at {formData.email}</li>
                  <li>• Our team will process your request within 2-7 business days</li>
                  <li>• All your personal data and account information will be permanently deleted</li>
                  <li>• You will receive a final confirmation once the deletion is complete</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      This action cannot be undone. Once your account is deleted, all associated data will be
                      permanently removed from our systems.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/"
                  className="block w-full bg-[#1586D6] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium"
                >
                  Return to Home
                </Link>

                <p className="text-sm text-gray-500">
                  Questions? Contact us at{" "}
                  <a href="mailto:customerservice@rushhealthc.com" className="text-blue-500 hover:underline">
                    customerservice@rushhealthc.com
                  </a>
                </p>
              </div>
            </div>
          </FadeInView>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
     {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <FadeInView>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <FaTrash className="text-6xl text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Account Deletion Request</h1>
            <p className="text-lg text-gray-600">
              Request permanent deletion of your RUSH Healthcare account and associated data
            </p>
          </div>
        </FadeInView>

        {/* Important Information */}
        <SlideInView>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <FaExclamationTriangle className="h-6 w-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 mb-2">Important Information</h2>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• This action is permanent and cannot be undone</li>
                  <li>• All your personal information, application data, and account history will be deleted</li>
                  <li>• You will lose access to all RUSH Healthcare services</li>
                  <li>• Processing takes 2-7 business days to complete</li>
                  <li>• You will receive confirmation emails during the process</li>
                </ul>
              </div>
            </div>
          </div>
        </SlideInView>

        {/* Deletion Request Form */}
        <DropInView>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <FaShieldAlt className="text-2xl text-[#1586D6] mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Submit Deletion Request</h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center">
                  <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium">Error</h4>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline h-4 w-4 mr-2" />
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-[#1586D6]"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline h-4 w-4 mr-2" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-[#1586D6]"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline h-4 w-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-[#1586D6]"
                  placeholder="Enter the email associated with your account"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This must be the email address associated with your RUSH Healthcare account
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Data to be deleted includes:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Personal information (name, contact details, address)</li>
                  <li>• Professional credentials and certifications</li>
                  <li>• Application history and documents</li>
                  <li>• Account preferences and settings</li>
                  <li>• Communication history</li>
                  <li>• Any uploaded files or documents</li>
                </ul>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="confirmation"
                  required
                  className="mt-1 h-4 w-4 text-[#1586D6] border-gray-300 rounded focus:ring-[#1586D6]"
                />
                <label htmlFor="confirmation" className="text-sm text-gray-700">
                  I understand that this action is permanent and cannot be undone. I confirm that I want to delete my
                  RUSH Healthcare account and all associated data.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" />
                    Submit Deletion Request
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700">
                If you have questions about account deletion or need assistance, please contact our customer service
                team at{" "}
                <a href="mailto:customerservice@rushhealthc.com" className="underline">
                  customerservice@rushhealthc.com
                </a>
              </p>
            </div>
          </div>
        </DropInView>

        {/* Back to Home */}
        <div className="p-4 mt-6 flex items-center justify-center">
            <Link
                href="/"
                className="bg-[#1586D6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 font-medium flex items-center"
            >
                <FaHome className="mr-2" />
                Back to Home
            </Link>
        </div>
      </main>
    </div>
  )
}