# Project Structure Rules

> Monorepo architecture, workspace dependencies, path aliases, and Single Source of Truth principles

## 🏗️ Monorepo Architecture

TaskFlow uses **Turborepo** with **Bun** as the package manager.

### Root Structure

```
taskflow/
├── apps/
│   ├── web/              # Next.js 16 web (port 4100)
│   ├── api/              # Elysia.js API (port 4101)
│   └── docs/             # Documentation app
├── packages/
│   ├── database/         # Prisma schema & client
│   ├── validations/      # Zod validation schemas
│   ├── types/            # TypeScript type definitions
│   └── ui/               # Shared UI components
├── turbo.json            # Turborepo configuration
└── package.json          # Root workspace config
```

### Single Source of Truth

- **Database Schema**: `packages/database/prisma/schema.prisma`
- **Types**: `packages/types/` - never duplicate
- **Validations**: `packages/validations/` using Zod
- **UI Components**: `packages/ui/` using shadcn/ui

## 📦 Workspace Dependencies

Use workspace protocol for internal packages:

```json
{
  "dependencies": {
    "@repo/database": "*",
    "@repo/validations": "*",
    "@repo/types": "*",
    "@repo/ui": "*"
  }
}
```

## 🔗 Path Aliases (CRITICAL)

> Use `@/` prefix instead of relative imports (`../`).

### API (`apps/api/tsconfig.json`)

```json
{
  "baseUrl": "./src",
  "paths": { "@/*": ["./*"] }
}
```

### Frontend (`apps/frontend/tsconfig.json`)

```json
{
  "baseUrl": ".",
  "paths": { "@/*": ["./*"] }
}
```

### ✅ ALWAYS Use `@/` Prefix

```typescript
// ✅ CORRECT
import { auth } from "@/lib/auth";
import { userService } from "@/services/user.service";
import { Button } from "@/components/ui/button";

// ❌ FORBIDDEN - Never use relative imports
import { auth } from "../../lib/auth";
import { Button } from "../../../components/ui/button";
```

## 📁 apps/web (Next.js)

```
apps/frontend/
├── app/                      # App Router
│   ├── (panel)/              # Panel route group
│   ├── (auth)/               # Auth route group
│   ├── components/           # Page-specific components
│   └── docs/                 # Fumadocs pages
├── components/               # Shared components
│   └── ui/                   # shadcn/ui
├── lib/                      # Utilities
└── content/                  # MDX content
```

## 📁 apps/api (Elysia.js)

```
apps/api/
├── src/
│   ├── routes/               # Route handlers
│   ├── services/             # Business logic
│   └── emails/               # React Email templates
└── Dockerfile
```

## 📝 Naming Conventions

| Type       | Convention        | Example            |
| ---------- | ----------------- | ------------------ |
| Components | PascalCase.tsx    | `UserCard.tsx`     |
| Utilities  | kebab-case.ts     | `auth-utils.ts`    |
| Services   | domain.service.ts | `user.service.ts`  |
| Hooks      | use-name.ts       | `use-auth.ts`      |
| Constants  | name.constants.ts | `api.constants.ts` |
| Types      | PascalCase.ts     | `UserTypes.ts`     |

## 🔄 Import Patterns

```typescript
// Path aliases
import { Button } from "@/components/ui/button";
import { prisma } from "@repo/database";
import { loginSchema } from "@repo/validations";
```

## 🎯 Best Practices

1. **Co-location**: Keep related files together
2. **Barrel Exports**: Use index.ts for clean imports
3. **Separation of Concerns**:
   - Routes: HTTP handling only
   - Services: Business logic
   - Validators: Input validation (Zod)

## 🤖 AI MUST Rules

1. **Place files in correct location** - apps/ or packages/
2. **Use workspace dependencies** - `@repo/*` packages
3. **Use `@/` path aliases** - Never `../` imports
4. **Follow naming conventions** - PascalCase for components, kebab-case for utilities
5. **Maintain single source of truth** - Don't duplicate types/schemas
6. **Use barrel exports** - index.ts for clean imports
