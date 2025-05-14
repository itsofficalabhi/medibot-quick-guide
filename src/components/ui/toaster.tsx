
import { useToast } from "@/hooks/use-toast"
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  // Use Sonner toaster instead of custom implementation
  return <SonnerToaster />
}
