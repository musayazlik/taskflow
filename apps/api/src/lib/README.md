# `src/lib` — API shared libraries

This directory holds **runtime modules** shared by Nest controllers, middleware, and plain TypeScript services (`src/services`, `src/emails`). Nothing here should import from `src/nest/*` (avoid circular coupling to the HTTP framework).

## Folder convention

Each public module is a **named folder**:

```
<name>/
  index.ts    # exports the public API of the module
  README.md   # this module’s documentation
```

Imports use the path alias:

```ts
import { env } from "@api/lib/env";
```

TypeScript resolves `@api/lib/<name>` to `<name>/index.ts`. Deeper paths are allowed when a submodule is intentionally public (e.g. `@api/lib/ai-client/openrouter-client`).

## How modules relate (high level)

```text
env ─────────────► logger, resend, auth, ai-client, …
auth ◄──────────── resend, emails (verification / reset)
uploadthing ◄───── env, logger
file-service ◄──── env (UploadThing token), logger
media.service ───► file-service, utils (Sharp), uploadthing (utapi)
```

## Module index

| Module | Responsibility |
|--------|------------------|
| [`auth`](./auth/README.md) | Better Auth instance (sessions, OAuth, email flows) |
| [`auth-roles`](./auth-roles/README.md) | `isAdminRole`, `RequesterContext` without Nest imports |
| [`ai-client`](./ai-client/README.md) | OpenRouter SDK wrapper for chat completions |
| [`env`](./env/README.md) | Zod-validated `process.env`, fail-fast at startup |
| [`errors`](./errors/README.md) | `AppError` and subclasses; works with global exception filter |
| [`file-service`](./file-service/README.md) | Storage provider abstraction (UploadThing implementation) |
| [`logger`](./logger/README.md) | Single Pino instance, structured logging |
| [`parse-query-int`](./parse-query-int/README.md) | Safe integer parsing from query strings |
| [`resend`](./resend/README.md) | Resend email client; dev fallback when API key missing |
| [`route-helpers`](./route-helpers/README.md) | Session helpers, pagination, standard JSON response shapes |
| [`system-prompts`](./system-prompts/README.md) | AI system prompts by category (`getSystemPrompt`) |
| [`uploadthing`](./uploadthing/README.md) | Shared `UTApi` singleton for server-side UploadThing |
| [`utils`](./utils/README.md) | Passwords, media normalization, Sharp image optimization |

Nested files (e.g. `file-service/providers/`) are **internal** to that module unless exported from its `index.ts`.

## When to add a new folder here

- The code is **shared** across multiple features.
- It has a clear boundary (config, email, logging, third-party SDK wrapper).
- Prefer a new `lib/<name>/` over growing an unrelated `utils` module.

If the logic belongs to a single Nest feature only, keep it next to that feature under `src/nest/<feature>/`.
