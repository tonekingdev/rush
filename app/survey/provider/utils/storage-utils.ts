// Utility functions for handling application data storage and retrieval

export interface SavedApplication {
  applicationId: string
  applicantName: string
  email: string
  currentStep: number
  lastModified: number
  progress: number
}

// Fixed: Replace 'any' with proper type
export interface ApplicationData {
  [key: string]: string | number | boolean | File | null | undefined | Array<unknown> | Record<string, unknown>
}

export interface ApplicationMetadata {
  applicationId: string
  createdAt: string
  lastModified: string
  currentStep: number
  completionPercentage: number
}

export class ApplicationStorageManager {
  private static readonly STORAGE_PREFIX = "provider_app_"
  private static readonly APPLICATIONS_LIST_KEY = "saved_applications"
  private static readonly MAX_APPLICATIONS = 5
  private static readonly STORAGE_EXPIRY_DAYS = 30

  /**
   * Generate a unique application ID
   */
  static generateApplicationId(): string {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Save application data to localStorage
   */
  static saveApplicationData(applicationId: string, formData: ApplicationData, currentStep: number): boolean {
    try {
      // Create a serializable copy of form data (excluding File objects)
      const serializableData = this.createSerializableData(formData)

      const applicationData = {
        formData: serializableData,
        currentStep,
        lastModified: Date.now(),
        version: "1.0",
      }

      // Save the application data
      const storageKey = `${this.STORAGE_PREFIX}${applicationId}`
      localStorage.setItem(storageKey, JSON.stringify(applicationData))

      // Update the applications list
      this.updateApplicationsList(applicationId, formData, currentStep)

      return true
    } catch (error) {
      console.error("Failed to save application data:", error)
      return false
    }
  }

  /**
   * Load application data from localStorage
   */
  static loadApplicationData(applicationId: string): ApplicationData | null {
    try {
      const storageKey = `${this.STORAGE_PREFIX}${applicationId}`
      const savedData = localStorage.getItem(storageKey)

      if (!savedData) {
        return null
      }

      const parsedData = JSON.parse(savedData)

      // Check if data is expired
      const daysSinceModified = (Date.now() - parsedData.lastModified) / (1000 * 60 * 60 * 24)
      if (daysSinceModified > this.STORAGE_EXPIRY_DAYS) {
        this.deleteApplication(applicationId)
        return null
      }

      return parsedData.formData
    } catch (error) {
      console.error("Failed to load application data:", error)
      return null
    }
  }

  /**
   * Get all saved applications
   */
  static getAllSavedApplications(): SavedApplication[] {
    try {
      const savedApps = localStorage.getItem(this.APPLICATIONS_LIST_KEY)
      if (!savedApps) {
        return []
      }

      const applications: SavedApplication[] = JSON.parse(savedApps)

      // Filter out expired applications
      const validApplications = applications.filter((app) => {
        const daysSinceModified = (Date.now() - app.lastModified) / (1000 * 60 * 60 * 24)
        if (daysSinceModified > this.STORAGE_EXPIRY_DAYS) {
          this.deleteApplication(app.applicationId)
          return false
        }
        return true
      })

      // Sort by last modified (most recent first)
      validApplications.sort((a, b) => b.lastModified - a.lastModified)

      return validApplications
    } catch (error) {
      console.error("Failed to get saved applications:", error)
      return []
    }
  }

  /**
   * Delete a specific application
   */
  static deleteApplication(applicationId: string): boolean {
    try {
      // Remove the application data
      const storageKey = `${this.STORAGE_PREFIX}${applicationId}`
      localStorage.removeItem(storageKey)

      // Update the applications list
      const applications = this.getAllSavedApplications()
      const updatedApplications = applications.filter((app) => app.applicationId !== applicationId)
      localStorage.setItem(this.APPLICATIONS_LIST_KEY, JSON.stringify(updatedApplications))

      return true
    } catch (error) {
      console.error("Failed to delete application:", error)
      return false
    }
  }

  /**
   * Clear all saved applications
   */
  static clearAllApplications(): boolean {
    try {
      const applications = this.getAllSavedApplications()

      // Remove all application data
      applications.forEach((app) => {
        const storageKey = `${this.STORAGE_PREFIX}${app.applicationId}`
        localStorage.removeItem(storageKey)
      })

      // Clear the applications list
      localStorage.removeItem(this.APPLICATIONS_LIST_KEY)

      return true
    } catch (error) {
      console.error("Failed to clear all applications:", error)
      return false
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0
      const applications = this.getAllSavedApplications()

      applications.forEach((app) => {
        const storageKey = `${this.STORAGE_PREFIX}${app.applicationId}`
        const data = localStorage.getItem(storageKey)
        if (data) {
          used += data.length
        }
      })

      // Estimate available storage (localStorage typically has 5-10MB limit)
      const estimatedLimit = 5 * 1024 * 1024 // 5MB
      const available = Math.max(0, estimatedLimit - used)
      const percentage = (used / estimatedLimit) * 100

      return { used, available, percentage }
    } catch (error) {
      console.error("Failed to get storage info:", error)
      return { used: 0, available: 0, percentage: 0 }
    }
  }

  /**
   * Create a serializable copy of form data (excluding File objects and functions)
   */
  private static createSerializableData(formData: ApplicationData): ApplicationData {
    const serializable: ApplicationData = {}

    for (const [key, value] of Object.entries(formData)) {
      if (value instanceof File) {
        // Store file metadata instead of the file itself
        serializable[`${key}_metadata`] = {
          name: value.name,
          size: value.size,
          type: value.type,
          lastModified: value.lastModified,
        }
        // Don't store the actual file
        continue
      } else if (typeof value === "function") {
        // Skip functions
        continue
      } else if (value && typeof value === "object") {
        // Handle arrays and objects
        try {
          serializable[key] = JSON.parse(JSON.stringify(value))
        } catch {
          // Skip if can't serialize
          continue
        }
      } else {
        // Store primitive values
        serializable[key] = value
      }
    }

    return serializable
  }

  /**
   * Update the applications list with current application info
   */
  private static updateApplicationsList(applicationId: string, formData: ApplicationData, currentStep: number): void {
    try {
      const applications = this.getAllSavedApplications()

      // Remove existing entry for this application
      const filteredApplications = applications.filter((app) => app.applicationId !== applicationId)

      // Create new entry
      const newApplication: SavedApplication = {
        applicationId,
        applicantName: this.getApplicantName(formData),
        email: (formData.username as string) || (formData.email as string) || "",
        currentStep,
        lastModified: Date.now(),
        progress: (currentStep / 5) * 100,
      }

      // Add to beginning of array
      filteredApplications.unshift(newApplication)

      // Keep only the most recent applications
      const limitedApplications = filteredApplications.slice(0, this.MAX_APPLICATIONS)

      // Save updated list
      localStorage.setItem(this.APPLICATIONS_LIST_KEY, JSON.stringify(limitedApplications))
    } catch (error) {
      console.error("Failed to update applications list:", error)
    }
  }

  /**
   * Extract applicant name from form data
   */
  private static getApplicantName(formData: ApplicationData): string {
    const firstName = (formData.firstName as string) || ""
    const lastName = (formData.lastName as string) || ""

    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (lastName) {
      return lastName
    } else {
      return "Unnamed Application"
    }
  }

  /**
   * Check if localStorage is available
   */
  static isStorageAvailable(): boolean {
    try {
      const test = "__storage_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Cleanup expired applications
   */
  static cleanupExpiredApplications(): number {
    try {
      const applications = this.getAllSavedApplications()
      let cleanedCount = 0

      applications.forEach((app) => {
        const daysSinceModified = (Date.now() - app.lastModified) / (1000 * 60 * 60 * 24)
        if (daysSinceModified > this.STORAGE_EXPIRY_DAYS) {
          this.deleteApplication(app.applicationId)
          cleanedCount++
        }
      })

      return cleanedCount
    } catch {
      // Fixed: Removed unused error variable
      console.error("Failed to cleanup expired applications")
      return 0
    }
  }

  // Get application metadata
  static getApplicationMetadata(applicationId: string): ApplicationMetadata | null {
    return this.getExistingMetadata(applicationId)
  }

  // Check if application is still valid (not too old)
  private static isApplicationValid(metadata: ApplicationMetadata): boolean {
    const now = new Date()
    const lastModified = new Date(metadata.lastModified)
    const daysDiff = (now.getTime() - lastModified.getTime()) / (1000 * 3600 * 24)
    return daysDiff <= this.STORAGE_EXPIRY_DAYS
  }

  // Get existing metadata
  private static getExistingMetadata(applicationId: string): ApplicationMetadata | null {
    try {
      const storageKey = `${this.STORAGE_PREFIX}${applicationId}`
      const metadata = localStorage.getItem(storageKey)
      return metadata ? JSON.parse(metadata) : null
    } catch {
      return null
    }
  }
}

// Export utility functions for backward compatibility
export const saveApplicationProgress = ApplicationStorageManager.saveApplicationData
export const loadApplicationProgress = ApplicationStorageManager.loadApplicationData
export const getSavedApplications = ApplicationStorageManager.getAllSavedApplications
export const deleteApplicationProgress = ApplicationStorageManager.deleteApplication
export const clearAllProgress = ApplicationStorageManager.clearAllApplications
