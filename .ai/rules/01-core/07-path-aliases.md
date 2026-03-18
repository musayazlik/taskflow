# Path Aliases

> Use `@/` prefix instead of relative imports (`../`).

## Configuration

Only the `@/*` alias is defined in both applications:

### apps/api

```json
{
  "baseUrl": "./src",
  "paths": { "@/*": ["./*"] }
}
```

`@/lib/auth.js` → `src/lib/auth.js`

### apps/web

```json
{
  "baseUrl": ".",
  "paths": { "@/*": ["./*"] }
}
```

`@/components/ui/button` → `components/ui/button`

---

## Usage

```typescript
// apps/api
import { auth } from "@/lib/auth.js";
import { sendEmail } from "@/services/email.service.js";

// apps/web
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
```

## Rules

1. **Do not use** relative imports (`../`)
2. `./` can be used for files in the same directory
