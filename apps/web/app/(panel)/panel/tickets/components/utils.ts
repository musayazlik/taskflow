/**
 * Format distance to now (e.g., "2 hours ago")
 */
export function formatDistanceToNow(
  date: Date,
  options?: { addSuffix?: boolean },
): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let result: string;

  if (diffMins < 1) result = "just now";
  else if (diffMins < 60)
    result = `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  else if (diffHours < 24)
    result = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  else if (diffDays < 30)
    result = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  else
    result = `${Math.floor(diffDays / 30)} month${
      Math.floor(diffDays / 30) > 1 ? "s" : ""
    } ago`;

  if (options?.addSuffix && !result.includes("ago")) {
    return `${result} ago`;
  }

  return result;
}

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
