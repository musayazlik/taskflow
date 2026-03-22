# route-helpers

Helpers for **authentication from headers**, **pagination**, and **standard JSON response shapes**. Used by services and any code path that is not a Nest controller method (legacy Elysia-style handlers or shared service code). Nest controllers often duplicate session checks with guards instead.

## What it exports

### Session / authorization

| Function | Behavior |
|----------|----------|
| `getSession` / `requireAuth` | Normalizes `Headers` or a plain header record, calls **`auth.api.getSession`**, throws **`AppError` 401** if no session. |
| `requireAdmin` | Same as `getSession`, then requires role **ADMIN** or **SUPER_ADMIN**. |
| `requireSuperAdmin` | Requires **SUPER_ADMIN** only. |
| `isAdmin` | String role check (duplicate of admin logic; prefer [`auth-roles`](../auth-roles/README.md) for new code). |

`HeadersLike` = `Record<string, string | undefined> | Headers`.

### Pagination

| Function | Behavior |
|----------|----------|
| `parsePagination({ page?, limit? })` | Uses [`@api/constants`](../../constants/index.ts) defaults; returns `{ page, limit, skip }`. **Note:** uses raw `parseInt` — for untrusted query input consider [`parse-query-int`](../parse-query-int/README.md). |
| `calculateTotalPages` | `Math.ceil(total / limit)`. |
| `createPaginationMeta` | `{ total, page, limit, totalPages }`. |

### Responses

| Function | Shape |
|----------|--------|
| `successResponse(data, message?)` | `{ success: true, data }` or adds `message` when provided. |
| `paginatedResponse(data, total, page, limit)` | `{ success: true, data, meta: { ... } }`. |

## Usage

```ts
import {
  successResponse,
  paginatedResponse,
  parsePagination,
  requireAdmin,
} from "@api/lib/route-helpers";

const { page, limit, skip } = parsePagination({ page: "2", limit: "20" });
return successResponse({ items: [] });
```

## Related

- [`../auth`](../auth/README.md) — `auth` instance used internally.
- [`../errors`](../errors/README.md) — thrown on failed auth.
