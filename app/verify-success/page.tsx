import React from "react"
import { FadeInView } from "../components/FadeInView"

export default function VerifySuccess() {
  // Matches your app.json "scheme": "rushfrontend"
  const APP_SCHEME = "rushfrontend://login?verified=true"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl border-t-8 border-blue-600">
          <FadeInView>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 font-poppins tracking-tight">Email Verified</h2>
              <p className="mt-3 text-base text-gray-500">
                Your account is activated and ready to use.
              </p>
              
              <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800 font-semibold uppercase tracking-wider">Return to App</p>
                <p className="mt-2 text-xs text-blue-600 leading-relaxed">
                  Tap the button below to return to the R.U.S.H. mobile app and sign in.
                </p>
              </div>

              <div className="mt-8">
                <a
                  href={APP_SCHEME}
                  className="w-full inline-flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Open R.U.S.H. App
                </a>
              </div>
              
              <p className="mt-10 text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">
                R.U.S.H. Team
              </p>
            </div>
          </FadeInView>
        </div>
      </div>
    </div>
  )
}