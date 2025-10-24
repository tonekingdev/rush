/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { FadeInView } from "../components/FadeInView"
import type React from "react"

type FormInputs = {
  fullName: string
  dateOfBirth: string
  phoneNumber: string
  email: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  nursingLicenseNumber: string
  issuingState: string
  licenseExpirationDate: string
  npiNumber: string
  cprExpirationDate: string
  hasMalpracticeInsurance: string
  workAuthorization: string
  disciplinaryActions: string
  disciplinaryExplanation: string
  yearsOfExperience: string
  primarySpecialty: string
  employers: {
    facilityName: string
    position: string
    startDate: string
    endDate: string
    responsibilities: string
  }[]
  skills: string[]
  additionalSkills: string
  preferredWorkType: string
  shiftAvailability: string[]
  travelDistance: string
  backgroundCheckConsent: string
  signature: string
  signatureDate: string
  driverLicense: FileList
  resume: FileList
  nursingLicense: FileList
  cprCertification: FileList
  malpracticeInsurance: FileList
  reference1Name: string
  reference1Relationship: string
  reference1Phone: string
  reference2Name: string
  reference2Relationship: string
  reference2Phone: string
}

const ProviderApplication: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsSubmitting(true)
    setSubmitError(null)

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof FileList) {
        for (let i = 0; i < value.length; i++) {
          formData.append(key, value[i])
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === "object") {
            Object.entries(item).forEach(([subKey, subValue]) => {
              formData.append(`${key}[${index}][${subKey}]`, subValue.toString())
            })
          } else {
            formData.append(`${key}[]`, item.toString())
          }
        })
      } else {
        formData.append(key, value.toString())
      }
    })

    try {
      const response = await fetch("/submit-provider-application.php", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit application")
      }

      setSubmitSuccess(true)
    } catch (error) {
      setSubmitError("An error occurred while submitting your application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Application Submitted</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Thank you for submitting your application. We will review it and get back to you soon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInView>
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">RUSH Nurse Application Form</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">1. Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  {...register("fullName", { required: "Full name is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  {...register("dateOfBirth", { required: "Date of birth is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  {...register("phoneNumber", { required: "Phone number is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email", { required: "Email is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Home Address
              </label>
              <textarea
                id="address"
                {...register("address", { required: "Address is required" })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  {...register("emergencyContactName", { required: "Emergency contact name is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.emergencyContactName && (
                  <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700">
                  Emergency Contact Phone Number
                </label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  {...register("emergencyContactPhone", { required: "Emergency contact phone is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.emergencyContactPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone.message}</p>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-6">2. Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nursingLicenseNumber" className="block text-sm font-medium text-gray-700">
                  Nursing License Number
                </label>
                <input
                  type="text"
                  id="nursingLicenseNumber"
                  {...register("nursingLicenseNumber", { required: "Nursing license number is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.nursingLicenseNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.nursingLicenseNumber.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="issuingState" className="block text-sm font-medium text-gray-700">
                  Issuing State
                </label>
                <input
                  type="text"
                  id="issuingState"
                  {...register("issuingState", { required: "Issuing state is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.issuingState && <p className="mt-1 text-sm text-red-600">{errors.issuingState.message}</p>}
              </div>
              <div>
                <label htmlFor="licenseExpirationDate" className="block text-sm font-medium text-gray-700">
                  License Expiration Date
                </label>
                <input
                  type="date"
                  id="licenseExpirationDate"
                  {...register("licenseExpirationDate", { required: "License expiration date is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.licenseExpirationDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.licenseExpirationDate.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="npiNumber" className="block text-sm font-medium text-gray-700">
                  NPI Number (if applicable)
                </label>
                <input
                  type="text"
                  id="npiNumber"
                  {...register("npiNumber")}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="cprExpirationDate" className="block text-sm font-medium text-gray-700">
                  CPR Certification Expiration Date
                </label>
                <input
                  type="date"
                  id="cprExpirationDate"
                  {...register("cprExpirationDate", { required: "CPR expiration date is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.cprExpirationDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.cprExpirationDate.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="block text-sm font-medium text-gray-700">Do you currently have malpractice insurance?</p>
              <div className="mt-2 space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register("hasMalpracticeInsurance", { required: "Please select an option" })}
                    value="yes"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register("hasMalpracticeInsurance", { required: "Please select an option" })}
                    value="no"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
              {errors.hasMalpracticeInsurance && (
                <p className="mt-1 text-sm text-red-600">{errors.hasMalpracticeInsurance.message}</p>
              )}
            </div>

            <div className="mt-6">
              <p className="block text-sm font-medium text-gray-700">Are you legally authorized to work in the U.S.?</p>
              <div className="mt-2 space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register("workAuthorization", { required: "Please select an option" })}
                    value="yes"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register("workAuthorization", { required: "Please select an option" })}
                    value="no"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
              {errors.workAuthorization && (
                <p className="mt-1 text-sm text-red-600">{errors.workAuthorization.message}</p>
              )}
            </div>

            <div className="mt-6">
              <p className="block text-sm font-medium text-gray-700">
                Have you ever had disciplinary actions against your license?
              </p>
              <div className="mt-2 space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register("disciplinaryActions", { required: "Please select an option" })}
                    value="yes"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register("disciplinaryActions", { required: "Please select an option" })}
                    value="no"
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
              {errors.disciplinaryActions && (
                <p className="mt-1 text-sm text-red-600">{errors.disciplinaryActions.message}</p>
              )}
            </div>

            <div className="mt-6">
              <label htmlFor="disciplinaryExplanation" className="block text-sm font-medium text-gray-700">
                If yes, please explain:
              </label>
              <textarea
                id="disciplinaryExplanation"
                {...register("disciplinaryExplanation")}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-6">3. Nursing Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                  Years of Nursing Experience
                </label>
                <input
                  type="number"
                  id="yearsOfExperience"
                  {...register("yearsOfExperience", { required: "Years of experience is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.yearsOfExperience && (
                  <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="primarySpecialty" className="block text-sm font-medium text-gray-700">
                  Primary Specialty
                </label>
                <input
                  type="text"
                  id="primarySpecialty"
                  {...register("primarySpecialty", { required: "Primary specialty is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.primarySpecialty && (
                  <p className="mt-1 text-sm text-red-600">{errors.primarySpecialty.message}</p>
                )}
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-4">Previous Employment (Last 3 Jobs)</h3>
            {[0, 1, 2].map((index) => (
              <div key={index} className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-medium mb-4">Employer {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor={`employers.${index}.facilityName`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Facility Name
                    </label>
                    <input
                      type="text"
                      id={`employers.${index}.facilityName`}
                      {...register(`employers.${index}.facilityName` as const, {
                        required: "Facility name is required",
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.employers?.[index]?.facilityName && (
                      <p className="mt-1 text-sm text-red-600">{errors.employers[index].facilityName?.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`employers.${index}.position`} className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <input
                      type="text"
                      id={`employers.${index}.position`}
                      {...register(`employers.${index}.position` as const, { required: "Position is required" })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.employers?.[index]?.position && (
                      <p className="mt-1 text-sm text-red-600">{errors.employers[index].position?.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`employers.${index}.startDate`} className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id={`employers.${index}.startDate`}
                      {...register(`employers.${index}.startDate` as const, { required: "Start date is required" })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.employers?.[index]?.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.employers[index].startDate?.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`employers.${index}.endDate`} className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      id={`employers.${index}.endDate`}
                      {...register(`employers.${index}.endDate` as const, { required: "End date is required" })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.employers?.[index]?.endDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.employers[index].endDate?.message}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor={`employers.${index}.responsibilities`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Responsibilities
                  </label>
                  <textarea
                    id={`employers.${index}.responsibilities`}
                    {...register(`employers.${index}.responsibilities` as const, {
                      required: "Responsibilities are required",
                    })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                  {errors.employers?.[index]?.responsibilities && (
                    <p className="mt-1 text-sm text-red-600">{errors.employers[index].responsibilities?.message}</p>
                  )}
                </div>
              </div>
            ))}

            <h2 className="text-2xl font-semibold mt-12 mb-6">4. Skills & Certifications</h2>
            <div className="space-y-4">
              {[
                "IV Therapy Certification",
                "Wound Care Certification",
                "ACLS (Advanced Cardiac Life Support)",
                "PALS (Pediatric Advanced Life Support)",
                "BLS (Basic Life Support)",
                "Home Health Experience",
                "Telehealth Experience",
                "EKG Interpretation",
              ].map((skill) => (
                <div key={skill} className="flex items-center">
                  <input
                    type="checkbox"
                    id={skill}
                    value={skill}
                    {...register("skills")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={skill} className="ml-2 block text-sm text-gray-900">
                    {skill}
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label htmlFor="additionalSkills" className="block text-sm font-medium text-gray-700">
                Additional Relevant Skills
              </label>
              <textarea
                id="additionalSkills"
                {...register("additionalSkills")}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-6">5. Availability & Preferences</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="preferredWorkType" className="block text-sm font-medium text-gray-700">
                  Preferred Work Type
                </label>
                <select
                  id="preferredWorkType"
                  {...register("preferredWorkType", { required: "Preferred work type is required" })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select work type</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="PRN">PRN (As Needed)</option>
                </select>
                {errors.preferredWorkType && (
                  <p className="mt-1 text-sm text-red-600">{errors.preferredWorkType.message}</p>
                )}
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">Shift Availability</span>
                <div className="mt-2 space-x-4">
                  {["Day", "Night", "Weekends", "Flexible"].map((shift) => (
                    <label key={shift} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={shift}
                        {...register("shiftAvailability")}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">{shift}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="travelDistance" className="block text-sm font-medium text-gray-700">
                  Willing to Travel Within
                </label>
                <select
                  id="travelDistance"
                  {...register("travelDistance", { required: "Travel distance is required" })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select travel distance</option>
                  <option value="10 miles">10 miles</option>
                  <option value="25 miles">25 miles</option>
                  <option value="50+ miles">50+ miles</option>
                </select>
                {errors.travelDistance && <p className="mt-1 text-sm text-red-600">{errors.travelDistance.message}</p>}
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-6">6. Background Check & Photo Identification</h2>
            <div className="space-y-6">
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  Are you willing to undergo a background check?
                </span>
                <div className="mt-2 space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      {...register("backgroundCheckConsent", { required: "Please select an option" })}
                      value="true"
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      {...register("backgroundCheckConsent", { required: "Please select an option" })}
                      value="false"
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
                {errors.backgroundCheckConsent && (
                  <p className="mt-1 text-sm text-red-600">{errors.backgroundCheckConsent.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Required Identification Documents
                </label>
                <div className="mt-2 space-y-2">
                  <div>
                    <label htmlFor="driverLicense" className="inline-flex items-center">
                      <input
                        type="file"
                        id="driverLicense"
                        accept="image/*,.pdf"
                        {...register("driverLicense", { required: "Driver's License or Government ID is required" })}
                        className="sr-only"
                      />
                      <span className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Driver&apos;s License or Government ID
                      </span>
                    </label>
                    {errors.driverLicense && (
                      <p className="mt-1 text-sm text-red-600">{errors.driverLicense.message as string}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="resume" className="inline-flex items-center">
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf,.doc,.docx"
                        {...register("resume", {})}
                        className="sr-only"
                      />
                      <span className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Resume
                      </span>
                    </label>
                  </div>
                  <div>
                    <label htmlFor="nursingLicense" className="inline-flex items-center">
                      <input
                        type="file"
                        id="nursingLicense"
                        accept="image/*,.pdf"
                        {...register("nursingLicense", { required: "Nursing License Copy is required" })}
                        className="sr-only"
                      />
                      <span className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Nursing License Copy
                      </span>
                    </label>
                    {errors.nursingLicense && (
                      <p className="mt-1 text-sm text-red-600">{errors.nursingLicense.message as string}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cprCertification" className="inline-flex items-center">
                      <input
                        type="file"
                        id="cprCertification"
                        accept="image/*,.pdf"
                        {...register("cprCertification", { required: "CPR Certification is required" })}
                        className="sr-only"
                      />
                      <span className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        CPR Certification
                      </span>
                    </label>
                    {errors.cprCertification && (
                      <p className="mt-1 text-sm text-red-600">{errors.cprCertification.message as string}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="malpracticeInsurance" className="inline-flex items-center">
                      <input
                        type="file"
                        id="malpracticeInsurance"
                        accept="image/*,.pdf"
                        {...register("malpracticeInsurance", {})}
                        className="sr-only"
                      />
                      <span className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Proof of Malpractice Insurance (if applicable)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-6">7. References</h2>
            <div className="space-y-6">
              {[1, 2].map((index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-lg font-medium">Reference {index}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor={`reference${index}Name`} className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        id={`reference${index}Name`}
                        {...register(`reference${index}Name` as "reference1Name" | "reference2Name", {
                          required: "Reference name is required",
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[`reference${index}Name` as "reference1Name" | "reference2Name"] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`reference${index}Name` as "reference1Name" | "reference2Name"]?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor={`reference${index}Relationship`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Relationship
                      </label>
                      <input
                        type="text"
                        id={`reference${index}Relationship`}
                        {...register(
                          `reference${index}Relationship` as "reference1Relationship" | "reference2Relationship",
                          {
                            required: "Reference relationship is required",
                          },
                        )}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[
                        `reference${index}Relationship` as "reference1Relationship" | "reference2Relationship"
                      ] && (
                        <p className="mt-1 text-sm text-red-600">
                          {
                            errors[
                              `reference${index}Relationship` as "reference1Relationship" | "reference2Relationship"
                            ]?.message
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor={`reference${index}Phone`} className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id={`reference${index}Phone`}
                        {...register(`reference${index}Phone` as "reference1Phone" | "reference2Phone", {
                          required: "Reference phone number is required",
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors[`reference${index}Phone` as "reference1Phone" | "reference2Phone"] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`reference${index}Phone` as "reference1Phone" | "reference2Phone"]?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-6">8. Signature & Agreement</h2>
            <div className="space-y-6">
              <p className="text-sm text-gray-700">
                I certify that all information provided is accurate and truthful. I understand that any false statements
                may result in disqualification from the application process.
              </p>
              <p className="text-sm text-gray-700">
                I acknowledge that I am applying as a 1099 independent contractor with RUSH, meaning I am responsible
                for maintaining my own malpractice insurance and managing my own taxes.
              </p>
              <p className="text-sm text-gray-700">
                I also acknowledge that I am required to undergo a background check before being approved to work with
                RUSH.
              </p>
              <div>
                <label htmlFor="signature" className="block text-sm font-medium text-gray-700">
                  Applicant Signature
                </label>
                <input
                  type="text"
                  id="signature"
                  {...register("signature", { required: "Signature is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.signature && <p className="mt-1 text-sm text-red-600">{errors.signature.message}</p>}
              </div>
              <div>
                <label htmlFor="signatureDate" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="signatureDate"
                  {...register("signatureDate", { required: "Signature date is required" })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.signatureDate && <p className="mt-1 text-sm text-red-600">{errors.signatureDate.message}</p>}
              </div>
            </div>

            {submitError && (
              <div
                className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {submitError}</span>
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </FadeInView>
      </div>
    </div>
  )
}

export default ProviderApplication

