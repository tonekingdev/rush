"use client"

import { useState, Suspense } from "react"
import { LoginForm } from "@/app/components/admin/login-form"
import { ForgotPasswordForm } from "@/app/components/admin/forgot-password-form"

function AdminLoginContent() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  return (
    <div className="w-full max-w-md">
      {showForgotPassword ? (
        <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
      ) : (
        <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
      )}
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        }
      >
        <AdminLoginContent />
      </Suspense>
    </main>
  )
}