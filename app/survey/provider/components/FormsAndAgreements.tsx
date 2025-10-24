"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { CustomSignaturePad } from "./CustomSignaturePad"
import {
  generateLiabilityPDF,
  generateExclusionPDF,
  generateDrugAlcoholPDF,
  generateCitizenshipPDF,
  generateNonCompetePDF,
} from "../utils/pdfGenerator"

// Enhanced type definition that matches the PDF generator interface
interface FormDataWithComplexTypes {
  firstName: string
  lastName: string
  username: string
  fullAddress: string
  phone: string
  liabilityFormSigned: boolean
  liabilitySignature: string
  liabilitySignatureDate: string
  backgroundCheckAcknowledged: boolean
  malpracticeInsuranceAcknowledged: boolean
  licenseType: string
  licenseNumber: string
  malpracticeInsuranceProvider: string
  exclusionScreeningSigned: boolean
  exclusionScreeningSignature: string
  exclusionScreeningSignatureDate: string
  drugAlcoholFormSigned: boolean
  drugAlcoholSignature: string
  drugAlcoholSignatureDate: string
  citizenshipAttestationSigned: boolean
  citizenshipSignature: string
  citizenshipSignatureDate: string
  dateOfBirth: string
  positionAppliedFor: string
  citizenshipStatus: string
  // NEW: Non-Compete Clause fields
  nonCompeteSigned: boolean
  nonCompeteSignature: string
  nonCompeteSignatureDate: string
  // Add index signature for compatibility
  [key: string]: string | boolean
}

interface FormsAndAgreementsProps {
  formData: FormDataWithComplexTypes
  handleChange: (input: string, value: string | number | boolean) => void
  prevStep: () => void
  handleSubmit: (pdfFiles?: Record<string, File>) => void
  isSubmitting: boolean
}

