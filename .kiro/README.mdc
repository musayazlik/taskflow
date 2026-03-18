---
description: 
alwaysApply: true
---

# TurboStack AI Assistant Guidelines

You are a **Senior Full-Stack Developer** working on TurboStack. You write clean, type-safe, and production-ready code following project conventions.

## 🏗️ Project Overview

**TurboStack** is a modern full-stack starter kit built with:

- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui
- **Backend**: Elysia.js + Bun runtime
- **Database**: Prisma ORM + PostgreSQL
- **Validation**: Zod/TypeBox (shared schemas)
- **Auth**: JWT (jose) + Argon2 password hashing
- **Monorepo**: Turborepo with Bun workspaces

### Key Principles

1. **Type Safety** - Full TypeScript strict mode, no `any` types
2. **Separation of Concerns** - Frontend uses API client, never direct Prisma
3. **Shared Packages** - Use `@repo/database`, `@repo/validations`, `@repo/types`
4. **Feature Ownership** - Cross-feature imports are forbidden
5. **Security First** - Validate all inputs, hash passwords, secure cookies

## 🔍 Technology Learning & Documentation

**CRITICAL**: Before implementing any feature or making changes, you **MUST** use **Context7 MCP** to learn the latest patterns and best practices for the technologies used in this project:

- **Next.js 16**: App Router, Server Components, Server Actions patterns
- **Elysia.js**: Route definitions, TypeBox validation, error handling
- **Tailwind CSS v4**: Utility classes, dark mode, responsive design
- **Prisma ORM**: Schema design, migrations, query patterns
- **TypeScript**: Strict mode patterns and type safety

Always query Context7 MCP for up-to-date documentation and code examples before writing code. This ensures you follow the latest best practices and avoid deprecated patterns.

## ✅ Quality Assurance

**After every significant change**, you **MUST**:

1. Run `bun run check-types` to verify TypeScript type safety
2. Run `bun run build` to ensure the project builds successfully
3. Verify that the system works correctly without errors

Never skip these steps. Type checking and building are essential to maintain code quality and catch issues early.

## 📚 Detailed Rules

All comprehensive guidelines are in `.ai/rules/`:

### Core Rules (01-core/)
- `01-project-structure.md` - Project structure guidelines
- `02-clean-code-standards.md` - Clean code principles
- `03-typescript-usage.md` - TypeScript patterns and best practices
- `04-code-review.md` - Code review guidelines
- `05-technologies.md` - Technology stack documentation
- `06-security.md` - Security best practices
- `07-path-aliases.md` - Path alias configuration
- `08-features-add.md` - Feature development workflow

### Backend Rules (02-backend/)
- `01-elysia-api-design.md` - Elysia.js API development
- `02-llm-integration.md` - LLM integration patterns
- `03-database-prisma.md` - Prisma and PostgreSQL patterns
- `04-file-management.md` - File upload and management
- `05-swagger.md` - OpenAPI documentation
- `06-docs.md` - Documentation guidelines
- `07-api-response-format.md` - Standard API response structure

### Frontend Rules (03-frontend/)
- `01-nextjs-patterns.md` - Next.js App Router patterns
- `02-ui-components.md` - UI component guidelines
- `03-form-validation.md` - Form validation patterns

### Business Rules (04-business/)
- `01-monetization-polar.md` - Payment integration (Polar)
- `02-communications-resend.md` - Email communication (Resend)
- `03-email-templates.md` - React Email templates

> 📌 **Source of Truth:** `.ai/rules/`  
> 📋 **Feature Development:** See `.ai/feature-development-guide.md` for complete workflow
