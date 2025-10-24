"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"

const SubmissionSuccess: React.FC = () => {
  const [providerName, setProviderName] = useState("")

  useEffect(() => {
    // Get name from localStorage if available
    const name = localStorage.getItem("providerName") || ""
    setProviderName(name)
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-xl text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Submitted Successfully!</h2>

      <p className="text-gray-600 mb-6">
        {providerName ? `Thank you ${providerName} for applying` : "Thank you for applying"} to become a RUSH healthcare
        provider. We have received your application and will review it shortly.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8 text-left">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Next Steps:</h3>
        <ol className="list-decimal pl-6 text-blue-700 space-y-2">
          <li>Complete your background check as outlined in the instructions</li>
          <li>Ensure you have active malpractice insurance coverage</li>
          <li>Our team will contact you within 3-5 business days to discuss your application</li>
        </ol>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8 text-left">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Important:</h3>
        <p className="text-yellow-700">
          Please email your completed background check results to{" "}
          <a href="mailto:credentialing@rushhealthc.com" className="underline">
            credentialing@rushhealthc.com
          </a>{" "}
          within 7 days.
        </p>
      </div>

      <p className="text-gray-600 mb-8">
        If you have any questions, please contact us at{" "}
        <a href="mailto:credentialing@rushhealthc.com" className="text-blue-500 hover:underline">
          credentialing@rushhealthc.com
        </a>{" "}
        or call{" "}
        <a href="tel:5863444567" className="text-blue-500 hover:underline">
          586-344-4567
        </a>
        .
      </p>

      <Link href="/">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium">
          Return to Home
        </button>
      </Link>
    </div>
  )
}

export default SubmissionSuccess