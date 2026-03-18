# Security Guidelines

This document outlines the security standards and best practices for the TurboStack project. It covers authentication, password hashing, input validation, and API protection measures to ensure the integrity and safety of the application.

## 🎯 Overview

Security is a core principle of TurboStack. This document covers security best practices for authentication, data handling, API protection, and general application security.

---

## 🔐 Authentication

### JWT Token Handling

```typescript
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Create access token (short-lived: 15m)
export async function createAccessToken(userId: string, role: string) {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

// Verify token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}
```

### Token Best Practices

| Practice         | Description                      |
| ---------------- | -------------------------------- |
| Short expiry     | Access tokens: 15-30 minutes     |
| Refresh tokens   | Use for token renewal            |
| HttpOnly cookies | Store tokens in HttpOnly cookies |
| Secure flag      | Always use in production         |

---

## 🔒 Password Security

### Argon2 Hashing

```typescript
import { hash, verify } from "@node-rs/argon2";

export async function hashPassword(password: string) {
  return hash(password, { algorithm: 2, memoryCost: 65536 });
}

export async function verifyPassword(password: string, hashed: string) {
  return verify(hashed, password);
}
```

---

## ✅ Input Validation

Always validate ALL user input with Zod:

```typescript
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(2).max(100).trim(),
  password: z.string().min(8).max(128),
});
```

---

## 🛡️ API Security

### CORS & Rate Limiting

```typescript
import { cors } from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";

app
  .use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
  .use(rateLimit({ duration: 60000, max: 100 }));
```

---

## 🔍 Security Checklist

- [ ] Passwords hashed with Argon2
- [ ] JWT tokens have short expiry
- [ ] All inputs validated with Zod
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] Sensitive data never logged
