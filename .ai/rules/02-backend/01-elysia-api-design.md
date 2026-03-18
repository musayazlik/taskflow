# Elysia API Design

> Endpoint standards, Controller/Service separation, t.Object validation, Swagger

## 🏗️ Layered Architecture

```
Routes (HTTP Layer) → Services (Business Logic) → Prisma (Database)
```

### Principles
1. **Routes are thin** - Only HTTP handling, validation, response formatting
2. **Services contain business logic** - All data manipulation
3. **Direct database access only in services** - Never in routes
4. **Shared logic in `lib/`** - Utilities, helpers

## 🎯 Route Handler Pattern

### ✅ GOOD - Thin routes
```typescript
// src/routes/users.ts
import { Elysia, t } from "elysia";
import { userService } from "@/services/user.service";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    const users = await userService.getAllUsers();
    return { success: true, data: users };
  })
  .get("/:id", async ({ params, set }) => {
    const user = await userService.getById(params.id);
    if (!user) {
      set.status = 404;
      return { success: false, error: "NOT_FOUND", message: "User not found" };
    }
    return { success: true, data: user };
  }, {
    params: t.Object({ id: t.String() }),
  });
```

### ❌ BAD - Business logic in routes
```typescript
// DON'T DO THIS
.post("/", async ({ body }) => {
  // ❌ Direct database access
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw new Error("User exists");
  
  // ❌ Business logic in route
  const hashedPassword = await hashPassword(body.password);
  const user = await prisma.user.create({ data: { ...body, password: hashedPassword } });
  
  return user;
});
```

## ✅ t.Object Schema Validation

```typescript
import { Elysia, t } from "elysia";

const CreateUserSchema = t.Object({
  email: t.String({ format: "email", minLength: 1 }),
  name: t.String({ minLength: 2, maxLength: 100 }),
  password: t.String({ minLength: 8 }),
  role: t.Optional(t.Enum({ USER: "USER", ADMIN: "ADMIN" })),
});

export const userRoutes = new Elysia({ prefix: "/users" })
  .post("/", async ({ body }) => {
    const user = await userService.create(body);
    return { success: true, data: user };
  }, {
    body: CreateUserSchema,
    detail: {
      summary: "Create user",
      tags: ["Users"],
    },
  });
```

## 📄 API Response Format

All responses must follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
  error?: string;
  message?: string;
}
```

### Success Examples
```json
// Single record
{ "success": true, "data": { "id": "1", "email": "user@example.com" } }

// List
{ "success": true, "data": [{ "id": "1" }, { "id": "2" }] }

// Paginated
{ "success": true, "data": [...], "meta": { "total": 100, "page": 1, "pageSize": 10 } }
```

### Error Examples
```json
{ "success": false, "error": "VALIDATION_ERROR", "message": "Email is invalid" }
{ "success": false, "error": "NOT_FOUND", "message": "User not found" }
{ "success": false, "error": "UNAUTHORIZED", "message": "Please log in" }
```

## 📚 Swagger/OpenAPI

```typescript
.get("/:id", async ({ params }) => {
  const user = await userService.getById(params.id);
  return { success: true, data: user };
}, {
  params: t.Object({ id: t.String() }),
  detail: {
    tags: ["Users"],
    summary: "Get user by ID",
    security: [{ cookieAuth: [] }],
    responses: {
      200: { description: "User found" },
      401: { description: "Unauthorized" },
      404: { description: "User not found" },
    },
  },
});
```

## 🤖 AI MUST Rules

1. **Keep routes thin** - Delegate to services
2. **Use TypeBox validation** - t.Object, t.String, etc.
3. **Follow response format** - `{ success, data?, error?, message? }`
4. **Add Swagger docs** - tags, summary, security
5. **Use custom errors** - AppError classes
6. **Export App type** - For Eden Treaty
