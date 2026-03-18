# TypeScript Usage

> Strict type usage, interface vs type selection, Zod/TypeBox integration

## 🎯 Strict Mode

TurboStack uses TypeScript strict mode. All code must pass type checking.

## 📘 Interface vs Type

### Use `interface` for:
- Object shapes that may be extended
- Public API definitions
- Class implementations

```typescript
// ✅ Interface for object shapes
interface User {
  id: string;
  email: string;
  name: string | null;
}

// ✅ Interface for extension
interface AdminUser extends User {
  role: "ADMIN";
  permissions: string[];
}
```

### Use `type` for:
- Union types
- TypeBox schemas (Elysia validation)
- Complex transformations

```typescript
// ✅ Type for unions
type UserStatus = "active" | "inactive" | "pending";

// ✅ Type for TypeBox
import { Static, Type as t } from "@sinclair/typebox";
const UserSchema = t.Object({
  id: t.String(),
  email: t.String({ format: "email" }),
});
type User = Static<typeof UserSchema>;
```

## 🔗 Zod Integration

```typescript
// packages/validations/src/user.ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100).nullable(),
});

export type User = z.infer<typeof userSchema>;

// Create schema (omit auto-generated fields)
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

## 🔗 TypeBox Integration (Elysia)

```typescript
// packages/types/src/user.ts
import { Static, Type as t } from "@sinclair/typebox";

export const UserSchema = t.Object({
  id: t.String(),
  email: t.String({ format: "email" }),
  name: t.Optional(t.String()),
}, { $id: "User" });

export type User = Static<typeof UserSchema>;

// Elysia route validation
export const userRoutes = new Elysia({ prefix: "/users" })
  .model({ user: UserSchema })
  .get("/:id", async ({ params }) => {
    return { success: true, data: await getUser(params.id) };
  }, {
    response: { 200: t.Object({ success: t.Boolean(), data: "user" }) }
  });
```

## 🎯 Type Safety Patterns

### Null Safety
```typescript
// ✅ Handle null explicitly
async function getUser(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

// Usage
const user = await getUser(id);
if (!user) throw new NotFoundError("User");
// TypeScript knows user is not null here
```

### Avoid `any`
```typescript
// ✅ Use proper types or unknown
function processUser(user: User): UserResponse { ... }
function parseJSON(json: string): unknown { ... }

// ❌ Never use any
function processUser(user: any): any { ... }
```

## 🤖 AI MUST Rules

1. **Enable strict mode compliance** - No `any` types
2. **Use `interface` for object shapes** - Extension-friendly
3. **Use `type` for unions/transformations** - TypeBox schemas
4. **Define Zod schemas in `@repo/validations`**
5. **Define TypeBox schemas in `@repo/types`**
6. **Handle null/undefined explicitly** - Type guards, null checks
