# syntax=docker/dockerfile:1

# ============================================
# TurboStack frontend - Next.js Frontend
# Optimized for layer caching
# ============================================

FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies - optimized layer caching
FROM base AS deps
# Copy dependency files first (changes less frequently)
COPY package.json bun.lock bun.lockb turbo.json ./
COPY apps/frontend/package.json ./apps/frontend/
# Copy only package.json files from packages (for dependency resolution)
COPY packages/*/package.json ./packages/
# Copy packages directory structure
COPY packages/ ./packages/
# Install with retry mechanism for network issues
RUN bun install --frozen-lockfile || (echo "Retrying bun install..." && bun install)

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
# Copy only necessary files for build
COPY package.json bun.lock bun.lockb turbo.json ./
COPY apps/frontend/ ./apps/frontend/
COPY packages/ ./packages/

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client (only if schema changed)
RUN bun run db:generate
# Build Next.js application
RUN cd apps/frontend && bun run build

# Production stage - minimal runtime image
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4100
ENV HOSTNAME="0.0.0.0"

# Copy standalone output from builder
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 4100

# Run the standalone server
CMD ["bun", "run", "apps/frontend/server.js"]
