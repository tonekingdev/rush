"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/app/components/admin/auth-guard"
import { FaSave, FaSpinner } from "react-icons/fa"

interface Settings {
  siteName: string
  siteEmail: string
  sitePhone: string
  siteAddress: string
  emailNotifications: boolean
  autoApproval: boolean
  requireDocuments: boolean
  maxFileSize: number
  allowedFileTypes: string[]
  smtpHost: string
  smtpPort: string
  smtpUsername: string
  smtpPassword: string
  smtpEncryption: string
}

export function SettingsPanel() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<Settings>({
    siteName: "RUSH Healthcare",
    siteEmail: "admin@rushhealthc.com",
    sitePhone: "",
    siteAddress: "",
    emailNotifications: true,
    autoApproval: false,
    requireDocuments: true,
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    smtpEncryption: "tls",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    // Check if user is super_admin
    if (user && user.role !== "super_admin") {
      setAccessDenied(true)
      setIsLoading(false)
      return
    }

    fetchSettings()
  }, [user])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings.php", {
        credentials: "include",
      })

      if (response.status === 403) {
        setAccessDenied(true)
        return
      }

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Map API settings to component settings
          const apiSettings = data.settings
          setSettings({
            siteName: apiSettings.site_name?.value || "RUSH Healthcare",
            siteEmail: apiSettings.admin_email?.value || "admin@rushhealthc.com",
            sitePhone: apiSettings.support_phone?.value || "",
            siteAddress: apiSettings.site_address?.value || "",
            emailNotifications: apiSettings.email_notifications?.value === "true",
            autoApproval: apiSettings.application_auto_approve?.value === "true",
            requireDocuments: apiSettings.require_documents?.value !== "false",
            maxFileSize: Number.parseInt(apiSettings.max_file_size?.value || "10485760") / (1024 * 1024), // Convert bytes to MB
            allowedFileTypes: apiSettings.allowed_file_types?.value?.split(",") || [
              "pdf",
              "doc",
              "docx",
              "jpg",
              "jpeg",
              "png",
            ],
            smtpHost: apiSettings.smtp_host?.value || "",
            smtpPort: apiSettings.smtp_port?.value || "587",
            smtpUsername: apiSettings.smtp_user?.value || "",
            smtpPassword: apiSettings.smtp_password?.value || "",
            smtpEncryption: apiSettings.smtp_encryption?.value || "tls",
          })
        } else {
          setIsError(true)
          setMessage(data.message || "Failed to load settings")
        }
      } else {
        setIsError(true)
        setMessage("Failed to load settings")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      setIsError(true)
      setMessage("An error occurred while fetching settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage("")
    setIsError(false)

    try {
      // Map component settings to API format
      const apiSettings = {
        site_name: settings.siteName,
        admin_email: settings.siteEmail,
        support_phone: settings.sitePhone,
        site_address: settings.siteAddress,
        email_notifications: settings.emailNotifications.toString(),
        application_auto_approve: settings.autoApproval.toString(),
        require_documents: settings.requireDocuments.toString(),
        max_file_size: (settings.maxFileSize * 1024 * 1024).toString(), // Convert MB to bytes
        allowed_file_types: settings.allowedFileTypes.join(","),
        smtp_host: settings.smtpHost,
        smtp_port: settings.smtpPort,
        smtp_user: settings.smtpUsername,
        smtp_password: settings.smtpPassword,
        smtp_encryption: settings.smtpEncryption,
      }

      const response = await fetch("/api/settings.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(apiSettings),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage("Settings saved successfully")
        setIsError(false)
        setTimeout(() => setMessage(""), 3000)
      } else {
        setIsError(true)
        setMessage(data.message || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setIsError(true)
      setMessage("An error occurred while saving settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    if (checked) {
      setSettings((prev) => ({
        ...prev,
        allowedFileTypes: [...prev.allowedFileTypes, fileType],
      }))
    } else {
      setSettings((prev) => ({
        ...prev,
        allowedFileTypes: prev.allowedFileTypes.filter((type) => type !== fileType),
      }))
    }
  }

  const tabs = [
    { id: "general", label: "General" },
    { id: "application", label: "Application Settings" },
    { id: "email", label: "Email Settings" },
    { id: "file", label: "File Settings" },
  ]

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You do not have permission to access system settings.</p>
          <p className="mt-1 text-sm text-gray-500">Only super administrators can manage system settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-800">System Settings</h2>
      </div>

      {message && (
        <div
          className={`p-3 mx-6 mt-4 rounded-md ${isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-[#1586D6] text-[#1586D6]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSave} className="p-6">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="siteEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Site Email
                </label>
                <input
                  type="email"
                  id="siteEmail"
                  value={settings.siteEmail}
                  onChange={(e) => setSettings((prev) => ({ ...prev, siteEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="sitePhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Site Phone
                </label>
                <input
                  type="tel"
                  id="sitePhone"
                  value={settings.sitePhone}
                  onChange={(e) => setSettings((prev) => ({ ...prev, sitePhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="siteAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Site Address
                </label>
                <textarea
                  id="siteAddress"
                  value={settings.siteAddress}
                  onChange={(e) => setSettings((prev) => ({ ...prev, siteAddress: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Application Settings */}
        {activeTab === "application" && (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="rounded border-gray-300 text-[#1586D6] focus:ring-[#1586D6]"
                />
                <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                  Enable email notifications for new applications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoApproval"
                  checked={settings.autoApproval}
                  onChange={(e) => setSettings((prev) => ({ ...prev, autoApproval: e.target.checked }))}
                  className="rounded border-gray-300 text-[#1586D6] focus:ring-[#1586D6]"
                />
                <label htmlFor="autoApproval" className="ml-2 text-sm text-gray-700">
                  Enable automatic approval for applications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireDocuments"
                  checked={settings.requireDocuments}
                  onChange={(e) => setSettings((prev) => ({ ...prev, requireDocuments: e.target.checked }))}
                  className="rounded border-gray-300 text-[#1586D6] focus:ring-[#1586D6]"
                />
                <label htmlFor="requireDocuments" className="ml-2 text-sm text-gray-700">
                  Require document uploads for applications
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === "email" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings((prev) => ({ ...prev, smtpHost: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  id="smtpPort"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings((prev) => ({ ...prev, smtpPort: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  id="smtpUsername"
                  value={settings.smtpUsername}
                  onChange={(e) => setSettings((prev) => ({ ...prev, smtpUsername: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  id="smtpPassword"
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings((prev) => ({ ...prev, smtpPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="smtpEncryption" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Encryption
                </label>
                <select
                  id="smtpEncryption"
                  value={settings.smtpEncryption}
                  onChange={(e) => setSettings((prev) => ({ ...prev, smtpEncryption: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* File Settings */}
        {activeTab === "file" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                id="maxFileSize"
                value={settings.maxFileSize}
                onChange={(e) => setSettings((prev) => ({ ...prev, maxFileSize: Number.parseInt(e.target.value) }))}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1586D6] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "txt", "rtf"].map((fileType) => (
                  <div key={fileType} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`fileType-${fileType}`}
                      checked={settings.allowedFileTypes.includes(fileType)}
                      onChange={(e) => handleFileTypeChange(fileType, e.target.checked)}
                      className="rounded border-gray-300 text-[#1586D6] focus:ring-[#1586D6]"
                    />
                    <label htmlFor={`fileType-${fileType}`} className="ml-2 text-sm text-gray-700 uppercase">
                      {fileType}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-6 border-t">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center px-6 py-2 bg-[#1586D6] text-white rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-50"
          >
            {isSaving ? <FaSpinner className="mr-2 animate-spin" /> : <FaSave className="mr-2" />}
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  )
}