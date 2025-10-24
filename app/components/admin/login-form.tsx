"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { FaLock, FaHome } from "react-icons/fa"

interface LoginFormProps {
  onForgotPassword?: () => void
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const reset = searchParams.get("reset")
    if (reset === "success") {
      setSuccessMessage("Password reset successful! You can now login with your new password.")
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      console.log("Submitting login with:", usernameOrEmail)

      const response = await fetch("/api/auth.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ usernameOrEmail, password }),
      })

      console.log("Response status:", response.status)

      const responseText = await response.text()
      console.log("Response text:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", e)
        throw new Error("Server returned invalid JSON")
      }

      if (response.ok && data.success) {
        console.log("Login successful, storing session...")

        // Store user session in localStorage for client-side authentication
        const sessionData = {
          user: data.user,
          timestamp: Date.now(),
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        }

        localStorage.setItem("admin_session", JSON.stringify(sessionData))

        console.log("Session stored, redirecting to dashboard...")
        router.push("/admin/dashboard")
      } else {
        setError(data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-xl">
      <div className="flex justify-center mb-6">
        <Image src="/img/logo.png" alt="RUSH Healthcare" width={150} height={60} />
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 font-poppins">Admin Login</h2>

      {successMessage && <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">{successMessage}</div>}

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="usernameOrEmail" className="block mb-2 text-base font-medium text-gray-900">
            Username or Email
          </label>
          <input
            id="usernameOrEmail"
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            placeholder="admin or admin@rushhealthc.com"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1586D6] bg-white text-gray-900 border-gray-300"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-2 text-base font-medium text-gray-900">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1586D6] bg-white text-gray-900 border-gray-300"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1586D6] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium mt-6 flex items-center justify-center"
        >
          {isLoading ? <span className="animate-spin mr-2">⟳</span> : <FaLock className="mr-2" />}
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {onForgotPassword && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[#1586D6] hover:text-blue-600 transition duration-300 font-medium"
            >
              Forgot your password?
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleBackToHome}
          className="w-full bg-[#1586D6] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium mt-4 flex items-center justify-center"
        >
          <FaHome className="mr-2" />
          Back to Home
        </button>
      </form>
    </div>
  )
}