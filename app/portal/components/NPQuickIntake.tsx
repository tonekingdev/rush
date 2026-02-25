// portal/components/NPQuickIntake.tsx
import React from "react"

// Interface for form data
interface NPFormDataType {
    firstName: string
    lastName: string
    username: string
    phone: string
    npiNumber: string
    npLicenseNumber: string
    yearsExperience: string | number
}

interface NPQuickIntakeProps {
    formData: NPFormDataType
    handleChange: (input: string, value: string | number | boolean) => void
    handleSubmit: (e: React.FormEvent) => void
    isSubmitting: boolean
    fieldErrors?: Record<string, string>
}

const NPQuickIntake: React.FC<NPQuickIntakeProps> = ({
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    fieldErrors = {},
}) => {
    return (
        <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-blue-700">NP Intake</h2>
            <p className="text-gray-600 mb-6">
                Thank you for your interest in the R.U.S.H. Platform and we&apos;re looking forward in working with you! We just have some details to gather below:
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* PERSONAL INFO & CONTACT */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium">First Name</label>
                        <input 
                            type="text" 
                            id="firstName" 
                            value={formData.firstName} 
                            onChange={(e) => handleChange("firstName", e.target.value)} 
                            required 
                            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                fieldErrors.firstName ? 'border-red-500 ring-2 ring-red-200' : ''
                            }`}
                        />
                        {fieldErrors.firstName && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium">Last Name</label>
                        <input 
                            type="text" 
                            id="lastName" 
                            value={formData.lastName} 
                            onChange={(e) => handleChange("lastName", e.target.value)} 
                            required 
                            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                fieldErrors.lastName ? 'border-red-500 ring-2 ring-red-200' : ''
                            }`}
                        />
                        {fieldErrors.lastName && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium">Email Address</label>
                    <input 
                        type="email" 
                        id="username" 
                        value={formData.username} 
                        onChange={(e) => handleChange("username", e.target.value)} 
                        required 
                        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            fieldErrors.username ? 'border-red-500 ring-2 ring-red-200' : ''
                        }`}
                    />
                    {fieldErrors.username && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium">Phone Number</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        value={formData.phone} 
                        onChange={(e) => handleChange("phone", e.target.value)} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>

                {/* CREDENTIALS */}
                <h3 className="text-xl font-semibold pt-4 border-t mt-6">Credentials</h3>

                <div>
                    <label htmlFor="npiNumber" className="block text-sm font-medium">NPI Number (10 digits)</label>
                    <input 
                        type="text" 
                        id="npiNumber" 
                        value={formData.npiNumber} 
                        onChange={(e) => handleChange("npiNumber", e.target.value)} 
                        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            fieldErrors.npiNumber ? 'border-red-500 ring-2 ring-red-200' : ''
                        }`}
                    />
                    {fieldErrors.npiNumber && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.npiNumber}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="npLicenseNumber" className="block text-sm font-medium">State NP License Number</label>
                    <input 
                        type="text" 
                        id="npLicenseNumber" 
                        value={formData.npLicenseNumber} 
                        onChange={(e) => handleChange("npLicenseNumber", e.target.value)} 
                        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            fieldErrors.npLicenseNumber ? 'border-red-500 ring-2 ring-red-200' : ''
                        }`}
                    />
                    {fieldErrors.npLicenseNumber && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.npLicenseNumber}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="yearsExperience" className="block text-sm font-medium">Years of Experience</label>
                    <input 
                        type="text" 
                        id="yearsExperience" 
                        value={formData.yearsExperience} 
                        onChange={(e) => handleChange("yearsExperience", e.target.value)} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-[#147fd1] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Submitting..." : "Submit NP Intake"}
                </button>
            </form>
        </div>
    )
}

export default NPQuickIntake