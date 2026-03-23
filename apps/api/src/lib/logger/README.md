# logger

Single **Pino** logger instance for the whole API. Use it for structured logs in services, middleware, filters, and libraries — do not create ad-hoc `console.log` in production paths unless debugging locally.

## What it does

- **Structured logging**: pass an object first, then a message string — Pino merges them for searchable fields.

  ```ts
  logger.info({ userId, action: "login" }, "User signed in");
  logger.error({ err, requestId }, "Request failed");
  ```

- **Log level**: `LOG_LEVEL` env overrides; otherwise `debug` in non-production, `info` in production.

- **Development**: attaches **pino-pretty** for human-readable colored output (not used in production to keep stdout JSON-friendly for log aggregators).

- **Redaction**: keys matching `req.headers.authorization` are redacted from logged objects to avoid leaking bearer tokens.

## Log levels (when to use)

| Level | Typical use |
|-------|----------------|
| `debug` | Verbose tracing (dev only or temporary diagnostics). |
| `info` | Normal lifecycle events (startup, email sent, job completed). |
| `warn` | Recoverable issues, deprecated usage, rate limits. |
| `error` | Failures that need attention; always include `err` when logging `Error` instances. |

## Usage

```ts
import { logger } from "@api/lib/logger";

logger.warn({ clientId }, "Rate limit exceeded");
logger.error({ err: error }, "Database query failed");
```

Default export is the same instance: `import logger from "@api/lib/logger"`.

## Related

- [`../env`](../env/README.md) — not imported by `logger` (avoids circular imports during env load).
