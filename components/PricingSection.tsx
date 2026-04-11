"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FaCheck, FaTimes, FaStar, FaSpinner } from "react-icons/fa"
import { FadeInView } from "./FadeInView"
import { DropInView } from "./DropInView"
import { Container } from "@/components/ui/container"

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

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/pricing", {
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
        setError(
          err instanceof Error ? err.message : "Failed to load pricing data"
        )

        const fallbackPlans: PricePlan[] = [
          {
            id: 1,
            service_tier: "RUSH Access",
            included_services:
              "Visit from nurse assistant (CNA), vitals, light wound care",
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
            included_services:
              "1 nurse 1 CNA visit/month + chat support (ONE MEMBER PER VISIT)",
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

  if (loading) {
    return (
      <section
        id="pricing"
        className="bg-background py-16"
        aria-labelledby="pricing-heading-loading"
      >
        <Container size="lg">
          <div className="mb-12 text-center">
            <DropInView>
              <h2
                id="pricing-heading-loading"
                className="font-heading text-3xl font-bold text-foreground"
              >
                Choose Your Care Plan
              </h2>
            </DropInView>
            <FadeInView>
              <p className="mt-2 text-muted-foreground">
                Transparent pricing for quality healthcare services delivered to
                your home.
              </p>
            </FadeInView>
          </div>

          <div className="flex items-center justify-center py-12">
            <FaSpinner
              className="animate-spin text-4xl text-accent"
              aria-hidden="true"
            />
            <span className="ml-3 text-muted-foreground">
              Loading pricing plans...
            </span>
          </div>
        </Container>
      </section>
    )
  }

  if (error && enabledPlans.length === 0) {
    return (
      <section
        id="pricing"
        className="bg-background py-16"
        aria-labelledby="pricing-heading-error"
      >
        <Container size="lg">
          <div className="mb-12 text-center">
            <DropInView>
              <h2
                id="pricing-heading-error"
                className="font-heading text-3xl font-bold text-foreground"
              >
                Choose Your Care Plan
              </h2>
            </DropInView>
            <FadeInView>
              <p className="mt-2 text-muted-foreground">
                Transparent pricing for quality healthcare services delivered to
                your home.
              </p>
            </FadeInView>
          </div>

          <div className="py-12 text-center">
            <div className="mx-auto max-w-md rounded-lg border border-destructive/30 bg-destructive/10 p-6">
              <p className="mb-4 text-destructive">
                Unable to load pricing information at this time.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <>
      <section
        id="pricing"
        className="bg-background py-16"
        aria-labelledby="pricing-heading"
      >
        <Container size="lg">
          <div className="mb-12 text-center">
            <DropInView>
              <h2
                id="pricing-heading"
                className="font-heading text-3xl font-bold text-foreground"
              >
                Choose Your Care Plan
              </h2>
            </DropInView>
            <FadeInView>
              <p className="mt-2 text-muted-foreground">
                Transparent pricing for quality healthcare services delivered to
                your home.
              </p>
            </FadeInView>
            {error && (
              <div className="mx-auto mt-4 max-w-md rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800/30 dark:bg-yellow-900/20 dark:text-yellow-200">
                Note: Showing cached pricing data. Some information may not be
                current.
              </div>
            )}
          </div>

          <FadeInView>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              {enabledPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handlePlanClick(plan)}
                  className={`relative cursor-pointer rounded-2xl border-2 bg-card shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${plan.is_popular
                      ? "border-accent ring-2 ring-accent/20"
                      : "border-border hover:border-accent"
                    }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handlePlanClick(plan)
                    }
                  }}
                  aria-label={`View details for ${plan.service_tier} plan - $${plan.patient_price}`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                      <div className="flex items-center rounded-full bg-accent px-4 py-1 text-sm font-medium text-white">
                        <FaStar className="mr-1 h-3 w-3" aria-hidden="true" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="text-center">
                      <h3 className="mb-2 text-xl font-bold text-foreground">
                        {plan.service_tier}
                      </h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-foreground">
                          ${plan.patient_price}
                        </span>
                        <span className="ml-1 text-muted-foreground">
                          {plan.service_tier === "RUSH Subscription"
                            ? "per month"
                            : plan.service_tier === "RUSH Sitter"
                              ? "per hour"
                              : "per visit"}
                        </span>
                      </div>
                      <p className="mb-6 flex h-12 items-center justify-center text-sm text-muted-foreground">
                        {plan.included_services.length > 50
                          ? `${plan.included_services.substring(0, 50)}...`
                          : plan.included_services}
                      </p>

                      <button
                        className={`w-full rounded-lg px-6 py-3 font-semibold transition-colors duration-300 ${plan.is_popular
                            ? "bg-accent text-white hover:bg-blue-700"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
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
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                All plans include HIPAA-compliant care - Licensed professionals
                - Flexible scheduling
              </p>
              <p className="text-sm text-muted-foreground">
                HSA/FSA payments are acceptable
              </p>
            </div>
          </FadeInView>
        </Container>
      </section>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-2xl">
            <div className="p-8">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3
                    id="modal-title"
                    className="mb-2 text-2xl font-bold text-foreground"
                  >
                    {selectedPlan.service_tier}
                  </h3>
                  {selectedPlan.is_popular && (
                    <div className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-medium text-white">
                      <FaStar className="mr-1 h-3 w-3" aria-hidden="true" />
                      Most Popular
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Close modal"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              {/* Price */}
              <div className="mb-8 text-center">
                <div className="mb-2 text-5xl font-bold text-foreground">
                  ${selectedPlan.patient_price}
                </div>
                <p className="text-muted-foreground">
                  {selectedPlan.service_tier === "RUSH Subscription"
                    ? "per month"
                    : "per visit"}
                </p>
              </div>

              {/* Services Included */}
              <div className="mb-8">
                <h4 className="mb-4 text-lg font-semibold text-foreground">
                  What&apos;s Included:
                </h4>
                <div className="space-y-3">
                  {formatServices(selectedPlan.included_services).map(
                    (service, index) => (
                      <div key={index} className="flex items-start">
                        <FaCheck
                          className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-muted-foreground">{service}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Special Notes */}
              {selectedPlan.notes && (
                <div className="mb-8">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/20">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      <strong>Important:</strong> {selectedPlan.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Benefits */}
              <div className="mb-8">
                <h4 className="mb-4 text-lg font-semibold text-foreground">
                  Additional Benefits:
                </h4>
                <div className="space-y-3">
                  {[
                    "Licensed and certified healthcare professionals",
                    "HIPAA-compliant care and documentation",
                    "Flexible scheduling to fit your needs",
                    "Same-day availability when possible",
                    "Detailed care reports and follow-up",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <FaCheck
                        className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-green-500"
                        aria-hidden="true"
                      />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Link
                  href="/comingsoon"
                  className="inline-block w-full rounded-lg bg-accent px-8 py-4 text-lg font-semibold text-white transition-colors duration-300 hover:bg-blue-700"
                >
                  Choose This Plan
                </Link>
                <p className="mt-3 text-sm text-muted-foreground">
                  Click to get started with {selectedPlan.service_tier}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
