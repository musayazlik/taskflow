# TurboStack

Production-ready monorepo starter with Next.js, Elysia.js, and Prisma.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/musayazlik/turbostack&project-name=turbostack&repository-name=turbostack&root-directory=apps/frontend&env=DATABASE_URL,JWT_SECRET,SESSION_SECRET,NEXT_PUBLIC_API_URL&envDescription=Required%20environment%20variables%20for%20turbostack)

## ✨ Features

- 🚀 **Next.js 16** - React framework with App Router
- ⚡ **Elysia.js** - Fast Bun-powered backend API
- 🗄️ **Prisma** - Type-safe database ORM
- 🔐 **Authentication** - JWT-based auth with email verification
- 📧 **Resend** - Transactional emails with React Email
- 🎨 **Tailwind CSS v4** - Modern styling with shadcn/ui
- 📦 **Turborepo** - High-performance build system

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/musayazlik/turbostack.git
cd turbostack

# Install dependencies
bun install

# Setup environment (automatically synced by branch)
bun run env:sync

# Push database schema
bun run db:push

# Start development server
bun run dev
```

### 🔄 Branch-Based Environment Sync

Proje, branch bazlı otomatik environment variable senkronizasyonu içerir. Her branch için farklı database kullanabilirsiniz:

- **Otomatik**: Git hook ile branch değiştirdiğinizde otomatik olarak doğru `.env` dosyası seçilir
- **Manuel**: `bun run env:sync` komutu ile manuel olarak senkronize edebilirsiniz

**Branch-specific env dosyaları:**
- `apps/api/.env.development` - Development branch
- `apps/api/.env.lite` - Lite branch
- `apps/api/.env.master` - Master branch

Yeni branch için env dosyası eklemek için `apps/api/.env.{branch-name}` dosyası oluşturun.

## 📁 Project Structure

```
turbostack/
├── apps/
│   ├── frontend/     # Next.js frontend (port 3000)
│   └── backend/      # Elysia.js backend (port 3001)
├── packages/
│   ├── database/     # Prisma schema & client
│   ├── types/        # Shared TypeScript types
│   ├── validations/  # Zod schemas
│   └── ui/           # Shared UI components
└── docs/             # Markdown documentation
```

## 🛠️ Commands

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `bun run dev`         | Start all apps in development mode |
| `bun run dev:web`     | Start only the web app             |
| `bun run dev:api`     | Start only the API                 |
| `bun run build`       | Build all apps                     |
| `bun run db:push`     | Push Prisma schema to database     |
| `bun run db:studio`   | Open Prisma Studio                 |
| `bun run polar:setup` | Setup Polar.sh payment system      |

## 🌐 Deployment

### Frontend (Vercel)

Deploy with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/musayazlik/turbostack&project-name=turbostack&repository-name=turbostack&root-directory=apps/frontend&env=DATABASE_URL,JWT_SECRET,SESSION_SECRET,NEXT_PUBLIC_API_URL&envDescription=Required%20environment%20variables%20for%20turbostack)

Or manually:

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
cd apps/frontend && vercel
```

### Backend (Railway/Render)

The Elysia.js API requires a platform that supports Bun runtime:

- [Railway](https://railway.app) - Recommended
- [Render](https://render.com)
- [Fly.io](https://fly.io)

### Database

- [Supabase](https://supabase.com) - Managed PostgreSQL
- [Neon](https://neon.tech) - Serverless PostgreSQL

## 📚 Documentation

Visit the [documentation](https://turbostack-docs.vercel.app) for detailed guides.

## 📄 License

Proprietary License - see [LICENSE](LICENSE) for details.

**Usage Terms:**
- ✅ Personal projects
- ✅ Commercial projects
- ❌ Redistribution to third parties
- ❌ Sharing with third parties (free or paid)
