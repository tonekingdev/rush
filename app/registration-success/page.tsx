import React from "react"
import Link from "next/link"
import { FadeInView } from "../components/FadeInView"

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <FadeInView>
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Registration Complete!</h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Thank you for pre-registering with RUSH. Your card will not be charged until your first visit.
              </p>
              <p className="mt-4 text-center text-sm text-gray-600">
                We&apos;ll be in touch soon to confirm your registration and provide next steps.
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </div>
  )
}

