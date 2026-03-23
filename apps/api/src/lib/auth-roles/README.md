# auth-roles

Small **role utilities** and types shared by:

- Nest **guards** (`AdminGuard`, etc.), and  
- Plain **services** (e.g. `media.service` for “can this user delete this file?”).

Keeping this in `lib` avoids importing `@nestjs/common` inside services and prevents awkward dependency cycles between `nest/auth` and `services`.

## What it exports

### `isAdminRole(role: string): boolean`

Returns `true` if `role` is `ADMIN` or `SUPER_ADMIN`.  
Use the same definition everywhere so admin checks never drift between guards and business logic.

### `RequesterContext`

```ts
type RequesterContext = { userId: string; role: string };
```

Passed into functions that need **authorization without the full request object** (e.g. `deleteFile(key, requester)`). Populate from `req.betterAuthSession.user` after `BetterAuthGuard` runs.

## Usage

```ts
import { isAdminRole, type RequesterContext } from "@api/lib/auth-roles";

if (isAdminRole(session.user.role)) {
  // admin-only path
}

const requester: RequesterContext = {
  userId: session.user.id,
  role: session.user.role,
};
await deleteFile(key, requester);
```

## Relation to Nest guards

| Location | Responsibility |
|----------|----------------|
| `auth-roles` | Pure functions / types; no HTTP. |
| `nest/auth/role.guards.ts` | `CanActivate`, throws `AppError`, reads `req.betterAuthSession`. |

If you change who counts as “admin”, update **`isAdminRole` in one place** — guards, services, and `requireAdmin` in [`../route-helpers`](../route-helpers/README.md) all rely on it.
