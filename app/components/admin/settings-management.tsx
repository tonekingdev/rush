"use client"

import { useState, useEffect } from "react"
import { FaSave, FaSpinner } from "react-icons/fa"

interface Settings {
  [key: string]: {
    value: string
    description: string
  }
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings.php", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.settings)
        } else {
          setError(data.message || "Failed to fetch settings")
        }
      } else {
        setError("Failed to fetch settings")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      setError("An error occurred while fetching settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: value,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const settingsToSave: { [key: string]: string } = {}
      Object.keys(settings).forEach((key) => {
        settingsToSave[key] = settings[key].value
      })

      const response = await fetch("/api/settings.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settingsToSave),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess("Settings saved successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.message || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setError("An error occurred while saving settings")
    } finally {
      setSaving(false)
    }
  }

  const initializeSettings = async () => {
    try {
      const response = await fetch("/api/settings.php?action=initialize", {
        method: "POST",
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess("Default settings initialized!")
        fetchSettings()
      } else {
        setError(data.message || "Failed to initialize settings")
      }
    } catch (error) {
      console.error("Error initializing settings:", error)
      setError("An error occurred while initializing settings")
    }
  }

  const tabs = [
    { id: "general", name: "General", keys: ["site_name", "admin_email", "support_email"] },
    { id: "email", name: "Email", keys: ["email_notifications"] },
    { id: "files", name: "File Settings", keys: ["max_file_size", "allowed_file_types"] },
    { id: "security", name: "Security", keys: ["session_timeout", "password_min_length"] },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1586D6]"></div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
          <div className="flex space-x-2">
            {Object.keys(settings).length === 0 && (
              <button
                onClick={initializeSettings}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
              >
                Initialize Default Settings
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1586D6] text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaSave className="h-4 w-4" />}
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">{success}</div>}

        {Object.keys(settings).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No settings found. Click &quot;Initialize Default Settings&quot; to get started.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-[#1586D6] text-[#1586D6]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="space-y-6">
              {tabs
                .find((tab) => tab.id === activeTab)
                ?.keys.map((key) => {
                  const setting = settings[key]
                  if (!setting) return null

                  return (
                    <div key={key}>
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                        {key
                          .split("_")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </label>
                      {setting.description && <p className="text-sm text-gray-500 mb-2">{setting.description}</p>}
                      {key === "email_notifications" ? (
                        <select
                          id={key}
                          value={setting.value}
                          onChange={(e) => handleSettingChange(key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
                        >
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      ) : key === "allowed_file_types" ? (
                        <textarea
                          id={key}
                          value={setting.value}
                          onChange={(e) => handleSettingChange(key, e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
                          placeholder="pdf,doc,docx,jpg,jpeg,png"
                        />
                      ) : (
                        <input
                          type={key.includes("email") ? "email" : key.includes("size") ? "number" : "text"}
                          id={key}
                          value={setting.value}
                          onChange={(e) => handleSettingChange(key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6]"
                        />
                      )}
                    </div>
                  )
                })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}