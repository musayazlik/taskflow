/**
 * Application constants
 * Centralized configuration values
 */

// Rate limiting defaults
export const RATE_LIMIT = {
  GLOBAL: {
    duration: 60000, // 1 minute
    max: 100, // 100 requests per minute
  },
  AUTH: {
    duration: 60000, // 1 minute
    max: 10, // 10 requests per minute for auth endpoints
  },
  STRICT: {
    duration: 60000, // 1 minute
    max: 5, // 5 requests per minute for sensitive operations
  },
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_OFFSET: 0,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

// Media Upload Default Settings
export const MEDIA_UPLOAD_DEFAULTS = {
  MAX_FILE_SIZE: 4, // MB
  MAX_FILE_COUNT: 10,
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;

// File Upload Limits
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE_MB: 10, // 10MB
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB in bytes
} as const;

