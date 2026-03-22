/**
 * Role checks shared by guards and services (avoid circular imports with Nest modules).
 */
export function isAdminRole(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export type RequesterContext = {
  userId: string;
  role: string;
};
