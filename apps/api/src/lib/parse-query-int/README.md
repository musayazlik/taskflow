# parse-query-int

**Safe parsing** of integer values from HTTP **query strings** (`?page=1&limit=20`). Prevents `NaN` from reaching Prisma `take`/`skip`, enforces **radix 10**, and optionally **clamps** values so clients cannot request `limit=999999999`.

## Problem it solves

| Pitfall | Without this helper |
|---------|---------------------|
| Missing radix | `parseInt("08")` quirks in older JS; always use base 10 for query params. |
| `NaN` | `parseInt("abc", 10)` → `NaN` breaks arithmetic and DB queries. |
| No bounds | Huge `limit` can overload the database or memory. |

This helper returns a **safe default** when input is missing, empty, or not a finite integer, then applies optional **min** / **max**.

## API

### `parseQueryInt(value, defaultValue, options?)`

| Parameter | Description |
|-----------|-------------|
| `value` | Raw string from `req.query` (or `undefined` / `""`). |
| `defaultValue` | Returned when value is absent or invalid. |
| `options.min` | If set, result is `Math.max(min, parsed)`. |
| `options.max` | If set, result is `Math.min(max, parsed)`. |

**Returns:** always a **finite** `number`.

### Edge cases

- `"  42  "` → parsed as `42` (leading/trailing whitespace: `parseInt` behavior).
- `"-1"` with `min: 0` → `0`.
- `"3.7"` → `3` (integer truncation, same as `parseInt`).

## Usage

```ts
import { parseQueryInt } from "@api/lib/parse-query-int";

const limit = parseQueryInt(query.limit, 20, { min: 1, max: 100 });
const offset = parseQueryInt(query.offset, 0, { min: 0, max: 1_000_000 });
```

## When not to use

- **Body JSON** — validate with TypeBox/Zod pipes instead.
- **Money or IDs** — if you need bigint or strict formats, use dedicated parsers.

## Related

- [`../route-helpers`](../route-helpers/README.md) — `parsePagination` is an older helper; new code can combine `parseQueryInt` with explicit page/limit for stricter control.