const FormsAndAgreements: React.FC<FormsAndAgreementsProps> = ({
  formData,
  handleChange,
  prevStep,
  handleSubmit,
  isSubmitting,
}) => {
  // State management
  const [showLiabilityForm, setShowLiabilityForm] = useState(false)
  const [showBackgroundForm, setShowBackgroundForm] = useState(false)
  const [showMalpracticeForm, setShowMalpracticeForm] = useState(false)
  const [showExclusionForm, setShowExclusionForm] = useState(false)
  const [showDrugAlcoholForm, setShowDrugAlcoholForm] = useState(false)
  const [showCitizenshipForm, setShowCitizenshipForm] = useState(false)
  const [showNonCompeteForm, setShowNonCompeteForm] = useState(false) // NEW

  const [isMobile, setIsMobile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPDFs, setIsGeneratingPDFs] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      try {
        setIsMobile(window.innerWidth < 768)
      } catch (err) {
        console.error("Error checking mobile status:", err)
        setIsMobile(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Safe property access with fallbacks
  const getFormValue = useCallback(
    (key: string, defaultValue: string | boolean = "") => {
      try {
        return formData[key] ?? defaultValue
      } catch (err) {
        console.error(`Error accessing form data key: ${key}`, err)
        return defaultValue
      }
    },
    [formData],
  )

  // Signature handlers - DON'T close forms automatically
  const handleLiabilitySignatureSave = useCallback(
    (dataURL: string) => {
      handleChange("liabilitySignature", dataURL)
      handleChange("liabilitySignatureDate", new Date().toISOString().split("T")[0])
      handleChange("liabilityFormSigned", true)
      setError(null)
    },
    [handleChange],
  )

  const handleLiabilitySignatureClear = useCallback(() => {
    handleChange("liabilitySignature", "")
    handleChange("liabilityFormSigned", false)
  }, [handleChange])

  const handleExclusionSignatureSave = useCallback(
    (dataURL: string) => {
      handleChange("exclusionScreeningSignature", dataURL)
      handleChange("exclusionScreeningSignatureDate", new Date().toISOString().split("T")[0])
      handleChange("exclusionScreeningSigned", true)
      setError(null)
    },
    [handleChange],
  )

  const handleExclusionSignatureClear = useCallback(() => {
    handleChange("exclusionScreeningSignature", "")
    handleChange("exclusionScreeningSigned", false)
  }, [handleChange])

  const handleDrugAlcoholSignatureSave = useCallback(
    (dataURL: string) => {
      handleChange("drugAlcoholSignature", dataURL)
      handleChange("drugAlcoholSignatureDate", new Date().toISOString().split("T")[0])
      handleChange("drugAlcoholFormSigned", true)
      setError(null)
    },
    [handleChange],
  )

  const handleDrugAlcoholSignatureClear = useCallback(() => {
    handleChange("drugAlcoholSignature", "")
    handleChange("drugAlcoholFormSigned", false)
  }, [handleChange])

  const handleCitizenshipSignatureSave = useCallback(
    (dataURL: string) => {
      handleChange("citizenshipSignature", dataURL)
      handleChange("citizenshipSignatureDate", new Date().toISOString().split("T")[0])
      handleChange("citizenshipAttestationSigned", true)
      setError(null)
    },
    [handleChange],
  )

  const handleCitizenshipSignatureClear = useCallback(() => {
    handleChange("citizenshipSignature", "")
    handleChange("citizenshipAttestationSigned", false)
  }, [handleChange])

  // NEW: Non-Compete signature handlers
  const handleNonCompeteSignatureSave = useCallback(
    (dataURL: string) => {
      handleChange("nonCompeteSignature", dataURL)
      handleChange("nonCompeteSignatureDate", new Date().toISOString().split("T")[0])
      handleChange("nonCompeteSigned", true)
      setError(null)
    },
    [handleChange],
  )

  const handleNonCompeteSignatureClear = useCallback(() => {
    handleChange("nonCompeteSignature", "")
    handleChange("nonCompeteSigned", false)
  }, [handleChange])

  // Form submission with better error handling and timeout
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      // Validate form
      if (!getFormValue("liabilityFormSigned", false)) {
        setError("Please sign the Professional Liability Waiver")
        return
      }

      if (!getFormValue("backgroundCheckAcknowledged", false)) {
        setError("Please acknowledge the Background Check Instructions")
        return
      }

      if (!getFormValue("malpracticeInsuranceAcknowledged", false)) {
        setError("Please acknowledge the Malpractice Insurance Worksheet")
        return
      }

      if (!getFormValue("exclusionScreeningSigned", false)) {
        setError("Please sign the Provider Exclusion Screening Policy & Acknowledgment")
        return
      }

      if (!getFormValue("drugAlcoholFormSigned", false)) {
        setError("Please sign the Drug and Alcohol-Free Workplace Acknowledgment Form")
        return
      }

      if (!getFormValue("citizenshipAttestationSigned", false)) {
        setError("Please sign the Citizenship Attestation")
        return
      }

      // NEW: Validate Non-Compete signature
      if (!getFormValue("nonCompeteSigned", false)) {
        setError("Please sign the Non-Compete & Independent Contractor Liability Clause")
        return
      }

      // Show PDF generation status
      setIsGeneratingPDFs(true)
      setError("Generating signed documents...")

      // Generate PDFs for signed documents with timeout
      const pdfPromises = [
        generateLiabilityPDF(formData),
        generateExclusionPDF(formData),
        generateDrugAlcoholPDF(formData),
        generateCitizenshipPDF(formData),
        generateNonCompetePDF(formData), // NEW
      ]

      // Add timeout to PDF generation
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("PDF generation timeout")), 30000),
      )

      const [liabilityPDF, exclusionPDF, drugAlcoholPDF, citizenshipPDF, nonCompetePDF] = (await Promise.race([
        Promise.all(pdfPromises),
        timeoutPromise,
      ])) as [File, File, File, File, File]

      setIsGeneratingPDFs(false)
      setError("Submitting application...")

      // Pass the generated PDFs to the handleSubmit function
      handleSubmit({
        liabilityPDF,
        exclusionPDF,
        drugAlcoholPDF,
        citizenshipPDF,
        nonCompetePDF, // NEW
      })
    } catch (error) {
      console.error("Error in form submission:", error)
      setIsGeneratingPDFs(false)

      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          setError("PDF generation is taking longer than expected. Please try again.")
        } else {
          setError(`Error generating documents: ${error.message}`)
        }
      } else {
        setError("There was an error generating the signed documents. Please try again.")
      }
    }
  }

  // Form view handler
  const handleViewForm = useCallback(
    (formType: string) => {
      try {
        let newState = false

        switch (formType) {
          case "liability":
            newState = !showLiabilityForm
            setShowLiabilityForm(newState)
            break
          case "background":
            newState = !showBackgroundForm
            setShowBackgroundForm(newState)
            break
          case "malpractice":
            newState = !showMalpracticeForm
            setShowMalpracticeForm(newState)
            break
          case "exclusion":
            newState = !showExclusionForm
            setShowExclusionForm(newState)
            break
          case "drugAlcohol":
            newState = !showDrugAlcoholForm
            setShowDrugAlcoholForm(newState)
            break
          case "citizenship":
            newState = !showCitizenshipForm
            setShowCitizenshipForm(newState)
            break
          case "nonCompete": // NEW
            newState = !showNonCompeteForm
            setShowNonCompeteForm(newState)
            break
          default:
            console.warn(`Unknown form type: ${formType}`)
            return
        }

        // If opening the form on mobile, scroll to it
        if (newState && isMobile) {
          setTimeout(() => {
            try {
              const formElement = document.getElementById(`${formType}-form-content`)
              if (formElement) {
                formElement.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            } catch (scrollError) {
              console.error("Error scrolling to form:", scrollError)
            }
          }, 100)
        }
      } catch (err) {
        console.error("Error handling form view:", err)
        setError("Failed to toggle form view. Please try again.")
      }
    },
    [
      showLiabilityForm,
      showBackgroundForm,
      showMalpracticeForm,
      showExclusionForm,
      showDrugAlcoholForm,
      showCitizenshipForm,
      showNonCompeteForm, // NEW
      isMobile,
    ],
  )

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Forms and Agreements</h2>
      <p className="text-gray-600 mb-6">Please review and complete the following forms to finalize your application.</p>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Professional Liability Waiver */}
        <div className="p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Professional Liability Waiver</h3>
          <p className="text-gray-600 mb-4">This form requires your signature. Please review and sign the waiver.</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleViewForm("liability")}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition duration-300"
            >
              {showLiabilityForm ? "Hide Form" : "View Form"}
            </button>

            <a
              href="/Professional_Liability_Waiver_Updated.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download PDF
            </a>

            {getFormValue("liabilityFormSigned", false) && (
              <span className="text-green-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Signed
              </span>
            )}
          </div>

          {showLiabilityForm && (
            <div id="liability-form-content" className="border rounded-md p-4 mb-6">
              <h4 className="text-center font-bold mb-4">
                Professional Liability Waiver and Indemnification Agreement
              </h4>
              <p className="mb-2">
                This Professional Liability Waiver (&quot;Waiver&quot;) is entered into by and between RUSH Servicing
                LLC (&quot;Company&quot;) and the undersigned independent contractor (&quot;Provider&quot;).
              </p>

              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li>
                  <strong>Acknowledgment of Independent Status</strong>
                  <br />
                  The Provider acknowledges they are an independent contractor and not an employee of RUSH Servicing
                  LLC.
                </li>

                <li>
                  <strong>Provider&apos;s Responsibility for Professional Services</strong>
                  <br />
                  The Provider agrees and understands that they are solely responsible for maintaining appropriate and
                  active malpractice insurance coverage and for the quality and safety of the professional services they
                  provide to patients.
                </li>

                <li>
                  <strong>Waiver of Liability</strong>
                  <br />
                  The Provider hereby waives, releases, and discharges RUSH Servicing LLC, its officers, directors,
                  employees, agents, and affiliates from any and all claims, demands, actions, or causes of action
                  arising out of or related to any alleged malpractice, negligence, or breach of professional duty
                  committed by the Provider.
                </li>

                <li>
                  <strong>Indemnification</strong>
                  <br />
                  The Provider agrees to defend, indemnify, and hold harmless RUSH Servicing LLC from any and all
                  liabilities, claims, costs, or expenses (including reasonable attorney&apos;s fees) arising from any
                  act, omission, or negligence by the Provider in connection with the provision of services to patients.
                </li>

                <li>
                  <strong>Insurance Requirement</strong>
                  <br />
                  The Provider certifies they maintain active malpractice insurance with minimum coverage of
                  $200,000-$600,000 and agrees to furnish proof of such insurance upon request.
                </li>

                <li>
                  <strong>Entire Agreement</strong>
                  <br />
                  This Waiver constitutes the entire agreement between the parties regarding liability and
                  indemnification and supersedes any prior agreements.
                </li>
              </ol>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Provider Information:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="liability-licenseType" className="block mb-2 text-base font-medium text-gray-900">
                      License Type
                    </label>
                    <input
                      type="text"
                      id="liability-licenseType"
                      value={String(getFormValue("licenseType", ""))}
                      onChange={(e) => handleChange("licenseType", e.target.value)}
                      required
                      className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="liability-licenseNumber" className="block mb-2 text-base font-medium text-gray-900">
                      License Number
                    </label>
                    <input
                      type="text"
                      id="liability-licenseNumber"
                      value={String(getFormValue("licenseNumber", ""))}
                      onChange={(e) => handleChange("licenseNumber", e.target.value)}
                      required
                      className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="liability-malpracticeInsuranceProvider"
                    className="block mb-2 text-base font-medium text-gray-900"
                  >
                    Malpractice Insurance Provider
                  </label>
                  <input
                    type="text"
                    id="liability-malpracticeInsuranceProvider"
                    value={String(getFormValue("malpracticeInsuranceProvider", ""))}
                    onChange={(e) => handleChange("malpracticeInsuranceProvider", e.target.value)}
                    required
                    className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="block mb-2 text-base font-medium text-gray-900">Signature</div>
                <CustomSignaturePad
                  onSave={handleLiabilitySignatureSave}
                  onClear={handleLiabilitySignatureClear}
                  existingSignature={String(getFormValue("liabilitySignature", ""))}
                  width={400}
                  height={160}
                />
              </div>
            </div>
          )}
        </div>

        {/* Provider Exclusion Screening Policy & Acknowledgment */}
        <div className="p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Provider Exclusion Screening Policy & Acknowledgment</h3>
          <p className="text-gray-600 mb-4">
            This form requires your signature. Please review and sign the acknowledgment.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleViewForm("exclusion")}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition duration-300"
            >
              {showExclusionForm ? "Hide Form" : "View Form"}
            </button>

            <a
              href="/Provider_Exclusion_Screening_Policy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download PDF
            </a>

            {getFormValue("exclusionScreeningSigned", false) && (
              <span className="text-green-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Signed
              </span>
            )}
          </div>

          {showExclusionForm && (
            <div id="exclusion-form-content" className="border rounded-md p-4 mb-6">
              <h4 className="text-center font-bold mb-4">RUSH Provider Exclusion Screening Policy & Acknowledgment</h4>
              <p className="mb-2 text-sm text-gray-600">Effective Date: May 03, 2025</p>
              <p className="mb-4 text-sm text-gray-600">Applies To: All Providers, Contractors, and Staff</p>

              <h5 className="font-medium mb-2">Purpose:</h5>
              <p className="mb-4">
                To ensure that RUSH Servicing LLC remains compliant with federal regulations by prohibiting the
                employment or contracting of any individual or entity excluded from participation in federally funded
                healthcare programs.
              </p>

              <h5 className="font-medium mb-2">Policy:</h5>
              <p className="mb-4">
                RUSH will not hire or contract with any individual or entity that appears on the Office of Inspector
                General&apos;s List of Excluded Individuals and Entities (LEIE) or the System for Award Management (SAM)
                exclusion database.
              </p>

              <div className="border-t border-gray-300 pt-4 mt-6">
                <h5 className="font-bold mb-4">Provider Acknowledgment & Signature</h5>
                <p className="mb-4">
                  By signing below, I acknowledge that I have read and understand the RUSH Provider Exclusion Screening
                  Policy. I affirm that I am not currently listed on the OIG LEIE or SAM exclusion databases.
                </p>

                <div className="mb-4">
                  <div className="block mb-2 text-base font-medium text-gray-900">Provider Signature</div>
                  <CustomSignaturePad
                    onSave={handleExclusionSignatureSave}
                    onClear={handleExclusionSignatureClear}
                    existingSignature={String(getFormValue("exclusionScreeningSignature", ""))}
                    width={400}
                    height={160}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Background Check Instructions */}
        <div className="p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Background Check Instructions</h3>
          <p className="text-gray-600 mb-4">Please review the background check instructions.</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleViewForm("background")}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition duration-300"
            >
              {showBackgroundForm ? "Hide Instructions" : "View Instructions"}
            </button>

            <a
              href="/Background_Check_Instructions.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download PDF
            </a>
          </div>

          {showBackgroundForm && (
            <div id="background-form-content" className="border rounded-md p-4 mb-4">
              <h4 className="text-center font-bold mb-4">Background Check Instructions for Independent Contractors</h4>
              <p className="mb-4">Dear Provider,</p>
              <p className="mb-4">Thank you for your interest in contracting with RUSH Servicing LLC.</p>
              <p className="mb-4">
                To finalize your application, you are required to complete a criminal background check.
              </p>

              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li>
                  <strong>Schedule Your Background Check Appointment</strong>
                  <br />- Visit: https://www.identogo.com/
                  <br />- Select your state (e.g., Michigan)
                  <br />- Choose &apos;Schedule Appointment&apos; or &apos;Find a Location&apos;
                </li>

                <li>
                  <strong>Choose the Correct Service/Reason Code</strong>
                  <br />- Service: Employment/Healthcare Provider
                </li>

                <li>
                  <strong>Complete Your Fingerprinting</strong>
                  <br />- Attend your appointment at your selected IdentoGO location.
                  <br />- Bring a valid, government-issued photo ID (Driver&apos;s License, Passport, etc.)
                </li>

                <li>
                  <strong>Receive Your Background Check Results</strong>
                  <br />- Once completed, you will receive a copy of your background check results directly from
                  IdentoGO or the state agency.
                </li>

                <li>
                  <strong>Submit Your Results to RUSH</strong>
                  <br />- Deadline: Submit within 7 days of receiving your results.
                  <br />- How to Submit:
                  <br />* Upload securely using the RUSH Provider Application Portal (preferred)
                  <br />* OR email a copy to: credentialing@rushhealthc.com (secure email address)
                </li>
              </ol>

              <p className="font-medium mb-2">Important Reminders:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>RUSH does not accept incomplete background checks.</li>
                <li>Failure to submit background check results will delay your onboarding.</li>
                <li>You are responsible for all costs associated with obtaining your background check.</li>
              </ul>

              <p className="mb-2">If you have any questions, please contact us at:</p>
              <p>Email: credentialing@rushhealthc.com</p>
              <p>Phone: 586-344-4567</p>
            </div>
          )}

          <div className="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              id="backgroundCheckAcknowledged"
              checked={Boolean(getFormValue("backgroundCheckAcknowledged", false))}
              onChange={(e) => handleChange("backgroundCheckAcknowledged", e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="backgroundCheckAcknowledged" className="text-base text-gray-900">
              I acknowledge that I have read and understand the background check instructions
            </label>
          </div>
        </div>

        {/* Malpractice Insurance Worksheet */}
        <div className="p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Malpractice Insurance Worksheet</h3>
          <p className="text-gray-600 mb-4">Please review the malpractice insurance requirements.</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleViewForm("malpractice")}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition duration-300"
            >
              {showMalpracticeForm ? "Hide Worksheet" : "View Worksheet"}
            </button>

            <a
              href="/Malpractice_Insurance_Worksheet.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download PDF
            </a>
          </div>

          {showMalpracticeForm && (
            <div id="malpractice-form-content" className="border rounded-md p-4 mb-4">
              <h4 className="text-center font-bold mb-4">Malpractice Insurance Worksheet for Providers</h4>
              <h5 className="font-medium mb-2">Minimum Malpractice Insurance Requirements in Michigan</h5>
              <ul className="list-disc pl-6 mb-4">
                <li>No legal mandate, but highly recommended for healthcare providers.</li>
                <li>Standard coverage: $200k/$600k.</li>
              </ul>

              <h5 className="font-medium mb-2">Malpractice Insurance Worksheet Steps:</h5>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li>
                  <strong>Determine Required Coverage Limits</strong>
                  <br />- Standard in Michigan is $200k/$600k.
                  <br />- Check with affiliated hospitals for specific requirements.
                </li>

                <li>
                  <strong>Identify Your Specialty and Risk Level</strong>
                  <br />- Higher-risk specialties may need more coverage.
                </li>

                <li>
                  <strong>Choose the Type of Policy</strong>
                  <br />- Claims-Made vs. Occurrence Policies.
                </li>

                <li>
                  <strong>Research and Compare Insurance Providers</strong>
                  <br />- Get multiple quotes to compare.
                </li>

                <li>
                  <strong>Review Policy Details Carefully</strong>
                  <br />- Understand exclusions, deductibles, and additional options.
                </li>

                <li>
                  <strong>Maintain Documentation</strong>
                  <br />- Save your Certificate of Insurance (COI) for RUSH credentialing.
                </li>
              </ol>

              <h5 className="font-medium mb-2">Recommended Insurance Providers:</h5>
              <ul className="list-disc pl-6 mb-4">
                <li>The Doctors Company: https://www.thedoctors.com/</li>
                <li>MedPro Group: https://www.medpro.com/</li>
                <li>ProAssurance: https://www.proassurance.com/</li>
                <li>HPSO: https://www.hpso.com/</li>
                <li>CM&F Group: https://www.cmfgroup.com/professional-liability-insurance/</li>
                <li>Proliability: https://www.proliability.com/</li>
              </ul>
            </div>
          )}

          <div className="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              id="malpracticeInsuranceAcknowledged"
              checked={Boolean(getFormValue("malpracticeInsuranceAcknowledged", false))}
              onChange={(e) => handleChange("malpracticeInsuranceAcknowledged", e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="malpracticeInsuranceAcknowledged" className="text-base text-gray-900">
              I acknowledge that I have read and understand the malpractice insurance requirements
            </label>
          </div>
        </div>

        {/* Drug and Alcohol-Free Workplace Acknowledgment Form - RESTORED ORIGINAL CONTENT */}
        <div className="p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Drug and Alcohol-Free Workplace Acknowledgment Form</h3>
          <p className="text-gray-600 mb-4">
            This form requires your signature. Please review and sign the acknowledgment.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleViewForm("drugAlcohol")}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition duration-300"
            >
              {showDrugAlcoholForm ? "Hide Form" : "View Form"}
            </button>

            <a
              href="/Drug_Alcohol_Free_Workplace.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download PDF
            </a>

            {getFormValue("drugAlcoholFormSigned", false) && (
              <span className="text-green-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Signed
              </span>
            )}
          </div>

          {showDrugAlcoholForm && (
            <div id="drugAlcohol-form-content" className="border rounded-md p-4 mb-6">
              <h4 className="text-center font-bold mb-4">RUSH SERVICING LLC</h4>
              <h5 className="text-center font-semibold mb-4">Drug- and Alcohol-Free Workplace Acknowledgment Form</h5>

              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="drugAlcohol-providerName"
                      className="block mb-2 text-base font-medium text-gray-900"
                    >
                      Provider Name
                    </label>
                    <input
                      type="text"
                      id="drugAlcohol-providerName"
                      value={String(getFormValue("firstName", "")) + " " + String(getFormValue("lastName", ""))}
                      disabled
                      className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 border-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="drugAlcohol-date" className="block mb-2 text-base font-medium text-gray-900">
                      Date
                    </label>
                    <input
                      type="text"
                      id="drugAlcohol-date"
                      value={new Date().toLocaleDateString()}
                      disabled
                      className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="mb-4">
                  At RUSH Servicing LLC (&quot;RUSH&quot;), we are committed to ensuring a safe, professional, and
                  high-quality healthcare environment for both our patients and our healthcare professionals. To support
                  this mission, we require all independent contractors to agree to and abide by a drug- and alcohol-free
                  workplace policy.
                </p>

                <h5 className="font-bold mb-2">Policy Statement</h5>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                  <li>
                    Abstain from the use, possession, distribution, or sale of illegal drugs, controlled substances
                    (without a prescription), or alcohol while performing services on behalf of RUSH, whether at a
                    patient&apos;s home, a partner facility, or during any virtual encounters.
                  </li>
                  <li>
                    Report to duty in a physical and mental state fit for providing care. Providers must not be under
                    the influence of drugs or alcohol during any professional interaction related to their role with
                    RUSH.
                  </li>
                  <li>
                    Understand that RUSH maintains zero tolerance for drug or alcohol use in connection with service
                    delivery. Any violation of this policy may result in immediate termination of the provider&apos;s
                    contract and may be reported to relevant licensing boards or authorities.
                  </li>
                  <li>
                    Submit to reasonable investigation or review if there is suspicion or evidence of impairment while
                    on assignment, in accordance with applicable law.
                  </li>
                  <li>
                    Comply with all state and federal laws regarding controlled substances, drug use, and professional
                    conduct.
                  </li>
                </ol>

                <h5 className="font-bold mb-2">Acknowledgment and Agreement</h5>
                <p className="mb-4">
                  By signing below, I acknowledge that I have read, understand, and agree to comply with the RUSH
                  Servicing LLC Drug- and Alcohol-Free Workplace Policy. I understand that failure to adhere to this
                  policy may result in disciplinary action, including immediate termination of my contract and possible
                  legal or professional consequences.
                </p>
              </div>

              <div className="mb-4">
                <div className="block mb-2 text-base font-medium text-gray-900">Signature</div>
                <CustomSignaturePad
                  onSave={handleDrugAlcoholSignatureSave}
                  onClear={handleDrugAlcoholSignatureClear}
                  existingSignature={String(getFormValue("drugAlcoholSignature", ""))}
                  width={400}
                  height={160}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-base font-medium text-gray-900">Printed Name</label>
                  <input
                    type="text"
                    value={String(getFormValue("firstName", "")) + " " + String(getFormValue("lastName", ""))}
                    disabled
                    className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 border-gray-300"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-base font-medium text-gray-900">Date</label>
                  <input
                    type="text"
                    value={String(getFormValue("drugAlcoholSignatureDate", new Date().toISOString().split("T")[0]))}
                    disabled
                    className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 border-gray-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Citizenship Attestation - RESTORED ORIGINAL CONTENT */}
        <div className="p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Citizenship Attestation</h3>
          <p className="text-gray-600 mb-4">
            This form requires your signature. Please review and sign the attestation.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleViewForm("citizenship")}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition duration-300"
            >
              {showCitizenshipForm ? "Hide Form" : "View Form"}
            </button>

            <a
              href="/Citizenship_Attestation.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download PDF
            </a>

            {getFormValue("citizenshipAttestationSigned", false) && (
              <span className="text-green-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Signed
              </span>
            )}
          </div>

          {showCitizenshipForm && (
            <div id="citizenship-form-content" className="border rounded-md p-4 mb-6">
              <h4 className="text-center font-bold mb-4">RUSH Citizenship Attestation</h4>

              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="citizenship-applicantName"
                      className="block mb-2 text-base font-medium text-gray-900"
                    >
                      Applicant Name
                    </label>
                    <input
                      type="text"
                      id="citizenship-applicantName"
                      value={String(getFormValue("firstName", "")) + " " + String(getFormValue("lastName", ""))}
                      disabled
                      className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 border-gray-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="citizenship-dateOfBirth" className="block mb-2 text-base font-medium text-gray-900">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="citizenship-dateOfBirth"
                      value={String(getFormValue("dateOfBirth", ""))}
                      onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                      required
                      className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="citizenship-positionAppliedFor"
                    className="block mb-2 text-base font-medium text-gray-900"
                  >
                    Position Applied For
                  </label>
                  <input
                    type="text"
                    id="citizenship-positionAppliedFor"
                    value={String(getFormValue("positionAppliedFor", ""))}
                    onChange={(e) => handleChange("positionAppliedFor", e.target.value)}
                    required
                    className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 border-gray-300"
                  />
                </div>
              </div>

              <div className="mb-6">
                <p className="mb-4">
                  In accordance with federal and state employment and contracting laws, RUSH Servicing LLC requires all
                  independent contractors and providers to verify their legal authorization to work in the United
                  States.
                </p>

                <p className="mb-4">By signing this form, I, the undersigned, attest to the following:</p>

                <div className="mb-4">
                  <label className="block mb-2 text-base font-medium text-gray-900">Citizenship Status</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="citizen"
                        name="citizenshipStatus"
                        value="citizen"
                        checked={getFormValue("citizenshipStatus", "") === "citizen"}
                        onChange={(e) => handleChange("citizenshipStatus", e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="citizen" className="ml-2 text-sm text-gray-900">
                        1. I am a citizen of the United States
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="permanent-resident"
                        name="citizenshipStatus"
                        value="permanent-resident"
                        checked={getFormValue("citizenshipStatus", "") === "permanent-resident"}
                        onChange={(e) => handleChange("citizenshipStatus", e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="permanent-resident" className="ml-2 text-sm text-gray-900">
                        2. I am a lawful permanent resident (Green Card holder)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="authorized-worker"
                        name="citizenshipStatus"
                        value="authorized-worker"
                        checked={getFormValue("citizenshipStatus", "") === "authorized-worker"}
                        onChange={(e) => handleChange("citizenshipStatus", e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="authorized-worker" className="ml-2 text-sm text-gray-900">
                        3. I am otherwise legally authorized to work in the United States (with valid documentation)
                      </label>
                    </div>
                  </div>
                </div>

                <p className="mb-4">
                  I understand that I may be required to submit proof of my citizenship or legal authorization to work
                  as a condition of my credentialing with RUSH.
                </p>

                <p className="mb-4">
                  I hereby declare under penalty of perjury that the information provided in this attestation is true
                  and correct.
                </p>
              </div>

              <div className="mb-4">
                <div className="block mb-2 text-base font-medium text-gray-900">Signature</div>
                <CustomSignaturePad
                  onSave={handleCitizenshipSignatureSave}
                  onClear={handleCitizenshipSignatureClear}
                  existingSignature={String(getFormValue("citizenshipSignature", ""))}
                  width={400}
                  height={160}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-base font-medium text-gray-900">Date</label>
                  <input
                    type="text"
                    value={String(getFormValue("citizenshipSignatureDate", new Date().toISOString().split("T")[0]))}
                    disabled
                    className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 border-gray-300"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-base font-medium text-gray-900">Printed Name</label>
                  <input
                    type="text"
                    value={String(getFormValue("firstName", "")) + " " + String(getFormValue("lastName", ""))}
                    disabled
                    className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 border-gray-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Non-Compete & Independent Contractor Liability Clause */}
        <div className="p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Non-Compete & Independent Contractor Liability Clause</h3>
          <p className="text-gray-600 mb-4">This form requires your signature. Please review and sign the clause.</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleViewForm("nonCompete")}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition duration-300"
            >
              {showNonCompeteForm ? "Hide Clause" : "View Clause"}
            </button>

            <a
              href="/Non_Compete_Clause.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download PDF
            </a>

            {getFormValue("nonCompeteSigned", false) && (
              <span className="text-green-600 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Signed
              </span>
            )}
          </div>

          {showNonCompeteForm && (
            <div id="nonCompete-form-content" className="border rounded-md p-4 mb-6">
              <h4 className="text-center font-bold mb-4">Non-Compete & Independent Contractor Liability Clause</h4>
              <p className="mb-4">
                This Non-Compete Clause (&quot;Clause&quot;) is entered into by and between RUSH Servicing LLC
                (&quot;Company&quot;) and the undersigned independent contractor (&quot;Provider&quot;).
              </p>

              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li>
                  <strong>Non-Compete Agreement</strong>
                  <br />
                  The Provider agrees not to engage in any competitive business activities within a certain geographic
                  area for a specified period of time after termination of their contract with RUSH Servicing LLC.
                </li>

                <li>
                  <strong>Independent Contractor Status</strong>
                  <br />
                  The Provider confirms their status as an independent contractor and not an employee of RUSH Servicing
                  LLC.
                </li>

                <li>
                  <strong>Liability Release</strong>
                  <br />
                  The Provider releases RUSH Servicing LLC from any liability arising from the Provider&apos;s
                  independent contractor status.
                </li>
              </ol>

              <div className="mb-4">
                <div className="block mb-2 text-base font-medium text-gray-900">Signature</div>
                <CustomSignaturePad
                  onSave={handleNonCompeteSignatureSave}
                  onClear={handleNonCompeteSignatureClear}
                  existingSignature={String(getFormValue("nonCompeteSignature", ""))}
                  width={400}
                  height={160}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition duration-300"
          >
            Previous Step
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isGeneratingPDFs}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            {isSubmitting || isGeneratingPDFs ? "Submitting..." : "Submit Application"}
          </button>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div
            className={`mb-6 p-4 border rounded-lg ${
              error.includes("Generating") || error.includes("Submitting")
                ? "bg-blue-50 border-blue-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {error.includes("Generating") || error.includes("Submitting") ? (
                  <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm8.707-7.293a1 1 0 00-1.414 1.414L10 10.586l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l-4.293 4.293a1 1 0 001.414-1.414L11.414 10l4.293-4.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm ${
                    error.includes("Generating") || error.includes("Submitting") ? "text-blue-800" : "text-red-800"
                  }`}
                >
                  {error}
                </p>
              </div>
              {!error.includes("Generating") && !error.includes("Submitting") && (
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default FormsAndAgreements