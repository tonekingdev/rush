'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProviderInfo from './components/ProviderInfo'
import ExperienceAndAvailability from './components/ExperienceAndAvailability'
import ServicesAndCertifications from './components/ServicesAndCertifications'
import AdditionalInfo from './components/Additionalinfo'

const ProviderSurvey = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    experience: '',
    specialization: '',
    availability: '',
    preferredAreas: '',
    services: [],
    certifications: '',
    additionalComments: '',
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
        body: JSON.stringify({ ...formData, type: 'provider', submittedAt: new Date() }),
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
      return <ProviderInfo formData={formData} handleChange={handleChange} nextStep={nextStep} />
    case 2:
      return <ExperienceAndAvailability formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />
    case 3:
      return <ServicesAndCertifications formData={formData} handleChange={handleChange} nextStep={nextStep} prevStep={prevStep} />
    case 4:
      return <AdditionalInfo formData={formData} handleChange={handleChange} prevStep={prevStep} handleSubmit={handleSubmit} />
    default:
      return <ProviderInfo formData={formData} handleChange={handleChange} nextStep={nextStep} />
  }
}

export default ProviderSurvey

