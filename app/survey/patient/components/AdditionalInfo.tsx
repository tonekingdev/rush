"use client"

import type React from "react"
import { useRouter } from "next/navigation"

interface AdditionalInfoProps {
  formData: {
    accessibilityNeeds: string
    additionalInfo: string
    wantsToPreRegister: string
  }
  handleChange: (input: string, value: string) => void
  prevStep: () => void
  handleSubmit: () => void
}

const AdditionalInfo: React.FC<AdditionalInfoProps> = ({ formData, handleChange, prevStep, handleSubmit }) => {
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit()

    if (formData.wantsToPreRegister === "Yes") {
      router.push("/pre-register")
    } else {
      router.push("/thank-you")
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Additional Information</h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="accessibilityNeeds" className="block mb-2 text-base font-medium text-gray-900">
            Do you have any accessibility needs or preferences for in-home care?
          </label>
          <input
            type="text"
            id="accessibilityNeeds"
            value={formData.accessibilityNeeds}
            onChange={(e) => handleChange("accessibilityNeeds", e.target.value)}
            placeholder="If yes, please specify"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>
        <div>
          <label htmlFor="additionalInfo" className="block mb-2 text-base font-medium text-gray-900">
            Is there anything else you&apos;d like us to know about your healthcare needs?
          </label>
          <textarea
            id="additionalInfo"
            value={formData.additionalInfo}
            onChange={(e) => handleChange("additionalInfo", e.target.value)}
            rows={4}
            placeholder="Share any additional information here"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          ></textarea>
        </div>
        <div className="mt-6">
          <p className="block mb-2 text-base font-medium text-gray-900">
            Would you like to pre-register for the RUSH platform now?
          </p>
          <div className="flex flex-col space-y-3 mt-2 sm:flex-row sm:space-y-0 sm:space-x-6">
            <label className="flex items-center text-base text-gray-900">
              <input
                type="radio"
                value="Yes"
                checked={formData.wantsToPreRegister === "Yes"}
                onChange={(e) => handleChange("wantsToPreRegister", e.target.value)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3">Yes</span>
            </label>
            <label className="flex items-center text-base text-gray-900">
              <input
                type="radio"
                value="No"
                checked={formData.wantsToPreRegister === "No"}
                onChange={(e) => handleChange("wantsToPreRegister", e.target.value)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3">No</span>
            </label>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-base text-gray-700 mb-4">
            By submitting this form, you acknowledge that the information provided is accurate to the best of your
            knowledge. You understand that RUSH will use this information to assess your healthcare needs and provide
            appropriate services.
          </p>
          <p className="text-base text-gray-700 mb-4">
            All patient information collected through this survey is protected under HIPAA regulations and will be used
            solely for the purpose of providing healthcare services through RUSH.
          </p>
        </div>
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300 font-medium"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdditionalInfo