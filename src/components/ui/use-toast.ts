
import { toast } from "sonner";

// Re-export toast from sonner for compatibility
export { toast };

// Create a useToast hook that returns the toast function
export const useToast = () => {
  return { toast };
};
