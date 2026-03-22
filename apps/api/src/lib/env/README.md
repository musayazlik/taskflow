# env

Central **environment configuration** for the API process. All sensitive and operational settings should be read through the exported `env` object after validation — avoid scattered `process.env.FOO` usage elsewhere.

## What it does

1. **Loads `.env` files** (in order):
   - Monorepo **root** `.env` (shared defaults).
   - **`apps/api/.env`** — overrides root for API-specific values.
   Paths use `import.meta.dir` so loading works no matter the current working directory when Bun starts.

2. **Validates with Zod** (`envSchema.parse(process.env)`). Invalid types or missing required keys cause an **immediate throw** at import time (fail-fast).

3. **Production / staging guard**: if `NODE_ENV` is `production` or `staging`, **`BETTER_AUTH_SECRET` must be set** or the process exits with an error. This prevents deploying auth without a signing secret.

## Notable variables

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Required. PostgreSQL connection string. |
| `PORT` | API listen port (default `4101`). |
| `FRONTEND_URL` | Used for CORS, email links, Better Auth `trustedOrigins`. |
| `BETTER_AUTH_SECRET` | Secret for signing sessions/tokens; required in prod/staging. |
| `BETTER_AUTH_URL` | Optional public API base URL for OAuth callbacks; falls back to `FRONTEND_URL` in auth config. |
| `RESEND_API_KEY` / `FROM_EMAIL` | Email; optional in dev. |
| `OPENROUTER_API_KEY` | AI features. |
| `UPLOADTHING_TOKEN` | Base64 JSON token; validated format when present (see schema `refine`). |
| OAuth / Polar | Optional integrations. |

## Usage

```ts
import { env } from "@api/lib/env";
import type { Env } from "@api/lib/env";

const dbUrl = env.DATABASE_URL;
```

`Env` is the inferred Zod type for typing helpers.

## Extending

Add new keys to `envSchema` in `index.ts`, then document them here. Prefer `z.string().optional()` for feature flags and required fields only for what must exist in every environment.

## Related

- [`../logger`](../logger/README.md) — used only inside the `UPLOADTHING_TOKEN` refine error path.
- [`../auth`](../auth/README.md) — consumes `env` for OAuth, URLs, and secrets.
