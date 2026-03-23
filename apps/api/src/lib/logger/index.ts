/**
 * @fileoverview Shared Pino logger for the API: structured JSON in production, pretty print in development.
 * @module @api/lib/logger
 */

import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Root logger instance. Prefer `logger.info({ key }, "message")` for structured fields.
 *
 * @remarks
 * - **Level**: `LOG_LEVEL` env overrides; otherwise `info` in production, `debug` elsewhere.
 * - **Development**: uses `pino-pretty` transport (not loaded in production).
 * - **Redaction**: `req.headers.authorization` is redacted when present in logged objects.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
  redact: ["req.headers.authorization"],
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Default export — same singleton as {@link logger}.
 */
export default logger;
