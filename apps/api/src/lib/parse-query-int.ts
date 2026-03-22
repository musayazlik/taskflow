/**
 * Parse a non-negative integer from a query string with safe defaults and bounds.
 */
export function parseQueryInt(
  value: string | undefined,
  defaultValue: number,
  options?: { min?: number; max?: number },
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
