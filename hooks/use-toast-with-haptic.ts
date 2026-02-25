// hooks/use-toast-with-haptic.ts
import { useToast } from "@/hooks/use-toast"
import { useHapticFeedback } from "./useHapticFeedback"

interface ToastProps {
  title: string
  description: string
  variant?: 'default' | 'destructive'
}

interface ToastWithHaptic {
  success: (props: ToastProps) => void
  error: (props: ToastProps) => void
  warning: (props: ToastProps) => void
  info: (props: ToastProps) => void
}

export const useToastWithHaptic = (): ToastWithHaptic => {
  const { toast } = useToast()
  const { triggerHaptic } = useHapticFeedback()

  const toastWithHaptic: ToastWithHaptic = {
    success: (props: ToastProps) => {
      triggerHaptic('success')
      toast({ ...props, variant: 'default' })
    },
    error: (props: ToastProps) => {
      triggerHaptic('error')
      toast({ ...props, variant: 'destructive' })
    },
    warning: (props: ToastProps) => {
      triggerHaptic('medium')
      toast({ ...props, variant: 'destructive' })
    },
    info: (props: ToastProps) => {
      triggerHaptic('light')
      toast(props)
    }
  }

  return toastWithHaptic
}