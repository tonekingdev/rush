"use client"

import type React from "react"
import Image from "next/image"

interface ProfessionalCredentialsProps {
  formData: {
    workEthic: string
    education: string
    educationImage: File | null
    educationImagePreview?: string
    licenses: string
    licenseImage: File | null
    licenseImagePreview?: string
    blsCprImage: File | null
    blsCprImagePreview?: string
    tbTestImage: File | null
    tbTestImagePreview?: string
    woundCareImage: File | null
    woundCareImagePreview?: string
    hasBlsCpr: boolean
    hasWoundCareExperience: boolean
    yearsExperience: string | number
    [key: string]:
      | string
      | number
      | boolean
      | File
      | null
      | undefined
      | Array<{
          employerName: string
          employerAddress: string
          startDate: string
          endDate: string
          workDuties: string
        }>
      | Array<{
          referenceName: string
          referenceContact: string
          professionalRelationship: string
        }>
      | Record<string, string | number | boolean>
  }
  handleChange: (input: string, value: string | number | boolean) => void
  handleFileChange: (fieldName: string, file: File) => void
  nextStep: () => void
  prevStep: () => void
}

const ProfessionalCredentials: React.FC<ProfessionalCredentialsProps> = ({
  formData,
  handleChange,
  handleFileChange,
  nextStep,
  prevStep,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  const handleBlsCprUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange("blsCprImage", file)
    }
  }

  const handleTbTestUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange("tbTestImage", file)
    }
  }

  const handleWoundCareUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange("woundCareImage", file)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Professional Credentials</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Work Ethic */}
        <div className="mb-4">
          <label htmlFor="workEthic" className="block mb-2 text-base font-medium text-gray-900">
            Work Ethic
          </label>
          <input
            type="text"
            id="workEthic"
            value={formData.workEthic}
            onChange={(e) => handleChange("workEthic", e.target.value)}
            required
            placeholder="Describe your work ethic"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>

        {/* Education */}
        <div className="mb-4">
          <label htmlFor="education" className="block mb-2 text-base font-medium text-gray-900">
            Education
          </label>
          <input
            type="text"
            id="education"
            value={formData.education}
            onChange={(e) => handleChange("education", e.target.value)}
            required
            placeholder="Enter your education background"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
          <div className="mt-4">
            <div className="w-full h-40 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative border-2 border-dashed border-gray-300">
              {formData.educationImagePreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={formData.educationImagePreview || "/placeholder.svg"}
                    alt="Education certificate preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">No education certificate uploaded</span>
                </div>
              )}
            </div>
            <label className="cursor-pointer text-blue-500 hover:text-blue-700 font-medium">
              Upload Education Certificate
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileChange("educationImage", file)
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Licenses */}
        <div className="mb-4">
          <label htmlFor="licenses" className="block mb-2 text-base font-medium text-gray-900">
            Professional Licenses
          </label>
          <input
            type="text"
            id="licenses"
            value={formData.licenses}
            onChange={(e) => handleChange("licenses", e.target.value)}
            required
            placeholder="Enter your professional licenses"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
          <div className="mt-4">
            <div className="w-full h-40 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative border-2 border-dashed border-gray-300">
              {formData.licenseImagePreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={formData.licenseImagePreview || "/placeholder.svg"}
                    alt="Professional license preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">No license image uploaded</span>
                </div>
              )}
            </div>
            <label className="cursor-pointer text-blue-500 hover:text-blue-700 font-medium">
              Upload License Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileChange("licenseImage", file)
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Years of Experience */}
        <div className="mb-4">
          <label htmlFor="yearsExperience" className="block mb-2 text-base font-medium text-gray-900">
            Years of Experience
          </label>
          <input
            type="number"
            id="yearsExperience"
            value={formData.yearsExperience}
            onChange={(e) => handleChange("yearsExperience", Number.parseInt(e.target.value) || 0)}
            required
            placeholder="Enter your years of experience"
            min="0"
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
          />
        </div>

        {/* BLS/CPR Certification */}
        <div className="mb-6">
          <label className="block mb-2 text-base font-medium text-gray-900">BLS/CPR Certification</label>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.hasBlsCpr}
                onChange={(e) => handleChange("hasBlsCpr", e.target.checked)}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
              />
              <span className="text-base text-gray-900">I have a current BLS/CPR certification</span>
            </label>
          </div>

          {!formData.hasBlsCpr && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>BLS/CPR certification is required to be considered as a provider for RUSH.</strong>
              </p>
              <p className="text-sm text-yellow-700">
                You can obtain your certificate from the American Heart Association (AHA) BLS/CPR program.{" "}
                <a
                  href="https://www.redcross.org/local/michigan/take-a-class/bls-detroit-mi#:~:text=BLS%20Certification%20&%20Renewal%20in%20Detroit%2C%20MI%20%7C%20Red%20Cross"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Click here to find BLS/CPR classes
                </a>
              </p>
            </div>
          )}

          {formData.hasBlsCpr && (
            <div className="mt-4">
              <div className="w-full h-40 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative border-2 border-dashed border-gray-300">
                {formData.blsCprImagePreview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={formData.blsCprImagePreview || "/placeholder.svg"}
                      alt="BLS/CPR certificate preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">No BLS/CPR certificate uploaded</span>
                  </div>
                )}
              </div>
              <label className="cursor-pointer text-blue-500 hover:text-blue-700 font-medium">
                Upload BLS/CPR Certificate
                <input type="file" accept="image/*" className="hidden" onChange={handleBlsCprUpload} />
              </label>
            </div>
          )}
        </div>

        {/* TB Test Results */}
        <div className="mb-6">
          <label className="block mb-2 text-base font-medium text-gray-900">
            TB Test Results (within last 12 months) *
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Please upload your tuberculosis test results from within the last 12 months.
          </p>

          <div className="w-full h-40 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative border-2 border-dashed border-gray-300">
            {formData.tbTestImagePreview ? (
              <div className="relative w-full h-full">
                <Image
                  src={formData.tbTestImagePreview || "/placeholder.svg"}
                  alt="TB test results preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">No TB test results uploaded</span>
              </div>
            )}
          </div>
          <label className="cursor-pointer text-blue-500 hover:text-blue-700 font-medium">
            Upload TB Test Results
            <input type="file" accept="image/*" className="hidden" onChange={handleTbTestUpload} />
          </label>
        </div>

        {/* Wound Care Certification */}
        <div className="mb-6">
          <label className="block mb-2 text-base font-medium text-gray-900">Wound Care Experience</label>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.hasWoundCareExperience}
                onChange={(e) => handleChange("hasWoundCareExperience", e.target.checked)}
                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
              />
              <span className="text-base text-gray-900">I have experience in wound care</span>
            </label>
          </div>

          {formData.hasWoundCareExperience && (
            <div className="mt-4">
              <label className="block mb-2 text-base font-medium text-gray-900">Wound Care Certification *</label>
              <p className="text-sm text-gray-600 mb-4">
                Since you have wound care experience, please upload your wound care certification.
              </p>

              <div className="w-full h-40 bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative border-2 border-dashed border-gray-300">
                {formData.woundCareImagePreview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={formData.woundCareImagePreview || "/placeholder.svg"}
                      alt="Wound care certificate preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">No wound care certificate uploaded</span>
                  </div>
                )}
              </div>
              <label className="cursor-pointer text-blue-500 hover:text-blue-700 font-medium">
                Upload Wound Care Certificate
                <input type="file" accept="image/*" className="hidden" onChange={handleWoundCareUpload} />
              </label>
            </div>
          )}
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

export default ProfessionalCredentials