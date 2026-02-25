// /portal/np-intake/page.tsx
"use client"

import { useToast } from "@/hooks/use-toast"
import React, { useState } from "react"
import NPQuickIntake from "../components/NPQuickIntake"

// Simplified Data Structure
interface NPFormDataType {
    firstName: string
    lastName: string
    username: string // Maps to 'email'
    phone: string
    npiNumber: string // Maps to 'npi_number'
    npLicenseNumber: string // Maps to 'np_license_number'
    yearsExperience: string | number
}

const INITIAL_FORM_DATA: NPFormDataType = {
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    npiNumber: "",
    npLicenseNumber: "",
    yearsExperience: "",
}

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

interface SubmissionResult {
    success: boolean;
    message: string;
    redirect?: string;
    application_id?: number;
    email_failed?: boolean;
    error?: string;
}

export default function NPIntakePage() {
    const [formData, setFormData] = useState<NPFormDataType>(INITIAL_FORM_DATA)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const { toast } = useToast()

    // Haptic feedback function
    const triggerHaptic = (type: HapticType = 'medium') => {
        if (!navigator.vibrate) return;

        const patterns: Record<HapticType, number | number[]> = {
            light: [50],
            medium: [100],
            heavy: [200],
            success: [100, 50, 100],
            error: [200, 100, 200, 100]
        };

        navigator.vibrate(patterns[type]);
    }

    const handleChange = (input: string, value: string | number | boolean) => {
        setFormData((prev) => ({ ...prev, [input]: value }))
        // Clear field error when user starts typing
        if (fieldErrors[input]) {
            setFieldErrors(prev => ({ ...prev, [input]: '' }))
        }
    }

    // Client-side validation
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        
        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required'
        }
        
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required'
        }
        
        if (!formData.username.trim()) {
            errors.username = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
            errors.username = 'Invalid email format'
        }
        
        if (!formData.npiNumber.trim()) {
            errors.npiNumber = 'NPI number is required'
        } else if (!/^\d{10}$/.test(formData.npiNumber)) {
            errors.npiNumber = 'NPI must be 10 digits'
        }
        
        if (!formData.npLicenseNumber.trim()) {
            errors.npLicenseNumber = 'License number is required'
        }
        
        setFieldErrors(errors)
        
        if (Object.keys(errors).length > 0) {
            triggerHaptic('error')
            // Scroll to first error
            const firstErrorField = Object.keys(errors)[0]
            const element = document.getElementById(firstErrorField)
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            element?.focus()
            return false
        }
        
        return true
    }

    // Enhanced Submission Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Client-side validation
        if (!validateForm()) {
            return
        }
        
        setIsSubmitting(true)
        setFieldErrors({})

        const formDataToSubmit = new FormData()
        formDataToSubmit.append('firstName', formData.firstName)
        formDataToSubmit.append('lastName', formData.lastName)
        formDataToSubmit.append('email', formData.username)
        formDataToSubmit.append('phone', formData.phone)
        formDataToSubmit.append('npi_number', formData.npiNumber)
        formDataToSubmit.append('np_license_number', formData.npLicenseNumber)
        formDataToSubmit.append('years_experience', String(formData.yearsExperience))

        try {
            const response = await fetch("/submit-np-intake.php", {
                method: 'POST',
                body: formDataToSubmit,
            })

            const result: SubmissionResult = await response.json()

            if (!response.ok) {
                // Server-side validation errors
                if (result.error === 'email_exists') {
                    triggerHaptic('error')
                    setFieldErrors({ username: 'Email already exists' })
                    throw new Error(result.message)
                } else {
                    triggerHaptic('error')
                    throw new Error(result.message || 'Submission failed.')
                }
            }

            triggerHaptic('success')
            
            // Show success message
            toast({ 
                title: "Success!", 
                description: "NP intake submitted successfully. Redirecting..." 
            })
            
            // Option 1: Use window.location.href for redirect
            setTimeout(() => {
                if (result.redirect) {
                    window.location.href = result.redirect;
                } else {
                    // Fallback redirect
                    window.location.href = 'https://rushhealthc.com/thank-you-np-intake';
                }
            }, 1500)
            
        } catch (error) {
            console.error("Submission failed:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to submit intake. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <NPQuickIntake 
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                fieldErrors={fieldErrors}
            />
        </div>
    )
}