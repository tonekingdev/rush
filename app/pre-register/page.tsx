"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Stripe } from "@stripe/stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { plans } from "../constants/plans"
import { FaCheck } from "react-icons/fa"
import { FadeInView } from "../components/FadeInView"

export default function PreRegister() {
  const [selectedPlan, setSelectedPlan] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

  useEffect(() => {
    fetch("/get_stripe_key.php")
      .then((response) => response.json())
      .then((data) => {
        setStripePromise(loadStripe(data.STRIPE_PUBLISHABLE_KEY))
      })
      .catch((err) => {
        console.error("Failed to load Stripe key:", err)
        setError("Failed to initialize payment system")
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError("")

    if (!stripePromise) {
      setError("Payment system is not initialized")
      setIsProcessing(false)
      return
    }

    const stripe = await stripePromise
    if (!stripe) {
      setError("Failed to connect to payment system")
      setIsProcessing(false)
      return
    }

    const plan = plans.find((p) => p.id === selectedPlan)
    if (!plan) {
      setError("Invalid plan selected")
      setIsProcessing(false)
      return
    }

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: plan.priceId, quantity: 1 }],
      mode: plan.perVisit ? "payment" : "subscription",
      successUrl: `${window.location.origin}/registration-success`,
      cancelUrl: `${window.location.origin}/pre-register`,
    })

    if (error) {
      setError(error.message || "An error occurred")
    }
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInView>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
            <p className="mt-4 text-xl text-gray-600">
              Select the plan that best fits your needs. Your card will not be charged until your first visit.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl ${
                  selectedPlan === plan.id ? "ring-4 ring-[#1586D6]" : "ring-1 ring-gray-200"
                } ${
                  plan.popular ? "scale-105 shadow-xl" : "shadow-md"
                } bg-white transition-all duration-200 hover:shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-[#1586D6] py-1 text-center text-sm font-semibold text-white">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-gray-500">{plan.description}</p>
                  <div className="my-4">
                    <span className="text-4xl font-bold text-[#1586D6]">${plan.price}</span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>

                  <div className="mb-4">
                    <div className="font-medium text-gray-900">{plan.visits}</div>
                    {plan.extraVisit && <div className="text-sm text-gray-500">{plan.extraVisit}</div>}
                  </div>

                  <ul className="space-y-3">
                    {plan.services.map((service, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheck className="h-5 w-5 text-[#1586D6] shrink-0" />
                        <span className="ml-3 text-gray-600">{service}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`mt-8 w-full rounded-lg px-4 py-2 text-center text-sm font-semibold transition-colors ${
                      selectedPlan === plan.id
                        ? "bg-[#1586D6] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-[#1586D6] hover:text-white"
                    }`}
                  >
                    {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedPlan && (
            <div className="mt-12 max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Complete Your Registration</h2>
              <p className="text-lg text-gray-700 mb-4">
                <strong>Important:</strong> Your card will not be charged until your first visit.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  Click the button below to securely enter your payment details.
                  {selectedPlan === "cna-visit" &&
                    " For the CNA Visit plan, you'll only be charged when you schedule a visit."}
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                <button
                  type="submit"
                  disabled={isProcessing || !stripePromise}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#1586D6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1586D6] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Proceed to Secure Payment"}
                </button>
              </form>
            </div>
          )}
        </FadeInView>
      </div>
    </div>
  )
}