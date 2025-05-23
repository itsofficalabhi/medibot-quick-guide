
import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export type ToasterToast = ToastProps & {
  id: string
}

export const toasts: ToasterToast[] = []

export function useToast() {
  function toast({ title, description, action, variant, ...props }: ToastProps) {
    const id = Math.random().toString(36).substring(2, 9)
    const toastData = { id, title, description, action, variant, ...props }
    
    // Add toast to our local array
    toasts.push(toastData)
    
    // Use Sonner toast for actual display
    sonnerToast(title || "", {
      description,
      action,
      ...props,
    })

    return {
      id,
      dismiss: () => dismiss(id),
      update: (props: ToastProps) => update({ ...props, id }),
    }
  }

  function update(props: ToasterToast) {
    const index = toasts.findIndex(t => t.id === props.id)
    if (index !== -1) {
      toasts[index] = { ...toasts[index], ...props }
    }
  }

  function dismiss(toastId?: string) {
    if (toastId) {
      const index = toasts.findIndex(t => t.id === toastId)
      if (index !== -1) {
        toasts.splice(index, 1)
      }
    } else {
      toasts.length = 0
    }
  }

  return {
    toast,
    dismiss,
    toasts
  }
}

// Export a direct toast function that matches the sonner API
export const toast = sonnerToast;
