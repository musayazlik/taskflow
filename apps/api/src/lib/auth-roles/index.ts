/**
 * @fileoverview Role helpers and types usable from Nest guards **and** plain services
 * without importing `@nestjs/common` (avoids cycles and keeps services framework-agnostic).
 * @module @api/lib/auth-roles
 */

/**
 * Returns whether the given role string is an administrator role.
 *
 * @param role - Typically `session.user.role` from Better Auth.
 * @returns `true` if `role` is `ADMIN` or `SUPER_ADMIN`.
 *
 * @remarks Keep in sync with `AdminGuard` in `nest/auth/role.guards.ts`.
 */
export function isAdminRole(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Minimal identity + role for authorization in services (e.g. file delete/migrate).
 * Populate from `req.betterAuthSession.user` after authentication.
 *
 * @property userId - Authenticated user id.
 * @property role - Role string used with {@link isAdminRole}.
 */
export type RequesterContext = {
  userId: string;
  role: string;
};
