<p align="center">
  <h1 align="center">TaskFlow</h1>
  <p align="center">A production-ready task management platform built as a monorepo with Next.js 16, NestJS, and Prisma.</p>
</p>

---

## ✨ Features

- ⚡ **Next.js 16** — React framework with App Router, Turbopack, and standalone output
- 🏗️ **NestJS** — Modular, scalable API with Swagger docs and WebSocket gateways
- 🗄️ **Prisma** — Type-safe PostgreSQL ORM with migrations and Prisma Studio
- 🔐 **Better Auth** — Email/password and Google OAuth with cross-subdomain cookie support
- 🔄 **Socket.IO** — Real-time task and notification updates via authenticated WebSocket namespaces
- 🤖 **AI Integration** — AI-powered features via OpenRouter SDK (Vercel AI SDK on frontend)
- 📧 **Resend** — Transactional emails for verification, password reset, and notifications
- 📁 **UploadThing** — File uploads with image processing (Sharp)
- 🎨 **Tailwind CSS v4** — Modern styling with shadcn/ui component library
- 📦 **Turborepo** — High-performance monorepo build system with Bun runtime
- 🐳 **Docker** — Multi-stage Dockerfiles for API and Web with Docker Compose

## 📁 Project Structure

```
taskflow/
├── apps/
│   ├── api/              # NestJS backend API (port 4101)
│   └── web/              # Next.js 16 frontend (port 4100)
├── packages/
│   ├── database/         # Prisma schema, client & migrations
│   ├── types/            # Shared TypeScript types & utilities
│   ├── validations/      # Shared Zod validation schemas
│   ├── shadcn-ui/        # Shared UI components (shadcn/ui)
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── scripts/              # CLI scripts (env sync, setup, deployment)
├── .ai/                  # Internal AI/coding guidelines (see .ai/README.md)
├── Dockerfile.api        # API production Docker image
├── Dockerfile.web        # Web production Docker image
├── docker-compose.yml    # Full-stack Docker Compose
└── turbo.json            # Turborepo pipeline configuration
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | [Bun](https://bun.sh) ≥ 1.1 |
| **Frontend** | [Next.js 16](https://nextjs.org) · React 19 · Tailwind CSS v4 · shadcn/ui · Framer Motion |
| **Backend** | [NestJS](https://nestjs.com) · Express · Socket.IO · Swagger |
| **Database** | [PostgreSQL](https://postgresql.org) · [Prisma](https://prisma.io) ORM |
| **Auth** | [Better Auth](https://better-auth.com) (email/password, Google OAuth, sessions) |
| **Email** | [Resend](https://resend.com) · React Email |
| **File Storage** | [UploadThing](https://uploadthing.com) · Sharp |
| **AI** | [OpenRouter](https://openrouter.ai) SDK · Vercel AI SDK |
| **Monorepo** | [Turborepo](https://turbo.build) |
| **Deployment** | Docker · Coolify / Vercel / Railway |

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.1 (includes Node.js compatibility)
- [PostgreSQL](https://postgresql.org) 16+ (local, Docker, or managed like [Neon](https://neon.tech))
- [Git](https://git-scm.com)

### 1. Clone the Repository

```bash
git clone https://github.com/musayazlik/taskflow.git
cd taskflow
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment Variables

Copy the example `.env` files and fill in your values:

```bash
# API environment
cp apps/api/.env.example apps/api/.env

# Web environment
cp apps/web/.env.example apps/web/.env
```

#### API (`apps/api/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/taskflow` |
| `PORT` | API server port | `4101` |
| `FRONTEND_URL` | Web app URL (for CORS & cookies) | `http://localhost:4100` |
| `BETTER_AUTH_URL` | API URL (for OAuth callbacks) | `http://localhost:4101` |
| `BETTER_AUTH_SECRET` | Auth encryption secret (required in production) | *(generate a random string)* |
| `RESEND_API_KEY` | Resend API key for emails | `re_...` |
| `FROM_EMAIL` | Sender email address | `noreply@yourdomain.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | *(from Google Cloud Console)* |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | *(from Google Cloud Console)* |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features | `sk-or-...` |
| `UPLOADTHING_TOKEN` | UploadThing token (base64 encoded) | *(from UploadThing dashboard)* |

#### Web (`apps/web/.env`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Public API URL (embedded at build time) | `http://localhost:4101` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `http://localhost:4100` |

