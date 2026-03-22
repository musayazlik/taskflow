# system-prompts

Central place for **system prompt text** used with LLM calls, grouped by **product area** (text chat, image, SEO, code). Keeps prompts out of controllers and makes it easy to tune copy without touching HTTP handlers.

## What it exports

### Prompt maps (per file)

| Module file | Domain | Typical keys |
|-------------|--------|----------------|
| `text-generation.ts` | General chat / text | e.g. `GENERAL`, feature-specific keys |
| `image-generation.ts` | Image prompts | `GENERAL`, etc. |
| `seo-optimization.ts` | SEO assistant | `GENERAL`, etc. |
| `code-generation.ts` | Code assistant | `GENERAL`, etc. |

Each file exports a **constant object** of strings (see implementations for exact key sets).

### `getSystemPrompt(category, type?)`

- **`category`**: `SystemPromptCategory` from `@repo/types` (e.g. `TEXT_GENERATION`, `IMAGE_GENERATION`).
- **`type`**: string key inside that category’s map; defaults to **`"GENERAL"`** when omitted or unknown.

**Implementation note:** the function uses **`require("./...")`** inside a `switch` to load the correct map at runtime. When adding a new category, extend the `switch` and add a new prompt file + exports.

### Re-export

- **`SystemPromptCategory`** — re-exported from `@repo/types` for convenience.

## Usage

```ts
import { getSystemPrompt } from "@api/lib/system-prompts";
import { SystemPromptCategory } from "@repo/types";

const system = getSystemPrompt(
  SystemPromptCategory.TEXT_GENERATION,
  "GENERAL",
);

// Pass `system` as the system message in your OpenRouter / chat request
```

## When to change prompts

- Prefer editing the **category file** (e.g. `text-generation.ts`) rather than inline strings in `ai.service.ts`.
- Keep tone and safety guidelines consistent with your product policy.

## Related

- [`../ai-client`](../ai-client/README.md) — where prompts are sent to the model.
- **`@repo/types`** — `SystemPromptCategory` enum and shared AI types.
