# ai-client

**OpenRouter** client for AI integrations: wraps the official SDK, maps env keys and errors, and keeps usage in one place.

## Layout

| File | Role |
|------|------|
| `openrouter-client.ts` | **`OpenRouter`** from `@openrouter/sdk` — chat completions, typed request/response helpers, uses **`env.OPENROUTER_API_KEY`**. |
| `index.ts` | Re-exports `openrouter-client` public API. |

## What `OpenRouterClient` does (high level)

- Instantiates the official SDK with your API key from [`../env`](../env/README.md).
- Exposes methods to run **chat-style** requests with model id, messages, temperature, `max_tokens`, etc.
- Maps provider errors to **`AppError`** and logs via [`../logger`](../logger/README.md) for observability.

Exact method names follow the implementation in `openrouter-client.ts` (e.g. chat completion helpers).

## Usage

```ts
import { OpenRouterClient } from "@api/lib/ai-client/openrouter-client";
// or
import { /* exports */ } from "@api/lib/ai-client";
```

Higher-level orchestration (prompts, tools) typically lives in **`src/services/ai.service.ts`**, which imports this module.

## Environment

- **`OPENROUTER_API_KEY`**: required for OpenRouter calls in production; validate usage in the service layer if missing.

## Related

- [`../system-prompts`](../system-prompts/README.md) — system prompt strings fed into models.
- [`../errors`](../errors/README.md) — `AppError` for failed API calls.
