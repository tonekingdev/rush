import { Suspense } from "react"
import { ResetPasswordForm } from "@/app/components/admin/reset-password-form"

function ResetPasswordContent() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}