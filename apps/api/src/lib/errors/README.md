# errors

Application-level **error types** built around `AppError`. They carry an HTTP **status code**, a stable **machine-readable `code`**, and a user-facing **message**. The global Nest `HttpExceptionFilter` maps `AppError` instances to JSON responses and logs appropriately.

## What it does

- **`AppError`**: Base class. Constructor: `(code, message, status, details?)`. Use when you need full control.

- **Specialized subclasses** set `code` + `status` for common cases:

  | Class | HTTP | Default `code` |
  |-------|------|----------------|
  | `ValidationError` | 400 | `VALIDATION_ERROR` |
  | `UnauthorizedError` | 401 | `UNAUTHORIZED` |
  | `ForbiddenError` | 403 | `FORBIDDEN` |
  | `NotFoundError` | 404 | `NOT_FOUND` |
  | `ConflictError` | 409 | `CONFLICT` |
  | `InternalError` | 500 | `INTERNAL_ERROR` |

- **`toJSON()`** on `AppError` helps if you ever serialize errors (prefer throwing through the filter for HTTP).

## When to use `AppError` vs Nest `HttpException`

- Prefer **`AppError`** for domain rules and consistent `{ success, error, message }` body shape from your filter.
- Nest **`BadRequestException`** / **`UnauthorizedException`** still work; the filter translates non-400 `HttpException` instances using HTTP status → error code mapping.

## Usage

```ts
import { AppError, NotFoundError, ValidationError } from "@api/lib/errors";

throw new NotFoundError("User");
throw new ValidationError("Email is required");
throw new AppError("CUSTOM_CODE", "Business rule failed", 422, { field: "x" });
```

## Related

- [`../nest/common/filters/http-exception.filter.ts`](../../nest/common/filters/http-exception.filter.ts) — catches `AppError`, `HttpException`, and unknown errors.
