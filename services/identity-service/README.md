# Identity Service

Core microservice for **authentication, authorization, and user management** in the NovaCommerce platform. Every client request that requires identity eventually flows through this service — either directly for auth endpoints, or indirectly via JWT verification at the API Gateway.

| Attribute           | Value                                      |
| ------------------- | ------------------------------------------ |
| HTTP port           | `8081`                                     |
| Database            | PostgreSQL (`identity_db`)                 |
| Cache               | Redis                                      |
| Messaging (planned) | Kafka topic `user-events`                  |
| Module              | `github.com/novacommerce/identity-service` |

---

## Current Status

The service is in **bootstrap phase**: infrastructure wiring, health checks, database schema, and domain contracts are in place. Business logic (auth APIs, repositories, JWT, OAuth, Kafka) is **not yet implemented**.

| Area                                    | Status                              |
| --------------------------------------- | ----------------------------------- |
| HTTP server + graceful shutdown         | Implemented                         |
| Config (YAML + env)                     | Implemented                         |
| PostgreSQL pool (`pgx`) + Redis client  | Implemented                         |
| OpenTelemetry (traces + metrics)        | Implemented                         |
| `GET /health`                           | Implemented                         |
| SQL migrations (`001`–`005`)            | Implemented                         |
| Domain entities + repository interfaces | Defined                             |
| Postgres repository implementations     | Not started                         |
| `/api/v1/*` routes                      | Group created, no routes registered |
| JWT signing/verification                | Config only (`JWT_*` env vars)      |
| OAuth provider integration              | Schema only                         |
| Kafka publishing                        | Config only (`KAFKA_*` env vars)    |

When reading this README, sections marked **(planned)** describe target architecture from `docs/PROJECT_CONTEXT.md` and `docs/ARCHITECTURE.md`, not current Go code.

---

## Why This Service Exists

NovaCommerce is a multi-service e-commerce platform. Identity Service is the **trust boundary** for the entire system:

1. **Authenticate** users (email/password, OAuth social login).
2. **Authorize** actions via RBAC (roles → permissions).
3. **Issue and rotate** JWT access tokens and refresh tokens.
4. **Manage** user lifecycle (registration, profile updates, account status).
5. **Publish** user lifecycle events so downstream services (Catalog, Commerce, Engagement) can react without tight coupling.

Per platform architecture, the API Gateway (Kong) routes `/api/v1/auth/*` to this service on port `8081` and validates JWTs for all other protected routes.

---

## Architecture

The service follows **hexagonal / clean architecture** with four layers. Dependencies point inward: infrastructure and HTTP depend on application, which depends on domain.

```
┌─────────────────────────────────────────────────────────────┐
│  cmd/server/main.go                                         │
│  Bootstrap: config → telemetry → DB → Redis → HTTP server   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  internal/infrastructure/                                   │
│  HTTP (Gin), PostgreSQL pool, Redis, (future: Kafka)      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  internal/application/service/                              │
│  Use cases: health (done), auth, users, roles (planned)     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  internal/domain/                                           │
│  entity/ — aggregates    repository/ — interfaces           │
└─────────────────────────────────────────────────────────────┘
```

### Request flow (implemented today)

```mermaid
sequenceDiagram
    participant Client
    participant Gin as Gin Router
    participant MW as Middleware Chain
    participant H as HealthHandler
    participant S as HealthService
    participant PG as PostgreSQL
    participant RD as Redis

    Client->>Gin: GET /health
    Gin->>MW: otelgin → RequestID → Logger → Recovery → CORS
    MW->>H: HealthHandler.Check
    H->>S: HealthService.Check(ctx)
    S->>PG: pool.Ping()
    S->>RD: redis.Ping()
    S-->>H: HealthResult
    H-->>Client: 200 JSON (503 if both deps down)
```

Middleware order is fixed in `internal/infrastructure/http/router/router.go`:

