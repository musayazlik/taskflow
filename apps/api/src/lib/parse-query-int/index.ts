/**
 * @fileoverview Safe parsing of integer values from HTTP query strings (e.g. `?page=2&limit=20`).
 * Used for pagination and limits so invalid or hostile input cannot produce `NaN` or unbounded values.
 * @module @api/lib/parse-query-int
 */

/**
 * Optional bounds applied after parsing. Both can be used together: the result is clamped to `[min, max]`
 * (if `min > max`, the final order of `Math.max` / `Math.min` still yields a value within the tighter interpretation
 * of the two constraints — callers should ensure `min <= max`).
 */
export type ParseQueryIntOptions = {
  /** Inclusive lower bound. If set, the result is never less than this value. */
  min?: number;
  /** Inclusive upper bound. If set, the result is never greater than this value. */
  max?: number;
};

/**
 * Parses a query string segment as a base-10 integer, with fallback defaults and optional clamping.
 *
 * Intended for **untrusted** input from `req.query` in Nest/Express handlers. Unlike raw `parseInt` without
 * validation, this function never returns `NaN`: invalid input yields `defaultValue`.
 *
 * @param value - Raw string from the query object (e.g. `query.limit`), or `undefined` when the parameter
 *   is omitted. Empty string `""` is treated the same as missing and returns `defaultValue`.
 * @param defaultValue - Returned when `value` is missing, empty, or cannot be parsed as a finite integer.
 *   Should match the intended “sensible default” for that query key (e.g. `PAGINATION.DEFAULT_LIMIT`).
 * @param options - Optional `{ min, max }` to clamp the parsed integer after a successful parse.
 *   Clamping runs after validation: first `min`, then `max` (same as `Math.min(max, Math.max(min, n))` in effect).
 *
 * @returns A finite integer. Always safe to pass to Prisma `take`/`skip` or array indexing when defaults and
 *   bounds are chosen appropriately.
 *
 * @remarks
 * - Parsing uses {@link Number.parseInt} with radix **10** only (no octal ambiguity).
 * - Values like `"3.7"` parse to **3** (integer truncation), same as `parseInt`.
 * - Very large strings that exceed safe integer range may still yield a number; use `max` to cap API limits.
 * - Does not trim strings; leading spaces may affect `parseInt` behavior per ECMAScript rules.
 *
 * @example
 * // Missing parameter → default
 * parseQueryInt(undefined, 20, { min: 1, max: 100 }); // 20
 *
 * @example
 * // Valid string → parsed and clamped
 * parseQueryInt("50", 20, { min: 1, max: 100 }); // 50
 * parseQueryInt("200", 20, { min: 1, max: 100 }); // 100
 * parseQueryInt("0", 20, { min: 1, max: 100 }); // 1
 *
 * @example
 * // Invalid input → default
 * parseQueryInt("abc", 20, { min: 1, max: 100 }); // 20
 */
export function parseQueryInt(
  value: string | undefined,
  defaultValue: number,
  options?: ParseQueryIntOptions,
): number {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    return defaultValue;
  }
  let result = n;
  if (options?.min !== undefined) {
    result = Math.max(options.min, result);
  }
  if (options?.max !== undefined) {
    result = Math.min(options.max, result);
  }
  return result;
}
