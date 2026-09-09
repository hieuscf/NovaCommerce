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
COPY packages/database/package.json ./packages/database/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/database ./packages/database
COPY apps/gateway ./apps/gateway
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN pnpm --filter @novacommerce/database run generate
RUN pnpm --filter @novacommerce/database run build
RUN pnpm --filter @novacommerce/gateway run build
RUN pnpm deploy --filter @novacommerce/gateway --prod /prod/gateway

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

CMD ["node", "dist/main.js"]
