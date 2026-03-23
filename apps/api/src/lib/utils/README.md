# utils

Miscellaneous **backend helpers**: password generation, legacy **media** JSON normalization, and **Sharp**-based image processing. Heavy imports (`sharp`, `@repo/database`) live here so lightweight modules do not pay the cost.

## Password helpers

| Export | Purpose |
|--------|---------|
| `generateTempPassword` | 16 chars from a reduced ambiguous charset (no `0`/`O`/`I`/`l`). |
| `generateRandomPassword` | Alias of `generateTempPassword`. |

Use when admin creates users or reset flows issue a one-time password.

## Media helpers (legacy / product-style)

| Export | Purpose |
|--------|---------|
| `MediaItem`, `MediaInput` | Types for `{ id, public_url }` style media. |
| `normalizeMedias(unknown)` | Coerces arrays, JSON strings, or mixed items into `MediaItem[]`. |
| `prepareMediasForStorage` | Maps input to DB-friendly `MediaItem[]`. |

Use when ingesting flexible client payloads into structured storage.

## Image helpers (Sharp)

| Export | Purpose |
|--------|---------|
| `getMimeAndExtensionForFormat` | Maps `webp` / `avif` / `jpeg` / `png` to MIME + extension. |
| `replaceFileExtension` | Filename helper for output names. |
| `maybeOptimizeImage(file, buffer)` | Reads **`imageOptimizationSettings`** from Prisma; if enabled, may resize/re-encode per global settings. Returns `{ file, buffer, optimized }` — on failure returns original and logs a warning. |
| `optimizeImage(file, buffer, options)` | **Manual** optimization (quality, format, max dimensions) for admin/media tools; throws if not an image or Sharp fails. |

## Usage

```ts
import {
  generateRandomPassword,
  maybeOptimizeImage,
  optimizeImage,
} from "@api/lib/utils";

const password = generateRandomPassword();
const out = await maybeOptimizeImage(file, await file.arrayBuffer());
```

## Dependencies

- **Sharp** is bundled as external in API build — ensure runtime provides native bindings.
- **Prisma** is used inside `maybeOptimizeImage` for settings.

## Related

- [`../logger`](../logger/README.md) — warnings/errors from optimization.
- [`../uploadthing`](../uploadthing/README.md) / [`../file-service`](../file-service/README.md) — where optimized files are often uploaded.