### 4. Set Up the Database

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database (development)
bun run db:push

# (Optional) Seed the database
bun run db:seed
```

### 5. Start Development

```bash
# Start all apps (API + Web)
bun run dev

# Or start individually:
bun run dev:api    # API only (port 4101)
bun run dev:web    # Web only (port 4100)
```

Open [http://localhost:4100](http://localhost:4100) in your browser.

## 📋 Available Commands

| Command | Description |
|---|---|
| `bun run dev` | Start all apps in development mode |
| `bun run dev:web` | Start only the web app |
| `bun run dev:api` | Start only the API |
| `bun run build` | Build all apps for production |
| `bun run lint` | Lint all apps |
| `bun run check-types` | Type-check all apps |
| `bun run format` | Format code with Prettier |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:migrate` | Run Prisma migrations |
| `bun run db:reset` | Reset database |
| `bun run db:seed` | Seed database with initial data |
| `bun run db:studio` | Open Prisma Studio GUI |
| `bun run db:start` | Reset + push + seed (full DB setup) |
| `bun run env:sync` | Sync env files by Git branch |
| `bun run clean` | Remove build artifacts |

## 🐳 Docker

### Development with Docker Compose

```bash
# Start all services (PostgreSQL + API + Web)
bun run docker:up

# View logs
bun run docker:logs

# Stop all services
bun run docker:down
```

### Production Build

```bash
# Build API image
docker build -f Dockerfile.api -t taskflow-api .

# Build Web image (requires build args for production URLs)
docker build -f Dockerfile.web \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api.example.com \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-app.example.com \
  -t taskflow-web .
```

> **Important:** `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` must be provided as Docker build arguments because Next.js embeds `NEXT_PUBLIC_*` variables at build time.

## 🌐 Production Deployment

### Environment Variables for Production

#### API Service
| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `4101` |
| `DATABASE_URL` | *(your production PostgreSQL URL)* |
| `FRONTEND_URL` | `https://your-app.example.com` |
| `BETTER_AUTH_URL` | `https://your-api.example.com` |
| `BETTER_AUTH_SECRET` | *(strong random secret)* |

#### Web Service (build args)
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-api.example.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.example.com` |

### Deployment Platforms

| Component | Recommended Platforms |
|---|---|
| **Web** | [Vercel](https://vercel.com) · [Coolify](https://coolify.io) · Docker |
| **API** | [Coolify](https://coolify.io) · [Railway](https://railway.app) · Docker |
| **Database** | [Neon](https://neon.tech) · [Supabase](https://supabase.com) · Self-hosted PostgreSQL |

## 🏗️ Architecture Overview

```
┌─────────────────────┐         ┌─────────────────────────┐
│   Next.js 16 (Web)  │  HTTP   │     NestJS (API)        │
│                     │────────▶│                         │
│  • App Router       │  REST   │  • REST Controllers     │
│  • Server Actions   │         │  • Swagger Docs         │
│  • Better Auth      │  WS     │  • Better Auth Server   │
│    (React Client)   │────────▶│  • Socket.IO Gateways   │
│  • Socket.IO Client │         │  • Prisma ORM           │
│  • Tailwind + shadcn│         │  • File Upload (UT)     │
│  • Zustand Store    │         │  • Email (Resend)       │
└─────────────────────┘         └────────────┬────────────┘
                                             │
                                    ┌────────▼────────┐
                                    │   PostgreSQL    │
                                    │   (via Prisma)  │
                                    └─────────────────┘
```

## 📄 License

Proprietary License — see [LICENSE](LICENSE) for details.

| | |
|---|---|
| ✅ Personal projects | ✅ Commercial projects |
| ✅ Client work | ✅ Modify for your own use |
| ❌ Redistribution | ❌ Share with third parties |
