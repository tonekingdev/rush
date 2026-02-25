import React from "react"
import { FadeInView } from "../components/FadeInView"

export default function VerifyFailed() {
  const APP_SCHEME = "rushfrontend://login?error=expired"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl border-t-8 border-red-500">
          <FadeInView>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 font-poppins">Link Expired</h2>
              <p className="mt-3 text-sm text-gray-500">
                For your security, verification links expire after 24 hours.
              </p>

              <div className="mt-10">
                <a
                  href={APP_SCHEME}
                  className="w-full inline-flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-gray-900 hover:bg-black transition-all"
                >
                  Return to App
                </a>
              </div>
              
              <p className="mt-6 text-sm">
                <a href="mailto:support@rushhealthc.com" className="text-blue-600 font-medium hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </FadeInView>
        </div>
      </div>
    </div>
  )
}