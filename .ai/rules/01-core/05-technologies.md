# Technology Stack Documentation

This document provides a comprehensive overview of the modern, high-performance technology stack used in TaskFlow. It details the versions and configurations for core tools, frontend and backend frameworks, and shared packages to maintain a consistent development environment.

## 🎯 Overview

## 📦 Monorepo & Build Tools

### Turborepo

**Version**: 2.x

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Key Features**:

- Parallel task execution
- Smart caching
- Dependency graph awareness

### Bun

**Version**: 1.1.x

Fast JavaScript runtime and package manager.

```bash
# Installation
curl -fsSL https://bun.sh/install | bash

# Package management
bun install          # Install dependencies
bun add <package>    # Add package
bun remove <package> # Remove package

# Running
bun run dev          # Run dev script
bun run --watch src/index.ts  # Watch mode
```

---

## 🖥️ Frontend Stack

### Next.js 16

**Version**: 16.x with App Router

```typescript
// next.config.mjs
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig = {
  output: "standalone",
  transpilePackages: [
    "@repo/shadcn-ui",
    "@repo/database",
    "@repo/types",
    "@repo/validations",
  ],
};

export default withMDX(nextConfig);
```

**Features Used**:

- App Router with route groups
- Server Components (default)
- Server Actions
- Turbopack for development
- Standalone output for Docker

### React 19

**Version**: 19.x

```typescript
// Server Component (default)
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);
  return <div>{user.name}</div>;
}

// Client Component
"use client";
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Tailwind CSS v4

**Version**: 4.x

New CSS-first configuration with `@theme`:

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: oklch(0.55 0.25 280);
  --color-primary-foreground: oklch(0.99 0 0);

  /* Radius */
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  /* Animations */
  --animate-accordion-down: accordion-down 0.2s ease-out;
}
```

**Key Changes from v3**:

- No `tailwind.config.ts` required
- CSS-based configuration with `@theme`
- `oklch()` color functions
- Native CSS nesting

### shadcn/ui

**Configuration**: `components.json`

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Component Installation**:

```bash
bunx shadcn@latest add button
bunx shadcn@latest add dialog
bunx shadcn@latest add dropdown-menu
```

### Iconify (SSR)

**Packages**: `@iconify-icons/lucide`, `@iconify-icons/simple-icons`

```typescript
// components/iconify.tsx
import { cn } from "@/lib/utils";

type IconifyIconData = {
  body: string;
  width?: number;
  height?: number;
};

export function Iconify({
  icon,
  className,
  size = 24,
  ...props
}: {
  icon: IconifyIconData;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${icon.width ?? 24} ${icon.height ?? 24}`}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...props}
    >
      <g dangerouslySetInnerHTML={{ __html: icon.body }} />
    </svg>
  );
}

// Usage
import githubIcon from "@iconify-icons/simple-icons/github";
<Iconify icon={githubIcon} size={20} />
```

---

## ⚡ Backend Stack

### Elysia.js

**Version**: 1.3.x

```typescript
// src/index.ts
import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  )
  .use(
    rateLimit({
      duration: 60 * 1000,
      max: 100,
    })
  )
  .use(
    openapi({
      documentation: {
        info: { title: "TaskFlow API", version: "1.0.0" },
      },
    })
  )
  .get("/", () => ({ message: "Welcome to TaskFlow API" }))
  .listen(process.env.PORT || 3001);
```

**Plugins Used**:

- `@elysiajs/cors` - CORS handling
- `@elysiajs/jwt` - JWT authentication
- `@elysiajs/openapi` - Swagger documentation
- `elysia-rate-limit` - Rate limiting

### Route Pattern

```typescript
// src/routes/users.ts
import { Elysia, t } from "elysia";
import { prisma } from "@repo/database";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    const users = await prisma.user.findMany();
    return { success: true, data: users };
  })
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw new Error("User not found");
      return { success: true, data: user };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  );
```

---

## 🗄️ Database Stack

### Prisma ORM

**Version**: 6.x with PostgreSQL

```prisma
// schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?
  role          Role      @default(USER)
  emailVerified DateTime?

  accounts Account[]
  sessions Session[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

**Commands**:

```bash
bun run db:generate   # Generate client
bun run db:push       # Push schema changes
bun run db:migrate    # Create migration
bun run db:studio     # Open Prisma Studio
```

---

## ✅ Validation Stack

### Zod

**Version**: 3.x

```typescript
// packages/validations/src/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = loginSchema
  .extend({
    name: z.string().min(2, "Name must be at least 2 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

### React Hook Form

**Version**: 7.x

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@repo/validations";

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    // Handle submission
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 🔐 Authentication Stack

### JWT (jose)

**Version**: Latest

```typescript
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Create token
export async function createToken(payload: object) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// Verify token
export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
```

### Argon2 (Password Hashing)

**Package**: `@node-rs/argon2`

```typescript
import { hash, verify } from "@node-rs/argon2";

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await verify(hash, password);
}
```

---

## 📧 Email Stack

### Resend

**Version**: Latest

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  return await resend.emails.send({
    from: "TaskFlow <noreply@example.com>",
    to,
    subject,
    html,
  });
}
```

### React Email

**Version**: Latest

```tsx
// src/emails/verification.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
} from "@react-email/components";

export function VerificationEmail({
  verificationUrl,
}: {
  verificationUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Verify your email</Text>
          <Link href={verificationUrl}>Click here to verify</Link>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## 💳 Payments Stack

## 🤖 AI Stack (Optional)

### OpenRouter / Vercel AI SDK

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function chat(messages: Message[]) {
  return streamText({
    model: openrouter("anthropic/claude-3.5-sonnet"),
    messages,
  });
}
```

### Tiptap v3 (Rich Text)

```typescript
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function Editor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World!</p>",
  });

  return <EditorContent editor={editor} />;
}
```
