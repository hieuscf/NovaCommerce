# NovaCommerce Docker Guide

This document describes how to build, run, and troubleshoot the NovaCommerce Docker environment.

## Repository Status Note

At the time this Docker setup was created, the repository was in **Planning Phase** (documentation only). A minimal bootstrap monorepo scaffold was added so Docker images can be built and validated. Values below are taken from:

1. **Actual scaffold source code** (build/start commands, ports, health endpoints)
2. **`docs/techContext.md`** (Node 22, pnpm, PostgreSQL 17, Python 3.12, etc.)

When application modules grow, update Dockerfiles only if build outputs or runtime commands change.

---

## 1. Docker Architecture

```text
                 ┌──────────────┐
                 │  Web :3001   │
                 └──────┬───────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
 ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
 │ Admin :3002 │ │  API :3000  │ │ AI :8000    │
 └─────────────┘ └──────┬──────┘ └─────────────┘
                        │
      ┌─────────┬───────┼───────┬─────────┐
      │         │       │       │         │
      ▼         ▼       ▼       ▼         ▼
 PostgreSQL  Redis OpenSearch MinIO    Worker
   :5432     :6379    :9200   :9000   (no HTTP)
```

### Services

| Service | Image / Dockerfile | Port | Health |
|---------|-------------------|------|--------|
| PostgreSQL | `postgres:17.4-alpine3.21` | 5432 | `pg_isready` |
| Redis | `redis:7.4.2-alpine3.21` | 6379 | `redis-cli ping` |
| OpenSearch | `opensearchproject/opensearch:2.19.1` | 9200 | `/_cluster/health` |
| MinIO | `minio/minio:RELEASE.2025-04-22T22-12-26Z` | 9000 (API), 9001 (console) | `/minio/health/live` |
| Migrate | `Dockerfile.migrate` | — | one-shot job |
| API (Gateway) | `Dockerfile` | 3000 | `GET /health` |
| Worker | `Dockerfile.worker` | — | process only |
| Web | `Dockerfile.web` | 3001 | HTTP `/` |
| Admin | `Dockerfile.admin` | 3002 | HTTP `/` |
| AI Service | `Dockerfile.ai` | 8000 | `GET /health` |
| Kafka | `bitnami/kafka:3.9.0` | 9092 | profile `future` only |

### Network

All services use the `novacommerce-network` bridge network. Applications connect using Docker service names (`postgres`, `redis`, `opensearch`, `minio`, `ai-service`), not `localhost`.

---

## 2. Build Images

From the repository root:

```bash
# API (NestJS Gateway)
docker build -t novacommerce-api -f Dockerfile .

# Outbox Worker
docker build -t novacommerce-worker -f Dockerfile.worker .

# Web (Next.js)
docker build -t novacommerce-web -f Dockerfile.web --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000 .

# Admin (Next.js)
docker build -t novacommerce-admin -f Dockerfile.admin --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000 .

# AI Service (FastAPI)
docker build -t novacommerce-ai -f Dockerfile.ai .

# Database Migration Job
docker build -t novacommerce-migrate -f Dockerfile.migrate .
```

Build all application images via Compose:

```bash
docker compose build
```

---

## 3. Run Local Environment

### Full stack (infrastructure + applications)

```bash
cp .env.example .env
# Edit .env and replace placeholder passwords/secrets

docker compose config
docker compose up -d
docker compose ps
```

### Infrastructure only (hot reload local apps on host)

```bash
docker compose -f docker-compose.dev.yml up -d
```

Then run apps locally with pnpm (see section 7–9).

### Stop and clean up

```bash
docker compose down
docker compose down -v   # also removes volumes
```

---

## 4. Run Migrations

Production-safe strategy: **one-shot migration job**, not `prisma migrate dev`.

```bash
# Via Compose (runs automatically before API/worker)
docker compose up migrate

# Manual one-shot
docker compose run --rm migrate
```

The migration container executes:

```bash
pnpm --filter @novacommerce/database run migrate:deploy
```

This maps to `prisma migrate deploy` using migrations in `packages/database/prisma/migrations/`.

**Rules:**

- Do not run `prisma migrate dev` in production containers.
- Do not run migrations from multiple API replicas simultaneously.
- Run migrations as a separate job before scaling API.

---

## 5. Start API

```bash
docker compose up -d api
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok","service":"gateway","timestamp":"..."}
```

---

## 6. Start Worker

```bash
docker compose up -d worker
docker compose logs -f worker
```

The worker:

- Polls `outbox_messages` table
- Marks pending messages as processed
- Handles `SIGTERM` / `SIGINT` for graceful shutdown
- Does **not** expose HTTP (no fake health server)

---

## 7. Start Frontend (Web)

```bash
docker compose up -d web
curl http://localhost:3001/
```

Local development (without Docker image rebuild):

