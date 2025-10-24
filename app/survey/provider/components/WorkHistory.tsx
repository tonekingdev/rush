"use client"

import type React from "react"

interface WorkHistoryProps {
  formData: {
    workHistory: Array<{
      employerName: string
      employerAddress: string
      startDate: string
      endDate: string
      workDuties: string
    }>
  }
  handleWorkHistoryChange: (index: number, field: string, value: string) => void
  addWorkHistory: () => void
  nextStep: () => void
  prevStep: () => void
}

const WorkHistory: React.FC<WorkHistoryProps> = ({
  formData,
  handleWorkHistoryChange,
  addWorkHistory,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Work History</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formData.workHistory.map((workItem, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-4">
              {index === 0 ? "Current/Most Recent Position" : `Previous Position ${index}`}
            </h3>

            {/* Employer Name */}
            <div className="mb-4">
              <label htmlFor={`employerName-${index}`} className="block mb-2 text-base font-medium text-gray-900">
                Employer Name
              </label>
              <input
                type="text"
                id={`employerName-${index}`}
                value={workItem.employerName}
                onChange={(e) => handleWorkHistoryChange(index, "employerName", e.target.value)}
                required={index === 0}
                placeholder="Enter employer name"
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
              />
            </div>

            {/* Employer Address */}
            <div className="mb-4">
              <label htmlFor={`employerAddress-${index}`} className="block mb-2 text-base font-medium text-gray-900">
                Employer&apos;s Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  id={`employerAddress-${index}`}
                  value={workItem.employerAddress}
                  onChange={(e) => handleWorkHistoryChange(index, "employerAddress", e.target.value)}
                  required={index === 0}
                  placeholder="Enter employer address"
                  className="w-full px-4 py-3 pl-10 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Start Date */}
              <div>
                <label htmlFor={`startDate-${index}`} className="block mb-2 text-base font-medium text-gray-900">
                  Start Date
                </label>
                <input
                  type="date"
                  id={`startDate-${index}`}
                  value={workItem.startDate}
                  onChange={(e) => handleWorkHistoryChange(index, "startDate", e.target.value)}
                  required={index === 0}
                  className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor={`endDate-${index}`} className="block mb-2 text-base font-medium text-gray-900">
                  End Date
                </label>
                <input
                  type="date"
                  id={`endDate-${index}`}
                  value={workItem.endDate}
                  onChange={(e) => handleWorkHistoryChange(index, "endDate", e.target.value)}
                  className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if this is your current employer</p>
              </div>
            </div>

            {/* Work Duties */}
            <div>
              <label htmlFor={`workDuties-${index}`} className="block mb-2 text-base font-medium text-gray-900">
                Work Duties
              </label>
              <textarea
                id={`workDuties-${index}`}
                value={workItem.workDuties}
                onChange={(e) => handleWorkHistoryChange(index, "workDuties", e.target.value)}
                required={index === 0}
                placeholder="Enter your duties"
                rows={4}
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
              ></textarea>
            </div>
          </div>
        ))}

        <div className="mb-6">
          <button
            type="button"
            onClick={addWorkHistory}
            className="w-full border-dashed border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition duration-300"
          >
            + Add More Work History
          </button>
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
            Next
          </button>
        </div>
      </form>
    </div>
  )
}

export default WorkHistory