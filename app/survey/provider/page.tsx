"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import PersonalInfo from "./components/PersonalInfo"
import ProfessionalCredentials from "./components/ProfessionalCredentials"
import WorkHistory from "./components/WorkHistory"
import References from "./components/References"
import FormsAndAgreements from "./components/FormsAndAgreements"
import { FadeInView } from "@/app/components/FadeInView"
import { Button } from "@/components/ui/button"
import { Save, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApplicationStorageManager } from "./utils/storage-utils"
import { useBeforeUnload } from "./hooks/useBeforeUnload"
import { usePageVisibility } from "./hooks/usePageVisibility"
import { useOnlineStatus } from "./hooks/useOnlineStatus"
import { AutoSaveIndicator } from "./components/AutoSaveIndicator"
import dynamic from "next/dynamic"

// Work History Entry Type
interface WorkHistoryEntry {
  employerName: string
  employerAddress: string
  startDate: string
  endDate: string
  workDuties: string
}

// Reference Entry Type
interface ReferenceEntry {
  referenceName: string
  referenceContact: string
  professionalRelationship: string
}

// Main form data interface - comprehensive for all steps with proper index signature
interface FormDataType {
  // Personal Info
  firstName: string
  lastName: string
  username: string
  fullAddress: string
  phone: string
  isCNAHHACaregiver: boolean
  isSitterApplicant: boolean
  profileImage: File | null
  profileImagePreview?: string
  driversLicenseImage: File | null
  driversLicenseImagePreview?: string

  // Professional Credentials
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

  // Work History
  workHistory: WorkHistoryEntry[]

  // References
  references: ReferenceEntry[]

  // Forms and Agreements - Required fields
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

  // Index signature to satisfy all component requirements
  [key: string]: string | number | boolean | File | null | undefined | WorkHistoryEntry[] | ReferenceEntry[]
}

// Interface specifically for FormsAndAgreements component
interface FormsAndAgreementsData {
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
  // Index signature that matches FormsAndAgreements exactly
  [key: string]: string | boolean
}

// Helper function to convert FormDataType to FormsAndAgreements compatible format
const convertToFormsAndAgreementsData = (formData: FormDataType): FormsAndAgreementsData => {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    username: formData.username,
    fullAddress: formData.fullAddress,
    phone: formData.phone,
    liabilityFormSigned: formData.liabilityFormSigned,
    liabilitySignature: formData.liabilitySignature,
    liabilitySignatureDate: formData.liabilitySignatureDate,
    backgroundCheckAcknowledged: formData.backgroundCheckAcknowledged,
    malpracticeInsuranceAcknowledged: formData.malpracticeInsuranceAcknowledged,
    licenseType: formData.licenseType,
    licenseNumber: formData.licenseNumber,
    malpracticeInsuranceProvider: formData.malpracticeInsuranceProvider,
    exclusionScreeningSigned: formData.exclusionScreeningSigned,
    exclusionScreeningSignature: formData.exclusionScreeningSignature,
    exclusionScreeningSignatureDate: formData.exclusionScreeningSignatureDate,
    drugAlcoholFormSigned: formData.drugAlcoholFormSigned,
    drugAlcoholSignature: formData.drugAlcoholSignature,
    drugAlcoholSignatureDate: formData.drugAlcoholSignatureDate,
    citizenshipAttestationSigned: formData.citizenshipAttestationSigned,
    citizenshipSignature: formData.citizenshipSignature,
    citizenshipSignatureDate: formData.citizenshipSignatureDate,
    dateOfBirth: formData.dateOfBirth,
    positionAppliedFor: formData.positionAppliedFor,
    citizenshipStatus: formData.citizenshipStatus,
    nonCompeteSigned: formData.nonCompeteSigned,
    nonCompeteSignature: formData.nonCompeteSignature,
    nonCompeteSignatureDate: formData.nonCompeteSignatureDate,
  }
}

