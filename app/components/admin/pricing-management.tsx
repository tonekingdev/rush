"use client"

import { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaStar, FaToggleOn, FaToggleOff } from "react-icons/fa"

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

interface PricingManagementProps {
  hasAccess: boolean
}

export function PricingManagement({ hasAccess }: PricingManagementProps) {
  const [plans, setPlans] = useState<PricePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<PricePlan | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [togglingPlan, setTogglingPlan] = useState<number | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    service_tier: "",
    included_services: "",
    patient_price: 0,
    enabled: true,
    notes: "",
    is_popular: false,
  })

  useEffect(() => {
    if (hasAccess) {
      fetchPlans()
    }
  }, [hasAccess])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/pricing.php", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setPlans(data.plans || [])
      } else {
        throw new Error(data.error || "Failed to fetch pricing data")
      }
    } catch (err) {
      console.error("Error fetching pricing data:", err)
      setError(err instanceof Error ? err.message : "Failed to load pricing data")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (plan: PricePlan) => {
    setEditingPlan(plan)
    setFormData({
      service_tier: plan.service_tier,
      included_services: plan.included_services,
      patient_price: plan.patient_price,
      enabled: plan.enabled,
      notes: plan.notes || "",
      is_popular: plan.is_popular || false,
    })
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingPlan(null)
    setFormData({
      service_tier: "",
      included_services: "",
      patient_price: 0,
      enabled: true,
      notes: "",
      is_popular: false,
    })
  }

  const handleCancel = () => {
    setEditingPlan(null)
    setIsCreating(false)
    setFormData({
      service_tier: "",
      included_services: "",
      patient_price: 0,
      enabled: true,
      notes: "",
      is_popular: false,
    })
    setError(null)
  }

  const handleSave = async () => {
    // Client-side validation
    if (!formData.service_tier.trim()) {
      setError("Service tier is required")
      return
    }

    if (!formData.included_services.trim()) {
      setError("Included services are required")
      return
    }

    if (formData.patient_price < 0) {
      setError("Price cannot be negative")
      return
    }

    if (formData.patient_price === 0) {
      if (!confirm("Are you sure you want to set the price to $0?")) {
        return
      }
    }

    try {
      setSaving(true)
      setError(null)

      const url = "/api/admin/pricing.php"
      const method = editingPlan ? "PUT" : "POST"

      const payload = editingPlan ? { id: editingPlan.id, ...formData } : formData

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        await fetchPlans()
        handleCancel()
      } else {
        throw new Error(data.message || data.error || "Failed to save plan")
      }
    } catch (err) {
      console.error("Error saving plan:", err)
      setError(err instanceof Error ? err.message : "Network error. Please check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (planId: number) => {
    if (!confirm("Are you sure you want to delete this pricing plan? This action cannot be undone.")) {
      return
    }

    try {
      setDeletingPlan(planId)
      setError(null)

      const response = await fetch("/api/admin/pricing.php", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        await fetchPlans()
      } else {
        throw new Error(data.error || "Failed to delete plan")
      }
    } catch (err) {
      console.error("Error deleting plan:", err)
      setError(err instanceof Error ? err.message : "Failed to delete plan")
    } finally {
      setDeletingPlan(null)
    }
  }

  const handleToggleEnabled = async (plan: PricePlan) => {
    try {
      setTogglingPlan(plan.id)
      setError(null)

      const response = await fetch("/api/admin/pricing.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: plan.id,
          enabled: !plan.enabled,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        await fetchPlans()
      } else {
        throw new Error(data.error || "Failed to update plan")
      }
    } catch (err) {
      console.error("Error updating plan:", err)
      setError(err instanceof Error ? err.message : "Failed to update plan")
    } finally {
      setTogglingPlan(null)
    }
  }

  if (!hasAccess) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <FaTimes className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don&apos;t have permission to manage pricing plans.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-4xl text-[#1586D6]" />
          <span className="ml-3 text-gray-600">Loading pricing plans...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Pricing Management</h3>
          <button
            onClick={handleCreate}
            disabled={isCreating || editingPlan !== null}
            className="bg-[#1586D6] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="h-4 w-4 mr-2" />
            Add New Plan
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={fetchPlans}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Create/Edit Form */}
        {(isCreating || editingPlan) && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-md font-medium text-gray-900 mb-4">{editingPlan ? "Edit Plan" : "Create New Plan"}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Tier *</label>
                <input
                  type="text"
                  value={formData.service_tier}
                  onChange={(e) => setFormData({ ...formData, service_tier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
                  placeholder="e.g., RUSH Core"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.patient_price}
                  onChange={(e) => setFormData({ ...formData, patient_price: Number.parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Included Services *</label>
                <textarea
                  value={formData.included_services}
                  onChange={(e) => setFormData({ ...formData, included_services: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
                  placeholder="Describe what's included in this plan..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
                  placeholder="Additional notes or important information..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Enabled</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Mark as Popular</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.service_tier.trim() || !formData.included_services.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1586D6] border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="h-4 w-4 mr-2" />
                    Save Plan
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Plans List */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {plan.service_tier}
                          {plan.is_popular && <FaStar className="h-4 w-4 text-yellow-400 ml-2" />}
                        </div>
                        {plan.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {plan.notes.length > 50 ? `${plan.notes.substring(0, 50)}...` : plan.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${plan.patient_price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{plan.included_services}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleEnabled(plan)}
                      disabled={togglingPlan === plan.id}
                      className={`flex items-center ${
                        plan.enabled ? "text-green-600" : "text-gray-400"
                      } hover:opacity-75 disabled:opacity-50`}
                    >
                      {togglingPlan === plan.id ? (
                        <FaSpinner className="animate-spin h-5 w-5 mr-1" />
                      ) : plan.enabled ? (
                        <>
                          <FaToggleOn className="h-5 w-5 mr-1" />
                          <span className="text-sm">Enabled</span>
                        </>
                      ) : (
                        <>
                          <FaToggleOff className="h-5 w-5 mr-1" />
                          <span className="text-sm">Disabled</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        disabled={isCreating || editingPlan !== null}
                        className="text-[#1586D6] hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit Plan"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        disabled={deletingPlan === plan.id || isCreating || editingPlan !== null}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Plan"
                      >
                        {deletingPlan === plan.id ? (
                          <FaSpinner className="animate-spin h-4 w-4" />
                        ) : (
                          <FaTrash className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {plans.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No pricing plans found</p>
                <p className="text-sm">Create your first pricing plan to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}