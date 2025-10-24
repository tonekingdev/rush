"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa"

export function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [token, setToken] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError("Invalid or missing reset token")
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/reset-password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to login with success message
        router.push("/admin?reset=success")
      } else {
        setError(data.message || "Failed to reset password")
      }
    } catch (error) {
      console.error("Reset password error:", error)
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

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2 font-poppins">Reset Password</h2>
      <p className="text-center text-gray-600 mb-6">Enter your new password below.</p>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block mb-2 text-base font-medium text-gray-900">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1586D6] bg-white text-gray-900 border-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-2 text-base font-medium text-gray-900">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1586D6] bg-white text-gray-900 border-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>Password requirements:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>At least 8 characters long</li>
            <li>Mix of uppercase and lowercase letters</li>
            <li>At least one number</li>
            <li>At least one special character</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full bg-[#1586D6] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium mt-6 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <span className="animate-spin mr-2">⟳</span> : <FaLock className="mr-2" />}
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  )
}