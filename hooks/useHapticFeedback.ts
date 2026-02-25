// hooks/useHapticFeedback.ts
import { useCallback } from 'react'

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error'

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: HapticType = 'medium') => {
    // Check if vibration API is supported
    if (!navigator.vibrate) return

    const patterns: Record<HapticType, number | number[]> = {
      light: [50],
      medium: [100],
      heavy: [200],
      success: [100, 50, 100],
      error: [200, 100, 200, 100]
    }

    navigator.vibrate(patterns[type])
  }, [])

  return { triggerHaptic }
}