1. `otelgin.Middleware` — distributed tracing
2. `middleware.RequestID` — propagate or generate `X-Request-ID`
3. `middleware.InjectLogger` — attach structured logger to context
4. `middleware.Logger` — log method, path, status, latency (skips `/health`, `/metrics`)
5. `middleware.Recovery` — panic → `500` via `pkg/response`
6. `middleware.CORS` — configurable origins

### Request flow (planned — auth)

```mermaid
sequenceDiagram
    participant Client
    participant Kong as API Gateway
    participant H as AuthHandler
    participant S as AuthService
    participant R as UserRepository
    participant PG as PostgreSQL
    participant K as Kafka

    Client->>Kong: POST /api/v1/auth/login
    Kong->>H: Forward request
    H->>S: Login(email, password)
    S->>R: FindByEmail
    R->>PG: SELECT ...
    S->>S: Verify bcrypt, issue JWT RS256 + refresh token
    S->>PG: INSERT refresh_tokens (SHA-256 hash)
    S->>K: Publish USER_REGISTERED / USER_UPDATED
    S-->>H: tokens
    H-->>Client: 200 { access_token, refresh_token }
```

---

## Project Structure

```
services/identity-service/
├── cmd/server/
│   ├── main.go                 # Entry point: config, telemetry, DB, Redis, HTTP, shutdown
│   └── telemetry.go            # OTLP trace + metric providers
├── config/
│   ├── config.go               # Viper loader, struct definitions, defaults
│   └── config.yaml             # Default YAML (committed; override via env)
├── internal/
│   ├── domain/
│   │   ├── entity/user.go      # User, Role, Permission, RefreshToken, OAuthAccount
│   │   └── repository/
│   │       └── interfaces.go   # UserRepository, RoleRepository, etc.
│   ├── application/service/
│   │   └── health.go           # HealthService — dependency ping checks
│   └── infrastructure/
│       ├── cache/redis.go      # Redis client factory + connect ping
│       ├── http/
│       │   ├── handler/
│       │   │   └── health_handler.go   # GET /health
│       │   ├── middleware/middleware.go
│       │   └── router/router.go        # Gin engine + route registration
│       └── persistence/postgres/
│           └── db.go             # pgxpool factory + otelpgx tracer
├── migrations/                 # golang-migrate SQL files (001–005)
├── .env.example                # Environment variable template
├── Dockerfile                  # Multi-stage distroless image (build from monorepo root)
├── go.mod / go.sum
└── README.md
```

### Key files explained

