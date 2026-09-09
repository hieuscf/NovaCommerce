# NovaCommerce Database Package

Central Prisma package for NovaCommerce PostgreSQL persistence.

## Stack

- PostgreSQL 17
- Prisma ORM 6.5
- TypeScript

## Structure

```text
packages/database/
├── prisma/
│   ├── schema.prisma      # All module persistence models + OutboxMessage
│   └── migrations/        # Versioned SQL migrations
├── src/
│   ├── index.ts           # Re-exports PrismaClient
│   └── test/              # Integration test helpers
├── package.json
└── README.md
```

## Configuration

Set `DATABASE_URL` in the environment (see root `.env.example`):

```text
DATABASE_URL=postgresql://novacommerce:change-me@localhost:5432/novacommerce?schema=public
```

For local infrastructure:

```bash
docker compose -f docker-compose.dev.yml up -d postgres
```

## Commands

From repository root:

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate:deploy` | Apply pending migrations |
| `pnpm db:validate` | Validate `schema.prisma` |
| `pnpm db:test` | Run database integration tests |

From `packages/database`:

| Command | Description |
|---------|-------------|
| `pnpm run generate` | Generate Prisma Client |
| `pnpm run migrate:deploy` | Apply migrations (production/CI) |
| `pnpm run migrate:dev` | Create/apply migrations in development |
| `pnpm run validate` | Validate schema |
| `pnpm run format` | Format schema |
| `pnpm run build` | Compile package TypeScript |
| `pnpm run typecheck` | Typecheck without emit |
| `pnpm run test` | Integration tests (requires PostgreSQL) |

## Local Development Workflow

1. Start PostgreSQL (`docker compose -f docker-compose.dev.yml up -d postgres`)
2. Set `DATABASE_URL`
3. Apply migrations: `pnpm db:migrate:deploy`
4. Generate client: `pnpm db:generate`
5. Run tests: `pnpm db:test`

## Migration Strategy

- Single unified PostgreSQL database (Modular Monolith phase)
- Initial migration: `20250907000000_init` — full business schema + outbox
- Migrations are forward-only; use new migration files for schema changes
- Module ownership boundaries are logical — no cross-module Prisma relations

## Reset Strategy (Development Only)

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d postgres
pnpm db:migrate:deploy
```

This destroys local PostgreSQL data.

## Seed Strategy

No seed script is implemented yet. Seed data will be added when Application layer modules require deterministic development fixtures.

## Outbox Pattern

`OutboxMessage` stores domain integration events in the same database transaction as aggregate persistence.

```text
BEGIN
  Save Aggregate (+ child entities)
  Save OutboxMessage
COMMIT
  → Outbox Worker polls unpublished messages
  → Event Bus (future: Kafka)
```

### OutboxMessage fields

| Field | Column | Description |
|-------|--------|-------------|
| `id` | `id` | UUID primary key |
| `aggregateId` | `aggregate_id` | Aggregate root ID |
| `aggregateType` | `aggregate_type` | e.g. `Order`, `Payment` |
| `eventType` | `event_type` | e.g. `OrderCreated` |
| `payload` | `payload` | JSON event payload |
| `createdAt` | `created_at` | Event occurrence time |
| `processedAt` | `processed_at` | Set when published (null = pending) |
| `retryCount` | `retry_count` | Publish retry counter |
| `lastError` | `last_error` | Last publish failure message |

Worker: `workers/outbox-publisher` polls `processed_at IS NULL`.

## Architecture Rules

- Prisma is **Infrastructure only** — never import into Domain layer
- Each module owns its tables; no cross-module FK relations
- Cross-context references use UUID columns without Prisma `@relation`
- Repository implementations live in `modules/<context>/infrastructure/prisma/repositories/` (future)

## Related Documentation

- [database-design.md](../../docs/database-design.md) — canonical schema reference
- [domain-model.md](../../docs/domain-model.md) — aggregate design
- [event-catalog.md](../../docs/event-catalog.md) — event types and payloads
