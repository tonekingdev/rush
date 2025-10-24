"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FaCheck, FaTimes, FaStar, FaSpinner } from "react-icons/fa"
import { FadeInView } from "./FadeInView"
import { DropInView } from "./DropInView"

interface PricePlan {
  id: number
  service_tier: string
  included_services: string
  patient_price: number
  enabled: boolean
  notes?: string
  is_popular?: boolean
  created_at?: string
  updated_at?: string
}

export default function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(null)
  const [pricingPlans, setPricingPlans] = useState<PricePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch pricing data from API
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/pricing.php", {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setPricingPlans(data.plans || [])
        } else {
          throw new Error(data.error || "Failed to fetch pricing data")
        }
      } catch (err) {
        console.error("Error fetching pricing data:", err)
        setError(err instanceof Error ? err.message : "Failed to load pricing data")

        // Fallback to static data if API fails
        const fallbackPlans: PricePlan[] = [
          {
            id: 1,
            service_tier: "RUSH Access",
            included_services: "Visit from nurse assistant (CNA), vitals, light wound care",
            patient_price: 59.0,
            enabled: true,
          },
          {
            id: 2,
            service_tier: "RUSH Core",
            included_services: "RN visit, vitals, wound care, brief assessment",
            patient_price: 159.0,
            enabled: true,
            is_popular: true,
          },
          {
            id: 3,
            service_tier: "RUSH Subscription",
            included_services: "1 nurse 1 CNA visit/month + chat support (ONE MEMBER PER VISIT)",
            patient_price: 109.0,
            enabled: true,
            notes:
              "Important: The subscription is for ONE MEMBER PER VISIT. Patients cannot include other relatives in the same visit.",
          },
        ]
        setPricingPlans(fallbackPlans)
      } finally {
        setLoading(false)
      }
    }

    fetchPricingData()
  }, [])

  // Only show enabled plans
  const enabledPlans = pricingPlans.filter((plan) => plan.enabled)

  const handlePlanClick = (plan: PricePlan) => {
    setSelectedPlan(plan)
  }

  const handleCloseModal = () => {
    setSelectedPlan(null)
  }

  const formatServices = (services: string) => {
    return services.split(",").map((service) => service.trim())
  }

  // Loading state
  if (loading) {
    return (
      <section id="pricing" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <DropInView>
              <h2 className="text-3xl font-bold font-poppins text-gray-800">Choose Your Care Plan</h2>
            </DropInView>
            <FadeInView>
              <p className="mt-2 text-gray-600">
                Transparent pricing for quality healthcare services delivered to your home.
              </p>
            </FadeInView>
          </div>

          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-[#1586D6]" />
            <span className="ml-3 text-gray-600">Loading pricing plans...</span>
          </div>
        </div>
      </section>
    )
  }

  // Error state with fallback
  if (error && enabledPlans.length === 0) {
    return (
      <section id="pricing" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <DropInView>
              <h2 className="text-3xl font-bold font-poppins text-gray-800">Choose Your Care Plan</h2>
            </DropInView>
            <FadeInView>
              <p className="mt-2 text-gray-600">
                Transparent pricing for quality healthcare services delivered to your home.
              </p>
            </FadeInView>
          </div>

          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">Unable to load pricing information at this time.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#1586D6] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <DropInView>
              <h2 className="text-3xl font-bold font-poppins text-gray-800">Choose Your Care Plan</h2>
            </DropInView>
            <FadeInView>
              <p className="mt-2 text-gray-600">
                Transparent pricing for quality healthcare services delivered to your home.
              </p>
            </FadeInView>
            {error && (
              <div className="mt-4 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-md mx-auto">
                Note: Showing cached pricing data. Some information may not be current.
              </div>
            )}
          </div>

          <FadeInView>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {enabledPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handlePlanClick(plan)}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    plan.is_popular
                      ? "border-[#1586D6] ring-2 ring-[#1586D6] ring-opacity-20"
                      : "border-gray-200 hover:border-[#1586D6]"
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-[#1586D6] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <FaStar className="w-3 h-3 mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.service_tier}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-800">${plan.patient_price}</span>
                        <span className="text-gray-600 ml-1">{plan.service_tier === "RUSH Subscription" ? "per month" : plan.service_tier === "RUSH Sitter" ? "per hour" : "per visit"}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-6 h-12 flex items-center justify-center">
                        {plan.included_services.length > 50
                          ? `${plan.included_services.substring(0, 50)}...`
                          : plan.included_services}
                      </p>

                      <button
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-300 ${
                          plan.is_popular
                            ? "bg-[#1586D6] text-white hover:bg-blue-700"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeInView>

          <FadeInView>
            <div className="text-center mt-8">
              <p className="text-gray-600 text-sm">
                All plans include HIPAA-compliant care • Licensed professionals • Flexible scheduling
              </p>
              <p className="text-gray-600 text-sm">
                HSA/FSA payments are acceptable
              </p>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedPlan.service_tier}</h3>
                  {selectedPlan.is_popular && (
                    <div className="inline-flex items-center bg-[#1586D6] text-white px-3 py-1 rounded-full text-sm font-medium">
                      <FaStar className="w-3 h-3 mr-1" />
                      Most Popular
                    </div>
                  )}
                </div>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-gray-800 mb-2">${selectedPlan.patient_price}</div>
                <p className="text-gray-600">{selectedPlan.service_tier === "RUSH Subscription" ? "per month" : "per visit"}</p>
              </div>

              {/* Services Included */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">What&apos;s Included:</h4>
                <div className="space-y-3">
                  {formatServices(selectedPlan.included_services).map((service, index) => (
                    <div key={index} className="flex items-start">
                      <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Notes */}
              {selectedPlan.notes && (
                <div className="mb-8">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      <strong>Important:</strong> {selectedPlan.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Benefits */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Benefits:</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Licensed and certified healthcare professionals</span>
                  </div>
                  <div className="flex items-start">
                    <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">HIPAA-compliant care and documentation</span>
                  </div>
                  <div className="flex items-start">
                    <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Flexible scheduling to fit your needs</span>
                  </div>
                  <div className="flex items-start">
                    <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Same-day availability when possible</span>
                  </div>
                  <div className="flex items-start">
                    <FaCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Detailed care reports and follow-up</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Link
                  href="/comingsoon"
                  className="inline-block w-full bg-[#1586D6] text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Choose This Plan
                </Link>
                <p className="text-gray-500 text-sm mt-3">Click to get started with {selectedPlan.service_tier}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}