| File                                                 | Responsibility                                                                                                                                                                                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cmd/server/main.go`                                 | Loads config, initializes telemetry, connects Postgres + Redis, wires `HealthService` → `HealthHandler` → `router.NewRouter`, starts `http.Server` on `:8081`, handles `SIGINT`/`SIGTERM` graceful shutdown (`APP_GRACEFUL_TTL` seconds). |
| `cmd/server/telemetry.go`                            | Registers OTLP gRPC exporters for traces and metrics; sets W3C `TraceContext` + `Baggage` propagators. Shutdown with 5s timeout on exit.                                                                                                  |
| `config/config.go`                                   | Loads `.env` (best-effort), reads `config/config.yaml`, applies env overrides via `AutomaticEnv` with `.` → `_` replacer (`APP_PORT` → `app.port`).                                                                                       |
| `internal/infrastructure/persistence/postgres/db.go` | Creates `pgxpool.Pool` with configurable max/min connections and `otelpgx` tracing. Fails fast if DSN empty or ping fails.                                                                                                                |
| `internal/infrastructure/cache/redis.go`             | Creates `go-redis` client; fails fast if addr empty or ping fails.                                                                                                                                                                        |
| `internal/domain/repository/interfaces.go`           | Contracts for persistence — **no implementations yet**. Implement under `internal/infrastructure/persistence/postgres/`.                                                                                                                  |
| `internal/infrastructure/http/router/router.go`      | Registers `GET /health`; creates empty `/api/v1` group for future auth routes. Sets `gin.ReleaseMode` when `APP_ENV != development`.                                                                                                      |

### Monorepo shared packages (`pkg/`)

| Package          | Used today                   | Available for future use                        |
| ---------------- | ---------------------------- | ----------------------------------------------- |
| `pkg/logger`     | Structured logging (zerolog) | —                                               |
| `pkg/errors`     | Panic recovery error type    | —                                               |
| `pkg/response`   | Standardized error responses | Success envelopes for API handlers              |
| `pkg/database`   | —                            | `RunMigrations()` wrapper around golang-migrate |
| `pkg/kafka`      | —                            | Event publishing to `user-events`               |
| `pkg/middleware` | —                            | Shared gateway-style middleware                 |
| `pkg/validator`  | —                            | Request validation                              |
| `pkg/pagination` | —                            | List endpoints                                  |

---

## API Endpoints

### Implemented

#### `GET /health`

Dependency health check for orchestrators and load balancers.

**Response** (`200 OK`, or `503` when **both** PostgreSQL and Redis are unreachable):

```json
{
  "data": {
    "status": "ok",
    "service": "identity-service",
    "version": "1.0.0",
    "checks": {
      "database": "ok",
      "redis": "ok"
    }
  },
  "meta": null,
  "error": null
}
```

Partial failure (one dependency down) still returns `200` with mixed check values. Only total failure yields `503`.

Source: `internal/infrastructure/http/handler/health_handler.go`, `internal/application/service/health.go`.

### Planned (via API Gateway)

From `docs/ARCHITECTURE.md`, Kong routes `/api/v1/auth/*` → Identity Service `:8081`:

| Endpoint                             | Purpose                                               |
| ------------------------------------ | ----------------------------------------------------- |
| `POST /api/v1/auth/register`         | Create user account                                   |
| `POST /api/v1/auth/login`            | Email/password login → JWT + refresh token            |
| `POST /api/v1/auth/refresh`          | Rotate access token using refresh token               |
| `POST /api/v1/auth/logout`           | Revoke refresh token                                  |
| `POST /api/v1/auth/oauth/{provider}` | OAuth2 social login (Google, Facebook, GitHub, Apple) |
| `GET /api/v1/auth/me`                | Current user profile                                  |
| `POST /api/v1/auth/password/reset`   | Password reset flow                                   |

The router placeholder is already prepared:

```go
v1 := r.Group("/api/v1")
_ = v1  // routes to be registered here
```

---

## Authentication Design

Config and database schema are ready; Go implementation is pending.

### JWT (planned)

Configured in `config.Config.JWT` (loaded but **not used** at runtime):

| Setting          | Env var                | Default              | Purpose                  |
| ---------------- | ---------------------- | -------------------- | ------------------------ |
| Private key path | `JWT_PRIVATE_KEY_PATH` | `./keys/private.pem` | RS256 signing            |
| Public key path  | `JWT_PUBLIC_KEY_PATH`  | `./keys/public.pem`  | RS256 verification       |
| Access TTL       | `JWT_ACCESS_TTL`       | `15` (minutes)       | Short-lived access token |
| Refresh TTL      | `JWT_REFRESH_TTL`      | `7` (days)           | Refresh token lifetime   |

The `keys/` directory does not exist yet. Generate RSA key pair before implementing JWT (referenced in `.env.example` as task SVC-IS-003).

Platform note: Kong's JWT Auth plugin verifies tokens at the gateway; other services trust Kong-injected identity headers after verification.

### Password hashing (planned)

- Registration/login will use **bcrypt** (cost ≥ 12).
- Dev seed migration `005` already stores bcrypt hashes for test accounts.

### Refresh tokens (schema ready)

Table `refresh_tokens` (`004_create_refresh_tokens.up.sql`):

- Stores **SHA-256 hash only** — never the raw token.
- `token_status` enum: `active`, `revoked`, `expired`.
- `device_info` as `JSONB` (`user_agent`, `ip`, `device_type`).
- Periodic cleanup: `DELETE FROM refresh_tokens WHERE expires_at < NOW() AND status != 'active'`.

Go entity `RefreshToken` still uses `IsRevoked bool` — align with `status` enum when implementing the repository.

### OAuth (schema ready)

Table `oauth_accounts` (`003_create_oauth_accounts.up.sql`):

- Providers: `google`, `facebook`, `github`, `apple`.
- Unique constraint on `(provider, provider_user_id)`.
- `access_token` / `refresh_token` must be encrypted with **AES-256-GCM** at the application layer before persistence.
- `raw_profile JSONB` stores flexible provider response data.

### RBAC (schema ready)

Five system roles seeded in migration `005` (always applied):

| Role       | Description                             |
| ---------- | --------------------------------------- |
| `customer` | End user — browse and purchase          |
| `seller`   | Merchant — manage products and orders   |
| `admin`    | Full system access                      |
| `analyst`  | Read-only analytics dashboards          |
| `partner`  | External partner with scoped API access |

Tables: `roles`, `permissions`, `user_roles`, `role_permissions`. Permissions use `resource:action` naming (e.g. `product:create`).

### Account lifecycle / soft delete

Users do **not** use `deleted_at`. Deactivation is modeled via `user_status` enum: `active`, `inactive`, `banned`, `pending_verification` (default on registration). `UserRepository.SoftDelete` will set status, not hard-delete rows.

---

## Configuration

Configuration loads in this order (later wins):

1. Defaults in `config/config.go` (`setDefaults`)
2. `config/config.yaml`
3. Environment variables (via Viper `AutomaticEnv`)
4. `.env` file in the service directory (via `gotenv.Load`)

Copy the template before local development:

```bash
cp .env.example .env
```

### Environment variables

| Variable                     | Default              | Description                                                    |
| ---------------------------- | -------------------- | -------------------------------------------------------------- |
| `APP_NAME`                   | `identity-service`   | Service name in logs and health response                       |
| `APP_ENV`                    | `development`        | `development` \| `staging` \| `production` — controls Gin mode |
| `APP_PORT`                   | `8081`               | HTTP listen port                                               |
| `APP_GRACEFUL_TTL`           | `30`                 | Graceful shutdown timeout (seconds)                            |
| `APP_LOG_LEVEL`              | `info`               | Log level (`debug`, `info`, `warn`, `error`)                   |
| `DATABASE_DSN`               | see `config.yaml`    | PostgreSQL connection string                                   |
| `DATABASE_MAX_OPEN_CONNS`    | `25`                 | Pool max connections                                           |
| `DATABASE_MAX_IDLE_CONNS`    | `5`                  | Pool min idle connections                                      |
| `DATABASE_CONN_MAX_LIFETIME` | `300`                | Connection max lifetime (seconds)                              |
| `REDIS_ADDR`                 | `localhost:6379`     | Redis host:port                                                |
| `REDIS_PASSWORD`             | `""`                 | Redis password                                                 |
| `REDIS_DB`                   | `0`                  | Redis database index                                           |
| `KAFKA_BROKERS`              | `localhost:9092`     | Kafka broker list _(not wired)_                                |
| `KAFKA_GROUP_ID`             | `identity-service`   | Consumer group _(not wired)_                                   |
| `JWT_PRIVATE_KEY_PATH`       | `./keys/private.pem` | RS256 private key _(not wired)_                                |
| `JWT_PUBLIC_KEY_PATH`        | `./keys/public.pem`  | RS256 public key _(not wired)_                                 |
| `JWT_ACCESS_TTL`             | `15`                 | Access token TTL in minutes                                    |
| `JWT_REFRESH_TTL`            | `7`                  | Refresh token TTL in days                                      |
| `TELEMETRY_OTLP_ENDPOINT`    | `localhost:4317`     | OTLP collector gRPC endpoint                                   |
| `TELEMETRY_SERVICE_NAME`     | `identity-service`   | OpenTelemetry service name                                     |
| `HTTP_CORS_ALLOW_ORIGINS`    | `*`                  | CORS allowed origins (comma-separated if multiple)             |

### Port alignment note

`config.yaml` and `.env.example` use PostgreSQL port **5433**, while the monorepo root `.env.example` defaults `POSTGRES_PORT=5432`. After `make dev-up`, verify your `DATABASE_DSN` matches the actual mapped port:

```bash
# If using default monorepo compose (port 5432):
DATABASE_DSN=postgres://nova:nova_dev_password@localhost:5432/identity_db?sslmode=disable
```

---

## Local Development

### Prerequisites

- Go **1.25+** (`go.mod` declares `go 1.25.0`)
- Docker + Docker Compose (for infrastructure)
- [golang-migrate CLI](https://github.com/golang-migrate/migrate) (for database migrations)

### 1. Start infrastructure

From the **monorepo root**:

```bash
cp .env.example .env          # root .env for Docker Compose
make dev-up                   # PostgreSQL, Redis, Kafka, etc.
make dev-init                 # Creates identity_db and other service databases
```

`dev-init.sh` creates `identity_db` among the service databases.

### 2. Configure the service

```bash
cd services/identity-service
cp .env.example .env
# Edit DATABASE_DSN to match your Postgres port (see Port alignment note)
```

### 3. Run database migrations

```bash
cd services/identity-service

export DATABASE_URL="postgres://nova:nova_dev_password@localhost:5432/identity_db?sslmode=disable"

# Dev accounts in migration 005 require app.environment=development on the migrate connection.
# Pass it via connection options (golang-migrate opens its own pool — a separate psql SET does not apply):
export DATABASE_URL="${DATABASE_URL}&options=-c%20app.environment%3Ddevelopment"

migrate -path ./migrations -database "$DATABASE_URL" up
```

Migration `005` checks `current_setting('app.environment', true) = 'development'`. Omit the `options` parameter in staging/production to seed only system roles.

### 4. Run the service

```bash
cd services/identity-service
go run ./cmd/server
```

Verify:

```bash
curl -s http://localhost:8081/health | jq
```

### Development accounts (after migration 005)

| Username       | Email                       | Password          | Role       |
| -------------- | --------------------------- | ----------------- | ---------- |
| `admin_dev`    | `admin@novacommerce.dev`    | `Admin@123456`    | `admin`    |
| `seller_dev`   | `seller@novacommerce.dev`   | `Seller@123456`   | `seller`   |
| `customer_dev` | `customer@novacommerce.dev` | `Customer@123456` | `customer` |

**Development only.** Bcrypt hashes are embedded in SQL (cost=12). Never use these credentials outside local environments.

---

## Database & Migrations

**Tool:** [golang-migrate](https://github.com/golang-migrate/migrate)  
**Location:** `migrations/`  
**Format:** `{version}_{description}.up.sql` / `.down.sql`

The monorepo also provides `pkg/database.RunMigrations()` for programmatic migration, but the service does **not** call it at startup — migrations are expected to run as a separate deploy/init step.

### Schema overview

| Migration                      | Creates                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| `001_create_users`             | `user_status` enum, `users` table, `update_updated_at_column()` trigger |
| `002_create_roles_permissions` | `roles`, `permissions`, `user_roles`, `role_permissions`                |
| `003_create_oauth_accounts`    | `oauth_provider` enum, `oauth_accounts` table                           |
| `004_create_refresh_tokens`    | `token_status` enum, `refresh_tokens` table                             |
| `005_seed_default_roles`       | 5 system roles + conditional dev users                                  |

### Entities

`users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `oauth_accounts`, `refresh_tokens`

See [docs/ERD.md](../../docs/ERD.md#1-identity-service-postgresql) for the platform ERD.

### Entity ↔ schema alignment (work in progress)

Go entities in `internal/domain/entity/user.go` predate the final migration schema. Align before implementing repositories:

| Field              | Go entity                                             | SQL migration                |
| ------------------ | ----------------------------------------------------- | ---------------------------- |
| User status values | Missing `pending_verification`                        | Default status in DB         |
| `User.FullName`    | `*string`                                             | `NOT NULL`                   |
| `Role`             | Missing `display_name`, `is_system`, `updated_at`     | Present in `002`             |
| `Permission`       | Missing `name`, `created_at`                          | Present in `002`             |
| `RefreshToken`     | `IsRevoked bool`                                      | `status` enum + `revoked_at` |
| `OAuthAccount`     | Missing `provider_email`, `raw_profile`, `updated_at` | Present in `003`             |

### Migration commands

```bash
# Apply all pending migrations
migrate -path ./migrations -database "$DATABASE_URL" up

# Roll back one step
migrate -path ./migrations -database "$DATABASE_URL" down 1

# Check current version
migrate -path ./migrations -database "$DATABASE_URL" version
```

---

## Observability

### Logging

Uses `pkg/logger` (zerolog):

- **Development:** human-readable console output
- **Non-development:** structured JSON logs
- Every request gets a `X-Request-ID` header (client-supplied or auto-generated UUID v4)
- Request logging includes `method`, `path`, `status`, `latency`, `client_ip`, `request_id`
- `/health` and `/metrics` paths are excluded from request logs

### Distributed tracing

| Layer       | Instrumentation                                |
| ----------- | ---------------------------------------------- |
| HTTP        | `otelgin.Middleware` on every Gin request      |
| PostgreSQL  | `otelpgx.NewTracer()` on `pgxpool` connections |
| Propagation | W3C TraceContext + Baggage                     |

Traces export via **OTLP gRPC** to `TELEMETRY_OTLP_ENDPOINT` (default `localhost:4317`, insecure). Ensure an OTLP collector (e.g. Grafana Alloy, OpenTelemetry Collector) is running locally if you want to inspect traces.

### Metrics

OTLP gRPC metric exporter with a **15-second** periodic reader. Business metrics (login rate, token issuance, failed auth) are not implemented yet.

### Gaps

- No `/metrics` Prometheus scrape endpoint (middleware skips logging for it, but no handler exists)
- Kafka and auth flows have no custom spans or metrics yet
- `HealthService` hardcodes `version: "1.0.0"` separately from `main.Version` (build-time ldflags)

---

## Deployment

### Docker image

Build from the **monorepo root** (required for `pkg/` and `replace` directive):

```bash
docker build \
  -f services/identity-service/Dockerfile \
  --build-arg VERSION=1.0.0 \
  -t identity-service \
  .
```

| Stage   | Base image                                  | Output                                        |
| ------- | ------------------------------------------- | --------------------------------------------- |
| Builder | `golang:1.23-alpine`                        | Static binary `identity-service`              |
| Runtime | `gcr.io/distroless/static-debian12:nonroot` | Binary + `config/config.yaml` + `migrations/` |

- Exposes port `8081`
- Runs as `nonroot` user
- **Does not** include JWT keys, `.env`, or migration execution in `ENTRYPOINT`

### Production checklist

1. Run migrations as an init job or CI/CD step before/with deployment.
2. Mount JWT RSA keys at paths configured by `JWT_PRIVATE_KEY_PATH` / `JWT_PUBLIC_KEY_PATH`.
3. Set `APP_ENV=production` (enables Gin release mode).
4. Point `DATABASE_DSN`, `REDIS_ADDR`, `TELEMETRY_OTLP_ENDPOINT` to environment-specific endpoints.
5. Set `HTTP_CORS_ALLOW_ORIGINS` to explicit origins (not `*`).
6. Configure Kong to route `/api/v1/auth/*` → Identity Service pods.

### CI/CD (monorepo)

```bash
make build          # Build all Go services
make test           # Run all service tests
make lint           # golangci-lint
make docker-build   # Build all service Docker images
```

Platform pipeline: `git push → GitHub Actions → Build & Test → Docker Build → Security Scan → ArgoCD deploy` (see `docs/PROJECT_CONTEXT.md`).

---

## Extending the Service

Follow the established layer pattern when adding features.

### 1. Update domain (if needed)

- Add or align fields in `internal/domain/entity/`.
- Extend or add methods in `internal/domain/repository/interfaces.go`.

### 2. Implement repository

Create `internal/infrastructure/persistence/postgres/user_repository.go` (and siblings):

```go
type UserRepository struct {
    pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) repository.UserRepository {
    return &UserRepository{pool: pool}
}
```

Use `pgx` with context propagation. Queries are automatically traced via `otelpgx`.

### 3. Add application service

Create use-case logic in `internal/application/service/`:

```go
type AuthService struct {
    users   repository.UserRepository
    tokens  repository.RefreshTokenRepository
    // jwtSigner, kafkaProducer, etc.
}
```

Keep business rules here — not in handlers or repositories.

### 4. Add HTTP handler

Create `internal/infrastructure/http/handler/auth_handler.go`:

- Parse and validate request input.
- Call application service.
- Return responses via `pkg/response` for consistency with other NovaCommerce services.

### 5. Register routes

In `internal/infrastructure/http/router/router.go`:

```go
v1 := r.Group("/api/v1")
auth := v1.Group("/auth")
auth.POST("/login", authHandler.Login)
auth.POST("/register", authHandler.Register)
// ...
```

Wire dependencies in `cmd/server/main.go` (constructor injection).

### 6. Add migration (if schema changes)

```bash
# Create new files manually:
migrations/006_add_password_reset_tokens.up.sql
migrations/006_add_password_reset_tokens.down.sql
```

Never edit applied migration files in deployed environments.

### 7. Publish events (when ready)

Use `pkg/kafka` to publish to `user-events`:

- `USER_REGISTERED`
- `USER_UPDATED`

Downstream services (Catalog, Commerce) consume these for cache invalidation and denormalized user references.

### Testing conventions

- Unit-test application services with mocked repositories.
- Integration-test repositories against a real PostgreSQL instance (Docker).
- Place tests alongside packages: `user_repository_test.go`.

---

## Kafka (planned)

| Direction | Topic         | Events                            |
| --------- | ------------- | --------------------------------- |
| Publish   | `user-events` | `USER_REGISTERED`, `USER_UPDATED` |

`KAFKA_BROKERS` and `KAFKA_GROUP_ID` are configured but no producer/consumer code exists in this service yet.

---

## Related Documentation

| Document                                                                                     | Content                                 |
| -------------------------------------------------------------------------------------------- | --------------------------------------- |
| [PROJECT_CONTEXT — §4.1 Identity Service](../../docs/PROJECT_CONTEXT.md#41-identity-service) | Platform role, entities, Kafka topic    |
| [ARCHITECTURE — API Gateway routes](../../docs/ARCHITECTURE.md)                              | Kong routing `/api/v1/auth/*` → `:8081` |
| [ERD — Identity Service](../../docs/ERD.md#1-identity-service-postgresql)                    | Entity relationship diagram             |
| [migrations/README.md](./migrations/README.md)                                               | golang-migrate naming and run commands  |

---

## Quick Reference

```bash
# Infrastructure (monorepo root)
make dev-up && make dev-init

# Service (this directory)
cp .env.example .env
migrate -path ./migrations -database "$DATABASE_URL" up
go run ./cmd/server

# Health check
curl http://localhost:8081/health

# Docker build (monorepo root)
docker build -f services/identity-service/Dockerfile -t identity-service .
```
