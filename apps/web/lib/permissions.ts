/**
 * Frontend Permission Helpers
 * For use with dynamic string-based permissions
 */

/**
 * Static Fallbacks for core roles (matching backend logic)
 */
export const STATIC_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"], // Wildcard: all permissions
  ADMIN: [
    "user:read",
    "user:create",
    "user:update",
    "user:delete",
    "role:manage",
    "product:read",
    "product:create",
    "product:update",
    "order:read",
    "order:update",
    "settings:read",
  ],
  USER: ["product:read"],
};

/**
 * Client-side permission check (synchronous, using static fallbacks)
 * For dynamic roles, you would need to fetch permissions from the API.
 */
export function hasPermission(
  role: string | undefined,
  permission: string,
): boolean {
  if (!role) return false;

  const perms = STATIC_ROLE_PERMISSIONS[role];
  if (!perms) return false;

  return perms.includes("*") || perms.includes(permission);
}

/**
 * Client-side multiple permission check (All)
 */
export function hasAllPermissions(
  role: string | undefined,
  permissions: string[],
): boolean {
  if (!role) return false;
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Client-side multiple permission check (Any)
 */
export function hasAnyPermission(
  role: string | undefined,
  permissions: string[],
): boolean {
  if (!role) return false;
  return permissions.some((p) => hasPermission(role, p));
}