// Custom hook for file handling with cleanup
const useFilePreview = () => {
  const [previews, setPreviews] = useState<Record<string, string>>({})

  const createPreview = useCallback(
    (file: File, key: string) => {
      // Clean up previous preview URL to prevent memory leaks
      if (previews[key]) {
        URL.revokeObjectURL(previews[key])
      }

      const previewUrl = URL.createObjectURL(file)
      setPreviews((prev) => ({ ...prev, [key]: previewUrl }))
      return previewUrl
    },
    [previews],
  )

  const removePreview = useCallback(
    (key: string) => {
      if (previews[key]) {
        URL.revokeObjectURL(previews[key])
        setPreviews((prev) => {
          const newPreviews = { ...prev }
          delete newPreviews[key]
          return newPreviews
        })
      }
    },
    [previews],
  )

  const cleanup = useCallback(() => {
    Object.values(previews).forEach((url) => URL.revokeObjectURL(url))
    setPreviews({})
  }, [previews])

  return { previews, createPreview, removePreview, cleanup }
}

// Smooth scroll to top utility function
const scrollToTop = (smooth = true) => {
  if (typeof window !== "undefined") {
    window.scrollTo({
      top: 0,
      behavior: smooth ? "smooth" : "auto",
    })
  }
}

// Debug mode - set to false to reduce console logs
const DEBUG_MODE = false

