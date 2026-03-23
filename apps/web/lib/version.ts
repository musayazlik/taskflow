/**
 * Global version configuration
 * This file contains version information that can be accessed from anywhere in the application
 */

export const APP_VERSION = "1.0.0";
export type VersionStatus = "stable" | "beta" | "alpha" | "dev";
export const VERSION_STATUS: VersionStatus = "stable";
export const APP_NAME = "TaskFlow";

// Get version display string
export function getVersionDisplay(
  versionStatus: VersionStatus = VERSION_STATUS,
): string {
  return `${APP_VERSION}${versionStatus !== "stable" ? `-${versionStatus}` : ""}`;
}

// Get version badge color based on status
export function getVersionBadgeColor(
  versionStatus: VersionStatus = VERSION_STATUS,
): string {
  switch (versionStatus) {
    case "stable":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "beta":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "alpha":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "dev":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
}
