# ai-client

Clients and low-level HTTP utilities for **AI integrations**, primarily **OpenRouter** (multi-model API). Keeps SDK usage, env keys, and error mapping in one place.

## Layout

| File | Role |
|------|------|
| `http-client.ts` | Generic fetch with **timeout**, **retries**, and **`AppError`** on failure — suitable for any JSON AI HTTP API. |
| `openrouter-client.ts` | **`OpenRouter`** from `@openrouter/sdk` — chat completions, typed request/response helpers, uses **`env.OPENROUTER_API_KEY`**. |
| `index.ts` | Re-exports public symbols from both files. |

## What `OpenRouterClient` does (high level)

- Instantiates the official SDK with your API key from [`../env`](../env/README.md).
- Exposes methods to run **chat-style** requests with model id, messages, temperature, `max_tokens`, etc.
- Maps provider errors to **`AppError`** and logs via [`../logger`](../logger/README.md) for observability.

Exact method names follow the implementation in `openrouter-client.ts` (e.g. chat completion helpers).

## What `http-client` does

- Configurable **`timeout`**, **`maxRetries`**, **`retryDelay`**, default headers.
- Returns **`HttpResponse<T>`** with parsed JSON `data`.
- Use when you need resilient HTTP to an AI endpoint **without** going through OpenRouter’s SDK.

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
