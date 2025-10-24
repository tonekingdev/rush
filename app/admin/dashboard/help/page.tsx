"use client"

import type React from "react"

import { useState } from "react"
import {
  FaSearch,
  FaHome,
  FaClipboardList,
  FaUserMd,
  FaUserFriends,
  FaUsers,
  FaCog,
  FaChevronRight,
  FaBook,
  FaVideo,
  FaDownload,
  FaExternalLinkAlt,
  FaExclamationCircle,
  FaEnvelope,
  FaClock,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaEdit,
} from "react-icons/fa"

interface HelpSection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  content: React.ReactNode
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  const helpSections: HelpSection[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: FaHome,
      description: "Learn the basics of navigating the RUSH Healthcare Admin Panel",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Welcome to RUSH Healthcare Admin Panel</h3>
            <p className="text-gray-600 mb-4">
              This admin panel is designed to help you manage all aspects of the RUSH Healthcare platform efficiently.
              Here&apos;s what you can do:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Monitor application statistics and system health</li>
              <li>Review and manage provider applications</li>
              <li>Oversee patient registrations and surveys</li>
              <li>Handle document management and communications</li>
              <li>Manage user accounts and permissions</li>
              <li>Configure system settings</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Navigation</h4>
            <p className="text-gray-600 mb-2">
              Use the sidebar on the left to navigate between different sections. The main sections include:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-1 text-sm text-gray-600">
                <li>
                  • <strong>Dashboard:</strong> Overview of system statistics
                </li>
                <li>
                  • <strong>Applications:</strong> Provider application management
                </li>
                <li>
                  • <strong>Providers:</strong> Approved provider management
                </li>
                <li>
                  • <strong>Patient Surveys:</strong> Patient feedback and surveys
                </li>
                <li>
                  • <strong>Patients:</strong> Patient account management
                </li>
                <li>
                  • <strong>Documents:</strong> File and document management
                </li>
                <li>
                  • <strong>Communications:</strong> Message and notification center
                </li>
                <li>
                  • <strong>User Management:</strong> Admin user management (Super Admin only)
                </li>
                <li>
                  • <strong>Settings:</strong> System configuration
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Dashboard Overview",
      icon: FaHome,
      description: "Understanding your dashboard metrics and quick actions",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Dashboard Metrics</h3>
            <p className="text-gray-600 mb-4">
              The dashboard provides a real-time overview of your platform&apos;s key metrics:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Total Applications</h4>
                <p className="text-blue-700 text-sm">Shows the total number of provider applications received</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Pending Review</h4>
                <p className="text-yellow-700 text-sm">Applications waiting for your review and approval</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Approved</h4>
                <p className="text-green-700 text-sm">Successfully approved provider applications</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Rejected</h4>
                <p className="text-red-700 text-sm">Applications that didn&apos;t meet requirements</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Quick Actions</h4>
            <p className="text-gray-600 mb-2">Use the quick action buttons to navigate to frequently used sections:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>
                <strong>View Applications:</strong> Jump directly to the applications management page
              </li>
              <li>
                <strong>Generate Reports:</strong> Create and download system reports
              </li>
              <li>
                <strong>Manage Users:</strong> Access user management tools
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "applications",
      title: "Managing Applications",
      icon: FaClipboardList,
      description: "How to review, approve, and manage provider applications",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Management</h3>
            <p className="text-gray-600 mb-4">
              The Applications section allows you to review and manage provider applications efficiently.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Reviewing Applications</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Navigate to the Applications section from the sidebar</li>
              <li>Use filters to sort by status (Pending, Approved, Rejected)</li>
              <li>Click on an application to view detailed information</li>
              <li>Review all submitted documents and information</li>
              <li>Use the action buttons to approve or reject applications</li>
            </ol>
          </div>

          {/* NEW: Application Status Management Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <FaEdit className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">Updating Application Status</h4>
                <p className="text-blue-800 mb-4">
                  You can quickly update an application&apos;s status directly from the applications list:
                </p>

                <div className="space-y-3">
                  <h5 className="font-medium text-blue-900">Status Options:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-md shadow-sm">
                      <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                      <div>
                        <div className="font-medium text-gray-900">Pending</div>
                        <div className="text-xs text-gray-500">Initial submission, awaiting review</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-md shadow-sm">
                      <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                      <div>
                        <div className="font-medium text-gray-900">Under Review</div>
                        <div className="text-xs text-gray-500">Currently being evaluated</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-md shadow-sm">
                      <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                      <div>
                        <div className="font-medium text-gray-900">Approved</div>
                        <div className="text-xs text-gray-500">Application accepted</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white p-3 rounded-md shadow-sm">
                      <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                      <div>
                        <div className="font-medium text-gray-900">Rejected</div>
                        <div className="text-xs text-gray-500">Application declined</div>
                      </div>
                    </div>
                  </div>

                  <h5 className="font-medium text-blue-900 mt-4">How to Update Status:</h5>
                  <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                    <li>Locate the application in the applications list</li>
                    <li>Find the status dropdown in the Status column</li>
                    <li>Click the dropdown and select the new status</li>
                    <li>The status will update immediately in the database</li>
                    <li>The application&apos;s status badge will reflect the new status</li>
                  </ol>

                  <div className="mt-4 p-3 bg-blue-100 rounded">
                    <h6 className="font-medium text-blue-900 mb-2">Status Change Best Practices:</h6>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 text-xs">
                      <li>
                        <FaHourglassHalf className="inline w-3 h-3 mr-1" />
                        Set to &quot;Under Review&quot; when you begin evaluating an application
                      </li>
                      <li>
                        <FaCheckCircle className="inline w-3 h-3 mr-1" />
                        Only &quot;Approve&quot; after verifying all required information
                      </li>
                      <li>
                        <FaTimesCircle className="inline w-3 h-3 mr-1" />
                        Include rejection reasons when setting status to &quot;Rejected&quot;
                      </li>
                      <li>Consider using completion links for incomplete applications before rejecting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Link Section */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <FaExclamationCircle className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-3">Sending Completion Links</h4>
                <p className="text-orange-800 mb-4">
                  When a provider&apos;s application is missing information (license number, certificates, etc.), you can
                  send them a secure completion link.
                </p>

                <div className="space-y-3">
                  <h5 className="font-medium text-orange-900">How to Send a Completion Link:</h5>
                  <ol className="list-decimal list-inside space-y-2 text-orange-800 text-sm">
                    <li>In the Applications list, click the orange warning icon (⚠️) next to the provider&apos;s name</li>
                    <li>Select the missing fields from the checklist (license number, certificates, etc.)</li>
                    <li>Click &quot;Send Completion Link&quot; to email the provider</li>
                    <li>The provider receives a secure link valid for 72 hours</li>
                    <li>They can complete missing information through the secure form</li>
                    <li>Once submitted, their application is automatically updated</li>
                  </ol>

                  <div className="mt-4 p-3 bg-orange-100 rounded">
                    <h6 className="font-medium text-orange-900 mb-2">Security Features:</h6>
                    <ul className="list-disc list-inside space-y-1 text-orange-800 text-xs">
                      <li>
                        <FaClock className="inline w-3 h-3 mr-1" />
                        72-hour expiration for security
                      </li>
                      <li>
                        <FaShieldAlt className="inline w-3 h-3 mr-1" />
                        One-time use tokens
                      </li>
                      <li>
                        <FaEnvelope className="inline w-3 h-3 mr-1" />
                        Email verification required
                      </li>
                      <li>Only missing fields can be updated</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Best Practices</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
              <li>Review applications within 48 hours of submission</li>
              <li>Verify all license numbers and credentials</li>
              <li>Check for complete documentation before approval</li>
              <li>Use completion links for missing information instead of rejecting</li>
              <li>Provide clear rejection reasons when declining applications</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "providers",
      title: "Provider Management",
      icon: FaUserMd,
      description: "Managing approved providers and their information",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Provider Management</h3>
            <p className="text-gray-600 mb-4">Manage all approved healthcare providers in your network.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Provider Actions</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>
                <strong>View Provider Details:</strong> Click on any provider to see their complete profile
              </li>
              <li>
                <strong>Update Status:</strong> Change provider status (Active, Inactive, Suspended)
              </li>
              <li>
                <strong>Edit Information:</strong> Update provider contact details and credentials
              </li>
              <li>
                <strong>View Applications:</strong> See the original application that was approved
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Provider Statuses</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                <span className="text-sm">
                  <strong>Active:</strong> Provider is actively seeing patients
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                <span className="text-sm">
                  <strong>Inactive:</strong> Provider temporarily not seeing patients
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                <span className="text-sm">
                  <strong>Suspended:</strong> Provider access has been suspended
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
              <li>Always verify license renewals and update expiration dates</li>
              <li>Suspended providers cannot access the platform</li>
              <li>Inactive providers can reactivate their accounts</li>
              <li>Keep provider contact information up to date</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "patients",
      title: "Patient Management",
      icon: FaUserFriends,
      description: "Managing patient accounts and information",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Management</h3>
            <p className="text-gray-600 mb-4">
              Oversee patient registrations, accounts, and their interaction with the platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
            <p className="text-gray-600 mb-2">Each patient record includes:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Personal information (name, email, phone)</li>
              <li>Medical conditions and medications</li>
              <li>Insurance information</li>
              <li>Accessibility needs</li>
              <li>Survey responses and feedback</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Patient Actions</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>
                <strong>View Patient Profile:</strong> Access complete patient information
              </li>
              <li>
                <strong>Update Status:</strong> Manage patient account status
              </li>
              <li>
                <strong>View Survey Responses:</strong> See patient feedback and surveys
              </li>
              <li>
                <strong>Manage Communications:</strong> Handle patient messages and notifications
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">🔒 Privacy & Security</h4>
            <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
              <li>All patient data is HIPAA compliant</li>
              <li>Access is logged and monitored</li>
              <li>Only view information necessary for your role</li>
              <li>Report any privacy concerns immediately</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "user-management",
      title: "User Management",
      icon: FaUsers,
      description: "Managing admin users and permissions (Super Admin only)",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">User Management</h3>
            <p className="text-gray-600 mb-4">
              <strong>Note:</strong> This section is only available to Super Administrators.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">User Types</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUsers className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Admin Users</h5>
                  <p className="text-sm text-gray-600">Staff members with admin panel access</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaUserMd className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Providers</h5>
                  <p className="text-sm text-gray-600">Healthcare providers in the network</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaUserFriends className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Patients</h5>
                  <p className="text-sm text-gray-600">Registered patients using the platform</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Managing Users</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>
                <strong>Create Admin Users:</strong> Add new staff members with appropriate permissions
              </li>
              <li>
                <strong>Update User Status:</strong> Activate, deactivate, or suspend user accounts
              </li>
              <li>
                <strong>Reset Passwords:</strong> Help users regain access to their accounts
              </li>
              <li>
                <strong>Assign Roles:</strong> Set user permissions (Admin, Super Admin)
              </li>
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">🚨 Security Guidelines</h4>
            <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
              <li>Only create admin accounts for authorized personnel</li>
              <li>Regularly review and audit user access</li>
              <li>Immediately suspend accounts of departed staff</li>
              <li>Use strong password requirements</li>
              <li>Monitor user activity for suspicious behavior</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "settings",
      title: "System Settings",
      icon: FaCog,
      description: "Configuring system preferences and settings",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">System Settings</h3>
            <p className="text-gray-600 mb-4">Configure various system settings to customize the platform behavior.</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Available Settings</h4>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4">
                <h5 className="font-medium text-gray-900">Email Notifications</h5>
                <p className="text-sm text-gray-600">Configure automated email notifications for various events</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h5 className="font-medium text-gray-900">Application Settings</h5>
                <p className="text-sm text-gray-600">Set application review timeframes and requirements</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <h5 className="font-medium text-gray-900">System Maintenance</h5>
                <p className="text-sm text-gray-600">Schedule maintenance windows and system updates</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <h5 className="font-medium text-gray-900">Security Settings</h5>
                <p className="text-sm text-gray-600">Configure password policies and session timeouts</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">💡 Configuration Tips</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
              <li>Test email settings before enabling notifications</li>
              <li>Keep backup copies of configuration changes</li>
              <li>Document any custom settings for future reference</li>
              <li>Review settings regularly to ensure they meet current needs</li>
            </ul>
          </div>
        </div>
      ),
    },
  ]

  const filteredSections = helpSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Documentation</h1>
          <p className="text-gray-600">Comprehensive guide to using the RUSH Healthcare Admin Panel</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Documentation Sections</h2>
              </div>
              <nav className="p-2">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors ${
                      selectedSection === section.id
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <section.icon
                        className={`w-5 h-5 ${selectedSection === section.id ? "text-blue-600" : "text-gray-400"}`}
                      />
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <FaChevronRight
                      className={`w-4 h-4 ${selectedSection === section.id ? "text-blue-600" : "text-gray-400"}`}
                    />
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Links */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
              </div>
              <div className="p-4 space-y-3">
                <a href="#" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                  <FaVideo className="w-4 h-4" />
                  <span>Video Tutorials</span>
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
                <a href="#" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                  <FaDownload className="w-4 h-4" />
                  <span>Download User Manual</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                  <FaBook className="w-4 h-4" />
                  <span>API Documentation</span>
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {selectedSection ? (
                <div className="p-6">
                  {(() => {
                    const section = helpSections.find((s) => s.id === selectedSection)
                    if (!section) return null

                    return (
                      <div>
                        <div className="flex items-center space-x-3 mb-6">
                          <section.icon className="w-8 h-8 text-blue-600" />
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                            <p className="text-gray-600">{section.description}</p>
                          </div>
                        </div>
                        {section.content}
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <FaBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to the Help Center</h3>
                  <p className="text-gray-600 mb-6">
                    Select a section from the sidebar to get started, or use the search bar to find specific topics.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <button
                      onClick={() => setSelectedSection("getting-started")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Getting Started
                    </button>
                    <button
                      onClick={() => setSelectedSection("dashboard")}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Dashboard Guide
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}