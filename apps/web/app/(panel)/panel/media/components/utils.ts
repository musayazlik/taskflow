/**
 * Utility functions for media page
 */

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/**
 * Format date timestamp for display
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if file is an image
 */
export function isImageFile(file: { type?: string; name: string }): boolean {
  return (
    file.type?.startsWith("image/") ||
    !!file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
  );
}
