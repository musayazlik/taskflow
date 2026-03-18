import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: string) {
  switch (type) {
    case "success":
      return CheckCircle;
    case "error":
      return AlertCircle;
    case "warning":
      return AlertTriangle;
    default:
      return Info;
  }
}

/**
 * Get notification styles based on type
 */
export function getNotificationStyles(type: string) {
  switch (type) {
    case "success":
      return {
        icon: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        border: "border-emerald-200 dark:border-emerald-800",
      };
    case "error":
      return {
        icon: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/30",
        border: "border-red-200 dark:border-red-800",
      };
    case "warning":
      return {
        icon: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-100 dark:bg-amber-900/30",
        border: "border-amber-200 dark:border-amber-800",
      };
    default:
      return {
        icon: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        border: "border-blue-200 dark:border-blue-800",
      };
  }
}
