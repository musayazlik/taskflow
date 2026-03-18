# TurboStack AI Rules

This directory contains universal project rules that can be read by any AI coding assistant.

## 📁 Structure

```
.ai/
├── README.md                      # This file
├── project-rules.mdc              # Master rules file (Cursor format)
├── feature-development-guide.md   # Feature geliştirme yol haritası (Türkçe) ⭐ NEW
└── rules/
    ├── structure.md               # Project structure guidelines
    ├── technologies.md            # Technology stack documentation
    ├── api.md                     # Elysia.js API development (legacy)
    ├── api.md                     # API (apps/api) guidelines ⭐ NEW
    ├── web.md                     # Web (apps/web) guidelines ⭐ UPDATED
    ├── docs.md                    # Documentation (apps/docs) guidelines ⭐ NEW
    ├── database.md                # Prisma and PostgreSQL patterns
    ├── security.md                # Security best practices
    ├── clean-code.md              # Clean code principles
    ├── api-response-format.md     # Standard API response structure
    ├── email-templates.md          # React Email templates guide
    ├── path-aliases.md             # Path alias configuration
    ├── swagger.md                 # OpenAPI documentation
    └── media.md                   # Media/upload service (UploadThing, Cloudinary) ⭐ UPDATED
```

## 🔧 IDE Compatibility

| IDE/Tool           | Configuration                     | Status        |
| ------------------ | --------------------------------- | ------------- |
| **Cursor**         | `.cursor/rules/*.mdc`             | ✅ Existing   |
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ Configured |
| **Windsurf**       | `.windsurfrules`                  | ✅ Configured |
| **Aider**          | `CONVENTIONS.md`                  | ✅ Configured |
| **Cline**          | `.clinerules`                     | ✅ Configured |
| **Gemini/Agent**   | `.agent/rules/`                   | ✅ Symlinked  |

## 📖 Usage

All AI assistants should reference these rules when working on the TurboStack codebase. The rules provide:

- **Project structure and conventions** - How the monorepo is organized
- **Technology stack documentation** - Complete tech stack reference
- **API development** - Elysia.js patterns, routes, services, authentication
- **Web development** - Next.js App Router, React Server Components, Zustand
- **Documentation** - Mintlify MDX content guidelines
- **Database patterns** - Prisma ORM usage, schema design, migrations
- **Security guidelines** - Authentication, authorization, data protection
- **Coding standards** - Clean code principles and best practices

### Quick Reference by Task

| Task                  | Primary Rules File                                    |
| --------------------- | ----------------------------------------------------- |
| Feature Development   | [`feature-development-guide.md`](./feature-development-guide.md) ⭐ |
| Working on API        | [`api.md`](./rules/api.md)                            |
| Building Web UI       | [`web.md`](./rules/web.md)                            |
| Writing Documentation | [`docs.md`](./rules/docs.md)                          |
| Database Changes      | [`database.md`](./rules/database.md)                 |
| Security Review       | [`security.md`](./rules/security.md)                 |
| Code Quality          | [`clean-code.md`](./rules/clean-code.md)              |

Ensure your AI assistant is configured to read from the `.ai/rules/` directory for consistent and accurate code generation aligned with TurboStack's standards.


---

## 🆕 What's New

### February 2026

- ✨ **Added** `feature-development-guide.md` - Comprehensive Turkish guide for feature development workflow
- 📋 **Includes** step-by-step process from TypeScript types to frontend pages
- ✅ **Covers** database schema, seed data, API services, and UI integration

### January 2026

- ✨ **Added** dedicated `api.md` guide for `apps/api` development
- ✨ **Expanded** `web.md` with complete `apps/web` documentation
- ✨ **Created** comprehensive `docs.md` for Mintlify documentation app
- 🔄 **Renamed** apps: `backend` → `api`, `frontend` → `web`
- 📚 **Updated** all documentation to align with new structure

---

_Last updated: 2026-02-07_