// Main component - now with proper client-side only rendering
function ProviderApplicationPageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState<string>("")
  const [lastSaved, setLastSaved] = useState<string>("")
  const [showLoadProgress, setShowLoadProgress] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { createPreview, cleanup } = useFilePreview()
  const isOnline = useOnlineStatus()

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const [formData, setFormData] = useState<FormDataType>({
    // Personal Info
    firstName: "",
    lastName: "",
    username: "",
    fullAddress: "",
    phone: "",
    isCNAHHACaregiver: false,
    isSitterApplicant: false,
    profileImage: null,
    driversLicenseImage: null,

    // Professional Credentials
    workEthic: "",
    education: "",
    educationImage: null,
    licenses: "",
    licenseImage: null,
    blsCprImage: null,
    tbTestImage: null,
    woundCareImage: null,
    hasBlsCpr: false,
    hasWoundCareExperience: false,
    yearsExperience: "",

    // Work History
    workHistory: [
      {
        employerName: "",
        employerAddress: "",
        startDate: "",
        endDate: "",
        workDuties: "",
      },
    ],

    // References
    references: [
      {
        referenceName: "",
        referenceContact: "",
        professionalRelationship: "",
      },
      {
        referenceName: "",
        referenceContact: "",
        professionalRelationship: "",
      },
    ],

    // Forms and Agreements - Required fields
    liabilityFormSigned: false,
    liabilitySignature: "",
    liabilitySignatureDate: "",
    backgroundCheckAcknowledged: false,
    malpracticeInsuranceAcknowledged: false,
    licenseType: "",
    licenseNumber: "",
    malpracticeInsuranceProvider: "",
    exclusionScreeningSigned: false,
    exclusionScreeningSignature: "",
    exclusionScreeningSignatureDate: "",
    drugAlcoholFormSigned: false,
    drugAlcoholSignature: "",
    drugAlcoholSignatureDate: "",
    citizenshipAttestationSigned: false,
    citizenshipSignature: "",
    citizenshipSignatureDate: "",
    dateOfBirth: "",
    positionAppliedFor: "Healthcare Provider",
    citizenshipStatus: "",
    // NEW: Non-Compete Clause fields
    nonCompeteSigned: false,
    nonCompeteSignature: "",
    nonCompeteSignatureDate: "",
  })

  // Check if user has meaningful progress to warn about
  const hasProgress = useCallback(() => {
    return (
      formData.firstName.trim() ||
      formData.lastName.trim() ||
      formData.username.trim() ||
      formData.workEthic.trim() ||
      formData.education.trim() ||
      formData.workHistory.some((work) => work.employerName.trim()) ||
      formData.references.some((ref) => ref.referenceName.trim())
    )
  }, [formData])

  // Handle saving progress
  const handleSaveProgress = useCallback(
    async (silent = false) => {
      if (!isClient) return // Don't save during SSR

      if (!hasProgress()) {
        if (!silent) {
          toast({
            title: "Nothing to Save",
            description: "Please fill out some information before saving.",
            variant: "destructive",
            duration: 3000,
          })
        }
        return
      }

      if (!isOnline) {
        if (!silent) {
          toast({
            title: "Offline",
            description: "Cannot save while offline. Your changes will be saved when connection is restored.",
            variant: "destructive",
            duration: 3000,
          })
        }
        return
      }

      setIsSaving(true)

      try {
        const success = ApplicationStorageManager.saveApplicationData(applicationId, formData, currentStep)
        if (success) {
          const now = new Date().toLocaleString()
          setLastSaved(now)
          setHasUnsavedChanges(false)

          if (!silent) {
            toast({
              title: "Progress Saved",
              description: "Your application progress has been saved. You can return to complete it later.",
              duration: 3000,
            })
          }
        } else {
          throw new Error("Failed to save to localStorage")
        }
      } catch (error) {
        console.error("Save error:", error)
        if (!silent) {
          toast({
            title: "Save Failed",
            description: "Unable to save your progress. Please try again.",
            variant: "destructive",
            duration: 3000,
          })
        }
      } finally {
        setIsSaving(false)
      }
    },
    [applicationId, formData, currentStep, toast, hasProgress, isOnline, isClient],
  )

  // Browser warning when leaving with unsaved changes - Fixed type issue
  useBeforeUnload({
    when: Boolean(isClient && hasProgress() && hasUnsavedChanges && !isSubmitting),
    message:
      "You have unsaved changes in your provider application. Your progress will be lost if you leave now. Are you sure you want to continue?",
  })

  // Auto-save when page becomes hidden (tab switch, minimize, etc.)
  usePageVisibility({
    onBeforeHide: () => {
      if (isClient && hasProgress() && hasUnsavedChanges && isOnline) {
        handleSaveProgress(true) // Silent save
      }
    },
    onVisibilityChange: (isVisible) => {
      if (isClient && isVisible && !isOnline) {
        // When coming back online, try to save any pending changes
        if (hasUnsavedChanges && hasProgress()) {
          setTimeout(() => handleSaveProgress(true), 1000)
        }
      }
    },
  })

  // Initialize application ID and check for saved progress on mount
  useEffect(() => {
    if (!isClient) return

    const appId = ApplicationStorageManager.generateApplicationId()
    setApplicationId(appId)

    const savedApplications = ApplicationStorageManager.getAllSavedApplications()
    if (savedApplications.length > 0) {
      setShowLoadProgress(true)
    }
  }, [isClient])

  // Auto-save progress every 15 seconds if there's data and changes - Fixed dependency issue
  useEffect(() => {
    if (!isClient) return

    const autoSaveInterval = setInterval(() => {
      if (hasProgress() && hasUnsavedChanges && isOnline && !isSaving) {
        if (DEBUG_MODE) console.log("Auto-saving progress...") // Debug log
        handleSaveProgress(true) // true for silent save
      }
    }, 15000) // 15 seconds

    return () => clearInterval(autoSaveInterval)
  }, [hasProgress, hasUnsavedChanges, isOnline, isSaving, handleSaveProgress, isClient])

  // Mark as having unsaved changes when form data changes - Optimized to reduce excessive logging
  useEffect(() => {
    if (isClient) {
      if (DEBUG_MODE) console.log("Form data changed, marking as unsaved") // Debug log
      setHasUnsavedChanges(true)
    }
  }, [formData, isClient])

  // Handle loading saved progress
  const handleLoadProgress = useCallback(() => {
    if (!isClient) return

    const savedApplications = ApplicationStorageManager.getAllSavedApplications()
    if (savedApplications.length > 0) {
      const latestApp = savedApplications[0]
      const savedData = ApplicationStorageManager.loadApplicationData(latestApp.applicationId)

      if (savedData) {
        setFormData((prev) => ({
          ...prev,
          ...savedData,
          // Keep File objects as null since they can't be restored
          profileImage: null,
          driversLicenseImage: null,
          educationImage: null,
          licenseImage: null,
          blsCprImage: null,
          tbTestImage: null,
          woundCareImage: null,
        }))
        setCurrentStep(latestApp.currentStep)
        setLastSaved(new Date(latestApp.lastModified).toLocaleString())
        setApplicationId(latestApp.applicationId)
        setShowLoadProgress(false)
        setHasUnsavedChanges(false) // Just loaded, so no unsaved changes

        // Scroll to top when loading progress
        setTimeout(() => scrollToTop(), 100)

        toast({
          title: "Progress Loaded",
          description:
            "Your application progress has been restored. Please re-upload any files that were previously selected.",
          duration: 5000,
        })
      }
    }
  }, [toast, isClient])

  // Handle clearing progress
  const handleClearProgress = useCallback(() => {
    if (!isClient) return

    if (confirm("Are you sure you want to clear your saved progress? This action cannot be undone.")) {
      ApplicationStorageManager.deleteApplication(applicationId)
      setLastSaved("")
      setShowLoadProgress(false)
      setHasUnsavedChanges(false)
      toast({
        title: "Progress Cleared",
        description: "Your saved application progress has been cleared.",
        duration: 3000,
      })
    }
  }, [applicationId, toast, isClient])

  // Handle form field changes with improved type safety
  const handleChange = useCallback((input: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [input]: value }))
  }, [])

  // Handle file changes with preview
  const handleFileChange = useCallback(
    (fieldName: string, file: File) => {
      const previewUrl = createPreview(file, fieldName)
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}Preview`]: previewUrl,
      }))
    },
    [createPreview],
  )

  // Handle work history changes
  const handleWorkHistoryChange = useCallback((index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedWorkHistory = [...prev.workHistory]
      updatedWorkHistory[index] = { ...updatedWorkHistory[index], [field]: value }
      return { ...prev, workHistory: updatedWorkHistory }
    })
  }, [])

  // Add new work history entry
  const addWorkHistory = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      workHistory: [
        ...prev.workHistory,
        {
          employerName: "",
          employerAddress: "",
          startDate: "",
          endDate: "",
          workDuties: "",
        },
      ],
    }))
  }, [])

  // Handle reference changes
  const handleReferenceChange = useCallback((index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedReferences = [...prev.references]
      updatedReferences[index] = { ...updatedReferences[index], [field]: value }
      return { ...prev, references: updatedReferences }
    })
  }, [])

  // Add new reference entry
  const addReference = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      references: [
        ...prev.references,
        {
          referenceName: "",
          referenceContact: "",
          professionalRelationship: "",
        },
      ],
    }))
  }, [])

  // Navigation functions with scroll to top
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const newStep = Math.min(prev + 1, 5)
      // Scroll to top when moving to next step
      setTimeout(() => scrollToTop(), 100)
      return newStep
    })
    // Auto-save when moving to next step
    setTimeout(() => handleSaveProgress(true), 200)
  }, [handleSaveProgress])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const newStep = Math.max(prev - 1, 1)
      // Scroll to top when moving to previous step
      setTimeout(() => scrollToTop(), 100)
      return newStep
    })
  }, [])

  // Enhanced form submission with better error handling
  const handleSubmit = useCallback(
    async (pdfFiles?: Record<string, File>) => {
      setIsSubmitting(true)
      setHasUnsavedChanges(false) // Submitting, so no need to warn about unsaved changes

      try {
        const formDataToSubmit = new FormData()

        // Add all form fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value instanceof File) {
            formDataToSubmit.append(key, value)
          } else if (Array.isArray(value)) {
            formDataToSubmit.append(key, JSON.stringify(value))
          } else if (value !== null && value !== undefined) {
            formDataToSubmit.append(key, String(value))
          }
        })

        // Add PDF files if provided
        if (pdfFiles) {
          Object.entries(pdfFiles).forEach(([key, file]) => {
            formDataToSubmit.append(key, file)
          })
        }

        console.log("Submitting to:", "/submit-provider-application.php")

        const response = await fetch("/submit-provider-application.php", {
          method: "POST",
          body: formDataToSubmit,
        })

        console.log("Response status:", response.status)
        console.log("Response headers:", response.headers)

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Check content type
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          // If it's not JSON, get the text to see what we received
          const responseText = await response.text()
          console.error("Expected JSON but received:", responseText.substring(0, 500))
          throw new Error(
            `Server returned ${contentType || "unknown content type"} instead of JSON. This usually means there's a PHP error or the script path is incorrect.`,
          )
        }

        const result = await response.json()
        console.log("Parsed result:", result)

        if (result.success) {
          // Clear saved progress on successful submission
          ApplicationStorageManager.deleteApplication(applicationId)
          cleanup() // Clean up file previews

          toast({
            title: "Application Submitted Successfully!",
            description: "Thank you for your submission. You will be redirected shortly.",
            duration: 5000,
          })

          // Redirect to thank you page
          if (result.redirect) {
            setTimeout(() => {
              window.location.href = result.redirect
            }, 2000)
          } else {
            setTimeout(() => {
              router.push("/thank-you")
            }, 2000)
          }
        } else {
          throw new Error(result.message || "Submission failed")
        }
      } catch (error) {
        console.error("Submission error:", error)
        setHasUnsavedChanges(true) // Restore unsaved changes flag on error

        let errorMessage = "Please try again later."
        if (error instanceof Error) {
          if (error.message.includes("Failed to fetch")) {
            errorMessage = "Network error. Please check your connection and try again."
          } else if (error.message.includes("HTTP error")) {
            errorMessage = "Server error. The submission script may not be available."
          } else if (error.message.includes("JSON")) {
            errorMessage = "Server configuration error. Please contact support."
          } else {
            errorMessage = error.message
          }
        }

        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
          duration: 8000,
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, applicationId, cleanup, router, toast],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">R.U.S.H. Healthcare</h1>
            <h2 className="text-3xl font-semibold text-blue-600">Provider Application</h2>
          </div>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  // Step titles for progress indicator
  const stepTitles = [
    "Personal Information",
    "Professional Credentials",
    "Work History",
    "References",
    "Forms & Agreements",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header with company branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">R.U.S.H. Healthcare</h1>
          <h2 className="text-3xl font-semibold text-blue-600">Provider Application</h2>
        </div>

        {/* Load Progress Modal */}
        {showLoadProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Resume Application?</h3>
              <p className="text-gray-600 mb-6">
                We found a saved application in progress. Would you like to continue where you left off?
              </p>
              <div className="flex gap-3">
                <Button onClick={handleLoadProgress} className="flex-1">
                  Resume Application
                </Button>
                <Button variant="outline" onClick={() => setShowLoadProgress(false)} className="flex-1">
                  Start Fresh
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 <= currentStep ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-2 text-center max-w-20">{title}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / stepTitles.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Enhanced Save Progress Controls with Auto-Save Indicator - Always Visible */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => handleSaveProgress(false)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isSaving || !isOnline}
                >
                  <Save className="h-4 w-4" />
                  Save Progress
                </Button>

                <AutoSaveIndicator
                  lastSaved={lastSaved}
                  isSaving={isSaving}
                  hasUnsavedChanges={hasUnsavedChanges}
                  isOnline={isOnline}
                />
              </div>

              {lastSaved && (
                <Button
                  onClick={handleClearProgress}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear Progress
                </Button>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              <p>
                💡 Your progress is automatically saved every 15 seconds and when you navigate between steps or leave
                the page.
              </p>
              {!isOnline && (
                <p className="text-orange-600 mt-1">
                  ⚠️ You&apos;re currently offline. Changes will be saved when your connection is restored.
                </p>
              )}
              {hasProgress() && (
                <p className="text-green-600 mt-1">✓ Application data detected - auto-save is active</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Steps */}
        <FadeInView>
          {currentStep === 1 && (
            <PersonalInfo
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              nextStep={nextStep}
            />
          )}

          {currentStep === 2 && (
            <ProfessionalCredentials
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {currentStep === 3 && (
            <WorkHistory
              formData={formData}
              handleWorkHistoryChange={handleWorkHistoryChange}
              addWorkHistory={addWorkHistory}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {currentStep === 4 && (
            <References
              formData={formData}
              handleReferenceChange={handleReferenceChange}
              addReference={addReference}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}

          {currentStep === 5 && (
            <FormsAndAgreements
              formData={convertToFormsAndAgreementsData(formData)}
              handleChange={handleChange}
              prevStep={prevStep}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </FadeInView>
      </div>
    </div>
  )
}

// Export the dynamically imported component to prevent SSR issues
const ProviderApplicationPage = dynamic(() => Promise.resolve(ProviderApplicationPageContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">R.U.S.H. Healthcare</h1>
          <h2 className="text-3xl font-semibold text-blue-600">Provider Application</h2>
        </div>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  ),
})

export default ProviderApplicationPage