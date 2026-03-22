/**
 * @fileoverview Session helpers, pagination, and standard JSON response shapes for handlers and services.
 * Uses {@link auth} for `getSession`. Prefer Nest guards for HTTP controllers when possible.
 * @module @api/lib/route-helpers
 */

import { auth } from "@api/lib/auth";
import { AppError } from "@api/lib/errors";
import { PAGINATION } from "@api/constants";

/**
 * Headers accepted by session helpers: Web `Headers` or a plain record (e.g. Express/Nest normalized headers).
 */
export type HeadersLike = Record<string, string | undefined> | Headers;

/**
 * @internal
 * Flattens {@link HeadersLike} to a string record for Better Auth.
 */
const normalizeHeaders = (headers: HeadersLike): Record<string, string> => {
  if (headers instanceof Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

/**
 * Returns the current session or throws {@link AppError} with **401** if unauthenticated.
 *
 * @param headers - Incoming request headers carrying cookies / auth.
 * @returns Better Auth session (user + session objects).
 * @throws {AppError} `UNAUTHORIZED` when no session.
 */
export const getSession = async (headers: HeadersLike) => {
  const headersInit = normalizeHeaders(headers);
  const session = await auth.api.getSession({ headers: headersInit });
  if (!session) {
    throw new AppError("UNAUTHORIZED", "Authentication required", 401);
  }
  return session;
};

/**
 * Alias of {@link getSession}.
 */
export const requireAuth = getSession;

/**
 * @param role - `session.user.role`
 * @returns `true` if role is `ADMIN` or `SUPER_ADMIN`.
 *
 * @remarks Prefer `isAdminRole` from `@api/lib/auth-roles` for new code to avoid drift.
 */
export const isAdmin = (role: string): boolean => {
  return role === "ADMIN" || role === "SUPER_ADMIN";
};

/**
 * Like {@link getSession}, but requires an admin role; otherwise **403**.
 *
 * @throws {AppError} `FORBIDDEN` if not admin.
 */
export const requireAdmin = async (headers: HeadersLike) => {
  const session = await getSession(headers);
  if (!isAdmin(session.user.role)) {
    throw new AppError("FORBIDDEN", "Admin access required", 403);
  }
  return session;
};

/**
 * Requires `SUPER_ADMIN` role; otherwise **403**.
 */
export const requireSuperAdmin = async (headers: HeadersLike) => {
  const session = await getSession(headers);
  if (session.user.role !== "SUPER_ADMIN") {
    throw new AppError("FORBIDDEN", "Super admin access required", 403);
  }
  return session;
};

/** Raw pagination query fields (stringly typed from URL). */
export interface PaginationParams {
  page?: string;
  limit?: string;
}

/** Numeric pagination with SQL-style `skip`. */
export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parses `page` / `limit` with defaults from {@link PAGINATION}.
 *
 * @remarks Uses `parseInt` without radix bounds — for untrusted input consider `parseQueryInt` from `@api/lib/parse-query-int`.
 */
export const parsePagination = (query: PaginationParams): PaginationResult => {
  const page = query.page ? parseInt(query.page) : PAGINATION.DEFAULT_PAGE;
  const limit = query.limit ? parseInt(query.limit) : PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * @param total - Total row count.
 * @param limit - Page size (must be &gt; 0 for meaningful results).
 */
export const calculateTotalPages = (total: number, limit: number): number => {
  return Math.ceil(total / limit);
};

/**
 * Builds `{ total, page, limit, totalPages }` for list responses.
 */
export const createPaginationMeta = (
  total: number,
  page: number,
  limit: number,
) => {
  return {
    total,
    page,
    limit,
    totalPages: calculateTotalPages(total, limit),
  };
};

/**
 * Standard success payload: `{ success: true, data }` or adds optional `message`.
 *
 * @typeParam T - Payload type of `data`.
 */
export const successResponse = <T>(data: T, message?: string) => {
  if (message) {
    return {
      success: true as const,
      data,
      message,
    };
  }
  return {
    success: true as const,
    data,
  };
};

/**
 * List response with `meta` from {@link createPaginationMeta}.
 *
 * @typeParam T - Element type of the `data` array.
 */
export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) => {
  return {
    success: true as const,
    data,
    meta: createPaginationMeta(total, page, limit),
  };
};
