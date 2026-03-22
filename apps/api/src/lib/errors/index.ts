/**
 * @fileoverview Application error hierarchy built on {@link AppError}.
 * Works with the global Nest HTTP exception filter to return consistent JSON error bodies.
 * @module @api/lib/errors
 */

/**
 * Base class for domain and HTTP errors. Carries a stable `code`, HTTP `status`, and optional `details`.
 *
 * @remarks
 * Prefer throwing `AppError` (or subclasses) over generic `Error` when the HTTP layer should
 * map to a known response shape.
 */
export class AppError extends Error {
  /**
   * @param code - Machine-readable error code (e.g. `NOT_FOUND`, `VALIDATION_ERROR`).
   * @param message - Human-readable message for clients and logs.
   * @param status - HTTP status code.
   * @param details - Optional structured payload (field errors, etc.).
   */
  constructor(
    public code: string,
    public override message: string,
    public status: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }

  /**
   * Serializes to a plain object (useful for logging or non-HTTP contexts).
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      ...(this.details && { details: this.details }),
    };
  }
}

/**
 * Client sent invalid input — HTTP **400**. Code: `VALIDATION_ERROR`.
 */
export class ValidationError extends AppError {
  /**
   * @param message - Description of what failed validation.
   * @param details - Optional per-field or structured validation details.
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

/**
 * Authentication required or token invalid — HTTP **401**. Code: `UNAUTHORIZED`.
 */
export class UnauthorizedError extends AppError {
  /** @param message - Defaults to `"Unauthorized"`. */
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * Authenticated but not allowed — HTTP **403**. Code: `FORBIDDEN`.
 */
export class ForbiddenError extends AppError {
  /** @param message - Defaults to `"Forbidden"`. */
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}

/**
 * Resource does not exist — HTTP **404**. Code: `NOT_FOUND`.
 */
export class NotFoundError extends AppError {
  /**
   * @param resource - Label used in message: `"${resource} not found"`.
   */
  constructor(resource: string) {
    super("NOT_FOUND", `${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Conflict with current state (e.g. duplicate) — HTTP **409**. Code: `CONFLICT`.
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
    this.name = "ConflictError";
  }
}

/**
 * Unexpected server-side failure — HTTP **500**. Code: `INTERNAL_ERROR`.
 */
export class InternalError extends AppError {
  constructor(message = "An unexpected error occurred") {
    super("INTERNAL_ERROR", message, 500);
    this.name = "InternalError";
  }
}
