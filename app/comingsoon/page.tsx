"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useRef } from "react"
import Modal from "../components/Modal"
import { Container } from "@/components/ui/container"

export default function ComingSoon() {
  const [message, setMessage] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const emailInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const emailInput = form.elements.namedItem("email") as HTMLInputElement
    const email = emailInput.value
    setMessage("Submitting...")

    try {
      const formData = new FormData()
      formData.append("email", email)

      const response = await fetch("/comingsoon_submit.php", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "An error occurred")
      }

      setMessage(data.message || "Submission successful")
      setIsSubmitted(true)
      if (emailInputRef.current) {
        emailInputRef.current.value = ""
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred"
      setMessage(errorMessage)
      setIsModalOpen(true)
      console.error("Error:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-background py-12">
      <Container size="sm" className="text-center">
        <motion.h1
          className="text-balance font-heading text-3xl font-extrabold text-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          RUSH Platform Coming Soon
        </motion.h1>
        <motion.p
          className="mt-2 text-muted-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          We&apos;re working hard to bring you on-demand in-home healthcare.
        </motion.p>
      </Container>

      <div className="mx-auto mt-8 w-full max-w-md px-4">
        <div className="rounded-lg bg-card px-4 py-8 shadow-lg sm:px-10">
          {!isSubmitted ? (
            <motion.form
              className="space-y-6"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    ref={emailInputRef}
                    className="block w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-[#1586D6] focus:outline-none focus:ring-[#1586D6] sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-[#1586D6] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:ring-offset-2"
                >
                  Notify me when RUSH launches
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-center text-muted-foreground">{message}</p>
              <Link
                href="/"
                className="flex w-full justify-center rounded-md bg-[#1586D6] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:ring-offset-2"
              >
                Go Back Home
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Link
          href="/survey/provider"
          className="text-[#1586D6] hover:text-blue-600"
        >
          Sign up as a healthcare professional
        </Link>
      </motion.div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="mb-2 text-lg font-medium text-foreground">Error</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </Modal>
    </div>
  )
}
