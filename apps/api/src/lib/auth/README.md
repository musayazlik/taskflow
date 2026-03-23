# auth

The **Better Auth** server instance for TaskFlow: database-backed users (Prisma), email/password, email verification, password reset, OAuth (Google, GitHub), and cookie sessions.

## What it does

- **Adapter**: `prismaAdapter` with PostgreSQL — users, sessions, accounts live in your schema.

- **Routes**: Better Auth expects HTTP routes under **`/api/auth/*`**. In this app, Express mounts `toNodeHandler(auth)` on `/api/auth` in `nest/main.ts` **before** Nest’s JSON body parser so the auth handler can read raw bodies where needed.

- **User model**: `additionalFields.role` stores `ADMIN` / `SUPER_ADMIN` / etc. for your guards.

- **Email flows**:
  - Verification and reset emails call helpers in **`src/emails`** (React/HTML templates via Resend).
  - Links use **`env.FRONTEND_URL`** (verify, reset-password pages).

- **OAuth**: Client IDs/secrets from `env`; callback URLs follow Better Auth’s `{baseURL}/api/auth/callback/{provider}` pattern. **`baseURL`** is `env.BETTER_AUTH_URL || env.FRONTEND_URL`.

- **Session**: Cookie name `turbostack_session`, 7-day expiry, cookie cache enabled for performance.

## Typical usage in code

```ts
import { auth } from "@api/lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const session = await auth.api.getSession({
  headers: fromNodeHeaders(req.headers),
});
```

Nest guards wrap this pattern and attach `betterAuthSession` to the request.

## Configuration checklist

1. Set **`BETTER_AUTH_SECRET`** (required in production/staging — see [`../env`](../env/README.md)).
2. Align **`FRONTEND_URL`** with the browser origin that sends cookies.
3. For OAuth, register redirect URIs with Google/GitHub matching your **`baseURL`**.

## Related

- [`../resend`](../resend/README.md) — underlying mail transport for templates (indirectly via `src/emails`).
- [`../uploadthing`](../uploadthing/README.md) — uses `auth.api.getSession` inside UploadThing middleware.
