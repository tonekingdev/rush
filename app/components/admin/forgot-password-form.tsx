"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { FaEnvelope, FaArrowLeft } from "react-icons/fa"

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/forgot-password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage("Password reset instructions have been sent to your email address.")
      } else {
        setError(data.message || "Failed to send reset email")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-xl">
      <div className="flex justify-center mb-6">
        <Image src="/img/logo.png" alt="RUSH Healthcare" width={150} height={60} />
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2 font-poppins">Forgot Password</h2>
      <p className="text-center text-gray-600 mb-6">
        Enter your email address and we&apos;ll send you instructions to reset your password.
      </p>

      {message && <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-center">{message}</div>}

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-2 text-base font-medium text-gray-900">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@rushhealthc.com"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1586D6] bg-white text-gray-900 border-gray-300"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1586D6] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium mt-6 flex items-center justify-center"
        >
          {isLoading ? <span className="animate-spin mr-2">⟳</span> : <FaEnvelope className="mr-2" />}
          {isLoading ? "Sending..." : "Send Reset Instructions"}
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full text-[#1586D6] hover:text-blue-600 transition duration-300 font-medium mt-4 flex items-center justify-center"
        >
          <FaArrowLeft className="mr-2" />
          Back to Login
        </button>
      </form>
    </div>
  )
}