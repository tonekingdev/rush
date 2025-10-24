"use client"

import type React from "react"

interface ReferencesProps {
  formData: {
    references: Array<{
      referenceName: string
      referenceContact: string
      professionalRelationship: string
    }>
  }
  handleReferenceChange: (index: number, field: string, value: string) => void
  addReference: () => void
  nextStep: () => void
  prevStep: () => void
}

const References: React.FC<ReferencesProps> = ({
  formData,
  handleReferenceChange,
  addReference,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Professional References</h2>
      <p className="text-gray-600 mb-6">Please provide at least two professional references.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formData.references.map((reference, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-4">Professional Reference {index + 1}</h3>

            {/* Reference Name */}
            <div className="mb-4">
              <label htmlFor={`referenceName-${index}`} className="block mb-2 text-base font-medium text-gray-900">
                Reference Name
              </label>
              <input
                type="text"
                id={`referenceName-${index}`}
                value={reference.referenceName}
                onChange={(e) => handleReferenceChange(index, "referenceName", e.target.value)}
                required={index === 0}
                placeholder="Enter full name"
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
              />
            </div>

            {/* Reference Contact */}
            <div className="mb-4">
              <label htmlFor={`referenceContact-${index}`} className="block mb-2 text-base font-medium text-gray-900">
                Reference Contact
              </label>
              <input
                type="tel"
                id={`referenceContact-${index}`}
                value={reference.referenceContact}
                onChange={(e) => handleReferenceChange(index, "referenceContact", e.target.value)}
                required={index === 0}
                placeholder="Phone Number (incl area code)"
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
              />
            </div>

            {/* Professional Relationship */}
            <div>
              <label
                htmlFor={`professionalRelationship-${index}`}
                className="block mb-2 text-base font-medium text-gray-900"
              >
                Professional Relationship
              </label>
              <input
                type="text"
                id={`professionalRelationship-${index}`}
                value={reference.professionalRelationship}
                onChange={(e) => handleReferenceChange(index, "professionalRelationship", e.target.value)}
                required={index === 0}
                placeholder="Enter relationship"
                className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
              />
            </div>
          </div>
        ))}

        <div className="mb-6">
          <button
            type="button"
            onClick={addReference}
            className="w-full border-dashed border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition duration-300"
          >
            + Add More Professional References
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

export default References