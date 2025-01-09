'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import PatientInfo from './components/PatientInfo'
import HealthcareNeeds from './components/HealthcareNeeds'
import MedicalHistory from './components/MedicalHistory'
import InsurancePayment from './components/InsurancePayment'
import AdditionalInfo from './components/AdditionalInfo'

const PatientSurvey = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    zipCode: '',
    interestReasons: [],
    anticipatedServices: [],
    medicalConditions: '',
    hasPCP: '',
    takingMedications: '',
    hasInsurance: '',
    insuranceProvider: '',
    interestedInPaymentPlans: '',
    accessibilityNeeds: '',
    additionalInfo: '',
  })

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const handleChange = (input: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [input]: value }))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/submit-survey.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, type: 'patient', submittedAt: new Date() }),
      })
      if (response.ok) {
        router.push('/thank-you')
      } else {
        throw new Error('Failed to submit survey')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to submit survey. Please try again.')
    }
  }

  switch(step) {
    case 1:
      return <PatientInfo formData={formData} handleChange={handleChange} nextStep={nextStep} />
    case 2:
      return <HealthcareNeeds formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />
    case 3:
      return <MedicalHistory formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />
    case 4:
      return <InsurancePayment formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />
    case 5:
      return <AdditionalInfo formData={formData} handleChange={handleChange} prevStep={prevStep} handleSubmit={handleSubmit} />
    default:
      return <PatientInfo formData={formData} handleChange={handleChange} nextStep={nextStep} />
  }
}

export default PatientSurvey

