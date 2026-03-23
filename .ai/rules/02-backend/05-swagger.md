# Swagger/OpenAPI Guidelines

## 🎯 Overview

TaskFlow API uses **@elysiajs/openapi** for automatic OpenAPI specification generation and Swagger UI.

**Swagger UI**: `http://localhost:4101/openapi`

---

## 🔧 Configuration

OpenAPI is configured in `apps/api/src/index.ts`:

```typescript
import { openapi } from "@elysiajs/openapi";

const app = new Elysia().use(
  openapi({
    documentation: {
      info: {
        title: "TaskFlow API",
        version: "1.0.0",
        description: "API documentation",
      },
      tags: [
        { name: "Health", description: "Health check endpoints" },
        { name: "Auth", description: "Authentication endpoints" },
        // ... more tags
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "better-auth.session_token",
          },
        },
      },
    },
  })
);
```

---

## 🏷️ Tags

Tags should be defined for each route group:

| Tag        | Description                                |
| ---------- | ------------------------------------------ |
| `Health`   | Health check endpoints                     |
| `Auth`     | Authentication endpoints (via better-auth) |
| `Users`    | User management endpoints                  |
| `Polar`    | Polar.sh products and payments             |
| `Webhooks` | Webhook endpoints                          |
| `Upload`   | File upload endpoints                      |

---

## 📝 Route Documentation

Add documentation to routes with the `detail` property:

```typescript
.get("/users", async () => {
  return prisma.user.findMany();
}, {
  detail: {
    tags: ["Users"],
    summary: "Get all users",
    description: "Returns a list of all users",
    security: [{ cookieAuth: [] }],
    responses: {
      200: { description: "User list" },
      401: { description: "Unauthorized" },
    }
  }
})
```

---

## 🔒 Security Schemes

### Cookie Auth (better-auth)

```typescript
securitySchemes: {
  cookieAuth: {
    type: "apiKey",
    in: "cookie",
    name: "better-auth.session_token",
    description: "Session token cookie",
  },
}
```

### Bearer Auth (JWT)

```typescript
securitySchemes: {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
}
```

---

## 📊 Schema Definitions

Define reusable schemas under `components.schemas`:

```typescript
schemas: {
  User: {
    type: "object",
    properties: {
      id: { type: "string" },
      email: { type: "string", format: "email" },
      name: { type: "string", nullable: true },
      role: { type: "string", enum: ["USER", "ADMIN"] },
    },
  },
}
```

---

## 🔐 Basic Auth Protection

Swagger UI is protected with Basic Auth:

```env
DOCS_USERNAME=admin
DOCS_PASSWORD=changeme
```

---

## 📋 Best Practices

### DO ✅

- [ ] Define `tags` for each route
- [ ] Add `summary` and `description`
- [ ] Define response types
- [ ] Specify security requirements

### DON'T ❌

- [ ] Do not leave routes without tags
- [ ] Protected routes without security schemes
- [ ] Missing response documentation
