"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FadeInView } from "../../components/FadeInView"
import PatientInfo from "./components/PatientInfo"
import HealthcareNeeds from "./components/HealthcareNeeds"
import MedicalHistory from "./components/MedicalHistory"
import InsurancePayment from "./components/InsurancePayment"
import AdditionalInfo from "./components/AdditionalInfo"

const PatientSurvey = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    zipCode: "",
    interestReasons: [] as string[],
    anticipatedServices: [] as string[],
    medicalConditions: "",
    hasPCP: "",
    takingMedications: "",
    hasInsurance: "",
    insuranceProvider: "",
    policyNumber: "",
    groupNumber: "",
    primaryInsuredName: "",
    relationshipToPrimaryInsured: "",
    interestedInPaymentPlans: "",
    accessibilityNeeds: "",
    additionalInfo: "",
    wantsToPreRegister: "",
  })

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const handleChange = (input: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [input]: value }))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch("/submit-survey.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, type: "patient", submittedAt: new Date() }),
      })
      if (response.ok) {
        router.push("/thank-you")
      } else {
        throw new Error("Failed to submit survey")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to submit survey. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInView>
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Patient Registration</h1>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-[#1586D6] mb-4">What is RUSH?</h2>
              <p className="text-gray-600 leading-relaxed">
                RUSH is a convenient, on-demand platform that connects you with licensed healthcare professionals who
                can provide non-emergency medical services directly in the comfort of your home. Whether you need help
                with post-surgical care, medication administration, health monitoring, or other non-urgent needs, RUSH
                simplifies the process, saving you time and effort. Pre-register today to take control of your
                healthcare on your terms.
              </p>
            </div>
          </div>
        </FadeInView>

        {step === 1 && (
          <FadeInView>
            <PatientInfo formData={formData} handleChange={handleChange} nextStep={nextStep} />
          </FadeInView>
        )}
        {step === 2 && (
          <FadeInView>
            <HealthcareNeeds formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />
          </FadeInView>
        )}
        {step === 3 && (
          <FadeInView>
            <MedicalHistory formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />
          </FadeInView>
        )}
        {step === 4 && (
          <FadeInView>
            <InsurancePayment formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />
          </FadeInView>
        )}
        {step === 5 && (
          <FadeInView>
            <AdditionalInfo
              formData={formData}
              handleChange={handleChange}
              prevStep={prevStep}
              handleSubmit={handleSubmit}
            />
          </FadeInView>
        )}
      </div>
    </div>
  )
}

export default PatientSurvey