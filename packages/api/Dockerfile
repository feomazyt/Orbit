# Build and run API (monorepo: needs workspace root for @orbit/schemas)
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY patches ./patches
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY pnpm-workspace.yaml package.json ./
WORKDIR /app/packages/api
RUN pnpm exec tsc

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=builder /app/packages/api/dist ./packages/api/dist
WORKDIR /app/packages/api
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec mikro-orm migration:up && node dist/index.js"]
