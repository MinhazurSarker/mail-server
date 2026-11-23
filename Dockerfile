# ====================================================================
# CellsInbox: Sovereign Enterprise Email Infrastructure
# Multi-stage Production Dockerfile
# ====================================================================

FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@11.0.8

# Dependencies caching layer
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/api-server/package.json ./apps/api-server/
COPY apps/queue/package.json ./apps/queue/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/schema/package.json ./packages/schema/
COPY packages/service/package.json ./packages/service/

RUN pnpm install --frozen-lockfile

# Source builder layer
FROM dependencies AS builder
COPY . .
ENV NODE_ENV=production
ENV INTERNAL_API_URL=http://api_server:4000
RUN pnpm run build --force

# --------------------------------------------------------------------
# 1. Inbound SMTP Daemon Target (Port 25)
# --------------------------------------------------------------------
FROM node:22-alpine AS server
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 25
ENV NODE_ENV=production
CMD ["node", "apps/server/dist/index.js"]

# --------------------------------------------------------------------
# 2. CellsWeb RPC API Server Target (Port 4000)
# --------------------------------------------------------------------
FROM node:22-alpine AS api-server
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "apps/api-server/dist/index.js"]

# --------------------------------------------------------------------
# 3. MTA Outbound Queue Worker Target
# --------------------------------------------------------------------
FROM node:22-alpine AS queue
WORKDIR /app
COPY --from=builder /app /app
ENV NODE_ENV=production
CMD ["node", "apps/queue/dist/index.js"]

# --------------------------------------------------------------------
# 4. Next.js Webmail & Admin Client Target (Port 3000)
# --------------------------------------------------------------------
FROM node:22-alpine AS web
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3000
ENV NODE_ENV=production
ENV INTERNAL_API_URL=http://api_server:4000
CMD ["node", "apps/web/node_modules/next/dist/bin/next", "start", "apps/web", "-p", "3000"]
