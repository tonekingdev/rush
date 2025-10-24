"use client"

import { useState, useEffect } from "react"
import { FaUser, FaCalendarAlt, FaEdit, FaEye, FaToggleOn, FaToggleOff, FaUserNurse, FaUserMd } from "react-icons/fa"

interface RushSubscription {
  id: number
  user_id: string
  full_name: string
  email: string
  phone_number: string
  subscription_status: string
  start_date: string
  end_date?: string
  next_visit_date?: string
  visits_used_this_month: number
  visits_remaining_this_month: number
  last_visit_date?: string
  monthly_price: number
  total_paid: number
  payment_status: string
  auto_renew: boolean
  created_at: string
}

export function RushSubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<RushSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/rush-subscriptions.php", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setSubscriptions(data.subscriptions || [])
      } else {
        throw new Error(data.error || "Failed to fetch subscription data")
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err)
      setError(err instanceof Error ? err.message : "Failed to load subscriptions")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (subscriptionId: number, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/rush-subscriptions.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: subscriptionId,
          subscription_status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchSubscriptions() // Refresh the list
      } else {
        throw new Error(data.error || "Failed to update subscription")
      }
    } catch (err) {
      console.error("Error updating subscription:", err)
      setError(err instanceof Error ? err.message : "Failed to update subscription")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "refunded":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredSubscriptions = subscriptions.filter(
    (sub) => selectedStatus === "all" || sub.subscription_status === selectedStatus,
  )

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1586D6]"></div>
          <span className="ml-3 text-gray-600">Loading RUSH Subscriptions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">RUSH Subscription Management</h3>
            <p className="text-sm text-gray-600">Manage monthly subscription plans (1 Nurse + 1 CNA visit per month)</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>}

        {/* Subscriptions Table */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subscription.full_name}</div>
                        <div className="text-sm text-gray-500">{subscription.email}</div>
                        <div className="text-xs text-gray-400">
                          ID: {subscription.user_id} | Phone: {subscription.phone_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.subscription_status)}`}
                    >
                      {subscription.subscription_status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Auto-renew: {subscription.auto_renew ? "Yes" : "No"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <FaUserMd className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm">Nurse</span>
                      </div>
                      <div className="flex items-center">
                        <FaUserNurse className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm">CNA</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Used: {subscription.visits_used_this_month}/2 | Remaining:{" "}
                      {subscription.visits_remaining_this_month}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">${subscription.monthly_price}/month</div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(subscription.payment_status)}`}
                      >
                        {subscription.payment_status}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">Total: ${subscription.total_paid}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {subscription.next_visit_date ? (
                        <div className="flex items-center">
                          <FaCalendarAlt className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{new Date(subscription.next_visit_date).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                      {subscription.last_visit_date && (
                        <div className="text-xs text-gray-500 mt-1">
                          Last: {new Date(subscription.last_visit_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {subscription.subscription_status === "active" ? (
                        <button
                          onClick={() => handleStatusChange(subscription.id, "cancelled")}
                          className="text-red-600 hover:text-red-700"
                          title="Cancel Subscription"
                        >
                          <FaToggleOff className="h-4 w-4" />
                        </button>
                      ) : subscription.subscription_status === "cancelled" ? (
                        <button
                          onClick={() => handleStatusChange(subscription.id, "active")}
                          className="text-green-600 hover:text-green-700"
                          title="Reactivate Subscription"
                        >
                          <FaToggleOn className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button className="text-[#1586D6] hover:text-blue-700" title="View Details">
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700" title="Edit Subscription">
                        <FaEdit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <FaUser className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">No RUSH Subscriptions found</p>
                <p className="text-sm">
                  {selectedStatus === "all"
                    ? "No patients have subscribed to the RUSH Subscription plan yet."
                    : `No ${selectedStatus} RUSH Subscriptions found.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {subscriptions.filter((s) => s.subscription_status === "active").length}
            </div>
            <div className="text-sm text-blue-600">Active Subscriptions</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {subscriptions.reduce((total, s) => total + (2 - s.visits_remaining_this_month), 0)}
            </div>
            <div className="text-sm text-green-600">Visits Used This Month</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {subscriptions.reduce((total, s) => total + s.visits_remaining_this_month, 0)}
            </div>
            <div className="text-sm text-yellow-600">Visits Remaining</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ${(subscriptions.filter((s) => s.subscription_status === "active").length * 109).toFixed(2)}
            </div>
            <div className="text-sm text-purple-600">Monthly Recurring Revenue</div>
          </div>
        </div>
      </div>
    </div>
  )
}