```bash
pnpm install
pnpm --filter @novacommerce/web run dev
```

---

## 8. Start Admin

```bash
docker compose up -d admin
curl http://localhost:3002/
```

---

## 9. Start AI Service

```bash
docker compose up -d ai-service
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ok","service":"ai-api"}
```

---

## 10. Access PostgreSQL

From host:

```bash
psql "postgresql://novacommerce:change-me@localhost:5432/novacommerce"
```

From another container on the same network:

```text
postgresql://novacommerce:change-me@postgres:5432/novacommerce
```

---

## 11. Access Redis

From host:

```bash
redis-cli -a change-me -h localhost -p 6379 ping
```

Connection URL used by applications inside Docker:

```text
redis://:change-me@redis:6379/0
```

---

## 12. Access OpenSearch

```bash
curl http://localhost:9200/_cluster/health?pretty
```

Inside Docker network:

```text
http://opensearch:9200
```

Local/dev configuration disables the OpenSearch security plugin. Do not use this topology in production.

---

## 13. Access MinIO

| Endpoint | URL |
|----------|-----|
| S3 API | http://localhost:9000 |
| Console | http://localhost:9001 |

Default credentials (change in `.env`):

- User: `novacommerce`
- Password: `change-me`

Inside Docker network:

```text
minio:9000
```

---

## 14. Environment Variables

See `.env.example` for the full list. Grouped summary:

| Group | Variables |
|-------|-----------|
| Application | `NODE_ENV`, `PORT`, `WEB_PORT`, `ADMIN_PORT`, `AI_PORT` |
| Database | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL` |
| Redis | `REDIS_PASSWORD`, `REDIS_URL` |
| OpenSearch | `OPENSEARCH_HOST`, `OPENSEARCH_PORT`, `OPENSEARCH_URL` |
| MinIO | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_USE_SSL` |
| Authentication | `JWT_SECRET` |
| AI | `AI_SERVICE_URL` |
| Frontend | `NEXT_PUBLIC_API_URL` (build-time for Docker images) |
| Worker | `WORKER_POLL_INTERVAL_MS` |

**Build-time vs runtime (Next.js):**

- `NEXT_PUBLIC_*` is embedded at **image build time** via Docker `ARG`.
- Server-side runtime vars can be passed in `docker-compose.yml` `environment:` block.

---

## 15. Troubleshooting

### OpenSearch fails to start (Linux)

Increase vm.max_map_count:

```bash
sudo sysctl -w vm.max_map_count=262144
```

### Migration job fails

```bash
docker compose logs migrate
docker compose ps postgres
```

Ensure PostgreSQL is healthy before migrate runs.

### API unhealthy

```bash
docker compose logs api
curl -v http://localhost:3000/health
```

### Worker not processing

```bash
docker compose logs worker
docker compose exec postgres psql -U novacommerce -d novacommerce -c "SELECT COUNT(*) FROM outbox_messages WHERE processed_at IS NULL;"
```

### Port conflicts

Change host port mappings in `docker-compose.yml` if 5432, 6379, 9200, 9000, 3000–3002, or 8000 are already in use.

### Kafka (future profile only)

Kafka is **not** a default dependency:

```bash
docker compose --profile future up -d kafka
```

---

## 16. Production Considerations

1. **Secrets**: Use a secret manager (AWS Secrets Manager, Vault, etc.), not `.env` files in images.
2. **Migrations**: Run as CI/CD job or Kubernetes Job before deployment rollout.
3. **OpenSearch**: Enable security plugin, TLS, and multi-node topology.
4. **MinIO**: Use distributed mode or managed object storage (S3).
5. **Redis**: Use managed Redis with TLS in production.
6. **Images**: Scan with Trivy/Snyk; pin digest hashes in production manifests.
7. **Non-root**: All application images run as non-root users.
8. **Graceful shutdown**: NestJS uses `enableShutdownHooks()`; worker handles `SIGTERM`/`SIGINT`.
9. **Horizontal scaling**: Scale API replicas; run **one** migration job per deployment.
10. **Kafka**: Enable only when codebase migrates from in-memory event bus.

---

## Monorepo Build Reference

| Item | Value |
|------|-------|
| Package manager | pnpm 9.15.4 |
| Node.js | 22 LTS (`>=22.0.0`) |
| API build | `pnpm --filter @novacommerce/gateway run build` |
| API start | `node dist/main.js` |
| Worker build | `pnpm --filter @novacommerce/outbox-worker run build` |
| Worker start | `node dist/main.js` |
| Web/Admin build | `next build` (standalone output) |
| Prisma generate | `pnpm --filter @novacommerce/database run generate` |
| Prisma migrate (prod) | `pnpm --filter @novacommerce/database run migrate:deploy` |
| Python | 3.12 |
| AI server | `uvicorn app.main:app --host 0.0.0.0 --port 8000` |
