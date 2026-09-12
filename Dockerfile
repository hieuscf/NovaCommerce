# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0
ARG PNPM_VERSION=9.15.4

FROM node:${NODE_VERSION}-alpine3.21 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/gateway/package.json ./apps/gateway/
COPY packages/building-blocks/package.json ./packages/building-blocks/
COPY packages/database/package.json ./packages/database/
COPY packages/infrastructure/package.json ./packages/infrastructure/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./
COPY modules ./modules
COPY packages/building-blocks ./packages/building-blocks
COPY packages/database ./packages/database
COPY packages/infrastructure ./packages/infrastructure
COPY apps/gateway ./apps/gateway
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV NODE_ENV="production"
ENV PORT="3000"
ENV REDIS_URL="redis://placeholder:6379/0"
ENV OPENSEARCH_URL="http://placeholder:9200"
ENV MINIO_ENDPOINT="placeholder:9000"
ENV MINIO_ACCESS_KEY="placeholder"
ENV MINIO_SECRET_KEY="placeholder"
RUN pnpm --filter @novacommerce/building-blocks run build
RUN pnpm --filter @novacommerce/database run generate
RUN pnpm --filter @novacommerce/database run build
RUN pnpm --filter @novacommerce/infrastructure run build
RUN pnpm --filter @novacommerce/gateway run build
RUN pnpm deploy --filter @novacommerce/gateway --prod /prod/gateway
RUN set -eux; \
  GENERATED="$(ls -d /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client)"; \
  TARGET_DIR="$(ls -d /prod/gateway/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma)"; \
  rm -rf "$TARGET_DIR/client"; \
  cp -r "$GENERATED" "$TARGET_DIR/client"

FROM node:${NODE_VERSION}-alpine3.21 AS runner
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nestjs
WORKDIR /app
ENV NODE_ENV=production
USER nestjs

COPY --from=build --chown=nestjs:nodejs /prod/gateway ./
COPY --from=build --chown=nestjs:nodejs /app/packages/database/prisma ./prisma

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health > /dev/null 2>&1 || exit 1

CMD ["node", "dist/apps/gateway/src/main.js"]
