/**
 * Utility functions for customers page
 */

/**
 * Get initials from name or email
 */
export function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return "?";
  const parts = nameOrEmail.split(" ");
  if (parts.length === 1) {
    const [local] = nameOrEmail.split("@");
    return (local || nameOrEmail).slice(0, 2).toUpperCase();
  }
  return parts
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
