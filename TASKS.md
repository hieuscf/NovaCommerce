# NovaCommerce Tasks

> **Project:** NovaCommerce
> **Version:** 0.1.0
> **Architecture:** Modular Monolith → Event-Driven → Microservices
> **Primary Language:** TypeScript
> **AI Platform:** Python
> **Last Updated:** 2026-09-09
> **Phase:** Foundation — design docs ~80%, code ~10%

---

# 0. Project Snapshot

| Area | Doc | Code | Notes |
| ---- | --- | ---- | ----- |
| Architecture & vision | ✅ | — | `docs/Project Context.md`, `NovaCommerce Architecture.md`, 4 ADRs |
| Foundation design docs | 🚧 | — | domain-model, database-design, event-catalog, api-guidelines, reponsitory-structure (draft) |
| Monorepo scaffold | ✅ | 🚧 | `apps/`, `packages/database`, `packages/building-blocks`, `workers/`, `ai-services/`, `modules/` (structure) |
| Business modules | 🚧 | 🚧 | Domain layer: 13/16 modules implemented; Application/Infra pending |
| Database (Prisma) | ✅ | 🚧 | 46 business tables + Outbox; schema synced with PostgreSQL |
| Event system | 🚧 | 🚧 | Outbox table + worker stub; `IEventBus` / `DomainEvent` in building-blocks (no runtime bus yet) |
| API (Gateway) | 🚧 | 🚧 | `/health` only — no Swagger, no `/api/v1` |
| Frontend | — | 🚧 | Next.js placeholder pages (web, admin) |
| AI services | 🚧 | 🚧 | FastAPI `/health` stub |
| Tests | — | ⏳ | No app tests |
| CI/CD | — | ⏳ | No GitHub Actions workflows |

**Key gaps:** Module Infrastructure repositories (Prisma), In-Memory EventBus implementation, test/CI infrastructure, foundation design doc sign-off.

---

# 1. Task Status

| Status | Meaning     |
| ------ | ----------- |
| `[x]`  | Completed   |
| `[~]`  | In Progress |
| `[ ]`  | Pending     |
| `[!]`  | Blocked     |

---

# 2. Milestone 1 — Foundation

## 2.1 Project & Architecture

- [x] Define project vision
- [x] Define architecture
- [x] Define technical context
- [x] Create ADRs
- [x] Define brand guidelines
- [x] Define design tokens
- [x] Configure Cursor / Agent rules
- [x] Create `docs/README.md` (documentation index)
- [x] Configure Documentation First protocol (`.cursor/rules/cursor.md`)

## 2.2 Repository

- [x] Initialize pnpm monorepo
- [x] Create `apps/` (gateway, web, admin)
- [x] Create `packages/` (`@novacommerce/database`, `@novacommerce/building-blocks`)
- [x] Create `workers/` (`outbox-publisher` only)
- [x] Create `ai-services/` (FastAPI stub)
- [x] Create base application scaffolds
- [x] Create repository Docker configuration
- [x] Create `.env.example`
- [~] Complete `docs/reponsitory-structure.md` (doc exists — filename typo; `modules/` scaffold now matches doc)
- [x] Create `modules/` folder per repository structure (16 contexts, Clean Architecture layers, README per module)
- [x] Create `packages/building-blocks` (`Result`, `DomainError`, `BaseEntity`, `AggregateRoot`, `ValueObject`, `DomainEvent`, `IEventBus`, `IOutboxStore`, etc.)
- [x] Complete root `README.md` (project intro, architecture, stack, development, docs links)

## 2.3 Development Standards

- [x] Define coding standards (`docs/coding-standards.md` + `.cursor/rules/novacommerce.mdc`)
- [x] Create `docs/coding-standards.md`
- [x] Define development workflow (`docs/contributing.md`)
- [x] Create `docs/contributing.md`
- [x] Define branch strategy (`master` + `feature/*`, `fix/*`, `docs/*`, etc.)
- [x] Define commit conventions (Conventional Commits)
- [x] Define Pull Request requirements (`.github/PULL_REQUEST_TEMPLATE.md` — NovaCommerce-specific)
- [x] Sync `docs/progress.md` with repo reality

## 2.4 Domain & Architecture

> Domain design audited in `docs/domain-model.md` v0.2.0. Domain layer implemented for 13 commerce modules; search/analytics/seller deferred.

- [x] Define bounded contexts (17 contexts documented — AI external, seller deferred)
- [x] Define aggregates (documented + audited)
- [x] Define entities (documented + audited)
- [x] Define value objects (documented + audited)
- [x] Define domain services (none required at foundation — documented)
- [x] Define repository interfaces (documented + implemented as interfaces)
- [x] Define domain events (documented + aligned with event-catalog)
- [x] Complete `docs/domain-model.md` (Reviewed for Implementation — audit table + reconciliation)
- [x] Create `modules/` per bounded context (16 modules)
- [x] Implement domain models in code (13/16 modules — search/analytics/seller deferred)

## 2.5 Database

> Canonical schema: `docs/database-design.md` ↔ `packages/database/prisma/schema.prisma` ↔ PostgreSQL (46 application tables + `outbox_messages`).

- [x] Create Prisma foundation (`packages/database` — full schema + `20250907000000_init` migration)
- [x] Define module database models (documented)
- [x] Define database constraints (documented)
- [x] Define indexes (documented)
- [x] Define logical domain separation (documented)
- [x] Complete ERD (in `docs/database-design.md`)
- [x] Complete `docs/database-design.md` (v1.0.0 — synchronized with Prisma)
- [x] Synchronize `database-design.md` with Prisma schema
- [x] Implement business tables in Prisma (46 models)
- [x] Database integration tests (`packages/database` — constraints + outbox atomicity)
- [ ] Module Infrastructure repositories (Prisma implementations per bounded context)

## 2.6 Event System

- [x] Create Outbox table (`outbox_messages`)
- [~] Create Outbox worker stub (`workers/outbox-publisher` — polls + marks processed; **no EventBus publish**)
- [x] Define EventBus abstraction (`@novacommerce/building-blocks` — `IEventBus` interface)
- [ ] Implement In-Memory Event Bus
- [x] Define Domain Event base model (code) (`DomainEvent` interface in building-blocks)
- [ ] Define Integration Event model (code)
- [x] Define event naming convention (documented in `event-catalog.md`)
- [~] Define event versioning (documented — not implemented in code)
- [~] Complete `docs/event-catalog.md` (foundation design — pending review)
- [ ] Finalize P0 event payload schemas in code

## 2.7 API

- [x] Create Gateway health endpoint (`GET /health`)
- [x] Define API versioning (documented in `api-guidelines.md`)
- [x] Define REST conventions (documented)
- [x] Define DTO conventions (documented)
- [x] Define error response format (documented)
- [x] Define pagination (documented)
- [x] Define authentication flow (documented)
- [x] Define authorization flow (documented)
- [~] Complete `docs/api-guidelines.md` (foundation standard — pending review)
- [ ] Implement `/api/v1` routing in Gateway
- [ ] Configure Swagger / OpenAPI
- [ ] Wire Gateway to `@novacommerce/database` (dep declared but unused)

## 2.8 Infrastructure

- [x] Docker Compose (full stack: postgres, redis, opensearch, minio, api, worker, web, admin, ai)
- [x] Development Docker Compose (infra-only)
- [x] Dockerfiles (api, web, admin, worker, migrate, ai)
- [x] PostgreSQL container
- [x] Redis container
- [x] OpenSearch container
- [x] MinIO container
- [x] Configure health checks (Docker/infra level + image HEALTHCHECK on api/ai)
- [ ] Integrate Redis in application code
- [ ] Integrate OpenSearch in application code
- [ ] Integrate MinIO in application code
- [ ] Configure application-level health checks (DB/Redis probes)
- [ ] Configure environment validation (config module)

---

# 3. Milestone 2 — Core Commerce

> **Goal:** Build the first complete commerce flow on the Modular Monolith.

## 3.1 Identity

- [ ] Define Identity domain model
- [ ] Define User authentication
- [ ] Implement registration
- [ ] Implement login
- [ ] Implement logout
- [ ] Implement JWT access token
- [ ] Implement refresh token
- [ ] Implement password management
- [ ] Implement OAuth2 / OIDC foundation
- [ ] Implement RBAC
- [ ] Implement permission model
- [ ] Add audit logging
- [ ] Add Identity tests

## 3.2 User

- [ ] Define User domain
- [ ] Implement customer profile
- [ ] Implement addresses
- [ ] Implement customer preferences
- [ ] Implement account management
- [ ] Add User events
- [ ] Add User tests

## 3.3 Catalog

- [ ] Define Product aggregate
- [ ] Define Product Variant
- [ ] Define Category
- [ ] Define Brand
- [ ] Define Attribute
- [ ] Define Product Image
- [ ] Implement product CRUD
- [ ] Implement category management
- [ ] Implement product publishing
- [ ] Implement product status
- [ ] Implement product pricing foundation
- [ ] Implement catalog API
- [ ] Emit `ProductCreated`
- [ ] Emit `ProductUpdated`
- [ ] Add Catalog tests

## 3.4 Inventory

- [ ] Define Inventory aggregate
- [ ] Define Stock Item
- [ ] Define Warehouse
- [ ] Define Stock Reservation
- [ ] Implement stock management
- [ ] Implement stock reservation
- [ ] Implement stock release
- [ ] Implement stock adjustment
- [ ] Handle `OrderCreated`
- [ ] Emit `StockReserved`
- [ ] Emit stock release event
- [ ] Add Inventory tests

## 3.5 Cart

- [ ] Define Cart aggregate
- [ ] Define Cart Item
- [ ] Implement add item
- [ ] Implement update quantity
- [ ] Implement remove item
- [ ] Implement clear cart
- [ ] Implement cart persistence
- [ ] Add Redis caching where appropriate
- [ ] Add Cart API
- [ ] Add Cart tests

## 3.6 Checkout

- [ ] Define Checkout flow
- [ ] Validate cart
- [ ] Validate inventory
- [ ] Calculate totals
- [ ] Apply promotion
- [ ] Validate customer information
- [ ] Create checkout application service
- [ ] Implement checkout API
- [ ] Add Checkout tests

## 3.7 Order

- [ ] Define Order aggregate
- [ ] Define Order Item
- [ ] Define Order status
- [ ] Define Order lifecycle
- [ ] Implement order creation
- [ ] Implement order cancellation
- [ ] Implement order query
- [ ] Implement order history
- [ ] Emit `OrderCreated`
- [ ] Emit order status events
- [ ] Persist Outbox message in same transaction
- [ ] Add Order tests

## 3.8 Core Commerce Flow

- [ ] Register customer
- [ ] Create product
- [ ] Add product to cart
- [ ] Checkout cart
- [ ] Create order
- [ ] Reserve inventory
- [ ] Publish domain events
- [ ] Process Outbox
- [ ] Verify complete checkout flow with E2E test

---

# 4. Milestone 3 — Commerce Extensions

## 4.1 Payment

- [ ] Define Payment domain
- [ ] Define Payment aggregate
- [ ] Define Payment status
- [ ] Define Payment provider interface
- [ ] Implement payment intent
- [ ] Implement payment confirmation
- [ ] Implement payment failure
- [ ] Implement refund foundation
- [ ] Emit `PaymentSucceeded`
- [ ] Emit payment failure event
- [ ] Add provider integration abstraction
- [ ] Add Payment tests

## 4.2 Shipping

- [ ] Define Shipping domain
- [ ] Define Shipment
- [ ] Define Shipping Address
- [ ] Define Shipping Method
- [ ] Define Shipping Provider interface
- [ ] Implement shipping calculation
- [ ] Implement shipment creation
- [ ] Implement shipment tracking
- [ ] Add Shipping events
- [ ] Add Shipping tests

## 4.3 Promotion

- [ ] Define Promotion domain
- [ ] Define Coupon
- [ ] Define Discount Rule
- [ ] Define Promotion Rule
- [ ] Implement coupon validation
- [ ] Implement discount calculation
- [ ] Implement usage limits
- [ ] Emit `CouponUsed`
- [ ] Add Promotion tests

## 4.4 Notification

- [ ] Define Notification domain
- [ ] Define notification templates
- [ ] Define email channel
- [ ] Define push channel
- [ ] Define notification events
- [ ] Consume order events
- [ ] Consume payment events
- [ ] Implement notification worker
- [ ] Add retry strategy
- [ ] Add Notification tests

## 4.5 Review

- [ ] Define Review domain
- [ ] Define Review aggregate
- [ ] Implement product reviews
- [ ] Implement rating
- [ ] Implement review moderation
- [ ] Implement review images
- [ ] Emit `ReviewCreated`
- [ ] Add Review tests

## 4.6 Returns & Refunds

- [ ] Define Return/Refund domain
- [ ] Define return request
- [ ] Define return status
- [ ] Define refund flow
- [ ] Integrate Order
- [ ] Integrate Payment
- [ ] Emit return/refund events
- [ ] Add tests

---

# 5. Milestone 4 — Intelligence & Discovery

## 5.1 Search

- [ ] Define Search domain boundary
- [ ] Configure OpenSearch
- [ ] Define product search index
- [ ] Build product indexer
- [ ] Consume `ProductCreated`
- [ ] Consume `ProductUpdated`
- [ ] Implement keyword search
- [ ] Implement filtering
- [ ] Implement sorting
- [ ] Implement pagination
- [ ] Implement Search API
- [ ] Add search caching
- [ ] Add Search tests

> Search must not query PostgreSQL directly.

## 5.2 Analytics

- [ ] Define Analytics domain
- [ ] Define analytics events
- [ ] Implement event ingestion
- [ ] Implement read models
- [ ] Implement dashboard queries
- [ ] Implement reporting
- [ ] Apply CQRS where justified
- [ ] Add Analytics tests

## 5.3 AI Platform

> AI services are implemented independently using Python/FastAPI.

### AI Foundation

- [x] Define AI service architecture (documented in Architecture + ADR-004)
- [~] FastAPI health endpoint (`ai-services/api/app/main.py`)
- [ ] Define AI provider abstraction
- [ ] Define LLM provider interface
- [ ] Configure OpenAI provider
- [ ] Configure Gemini provider
- [ ] Configure Claude provider
- [ ] Configure Ollama provider
- [ ] Configure model selection
- [ ] Add AI observability

### Chatbot

- [ ] Implement Chatbot service
- [ ] Define conversation model
- [ ] Implement context management
- [ ] Expose REST API
- [ ] Add tests

### Recommendation

- [ ] Define recommendation pipeline
- [ ] Define recommendation events
- [ ] Implement recommendation service
- [ ] Integrate product/catalog data
- [ ] Implement initial recommendation model
- [ ] Add evaluation pipeline
- [ ] Add tests

### Semantic Search

- [ ] Define embedding pipeline
- [ ] Configure pgvector
- [ ] Implement embedding generation
- [ ] Implement semantic retrieval
- [ ] Integrate OpenSearch where appropriate
- [ ] Expose Semantic Search API
- [ ] Add evaluation tests

### OCR

- [ ] Define OCR service
- [ ] Implement document/image processing
- [ ] Define OCR API
- [ ] Add tests

### Review Summary

- [ ] Implement review summarization
- [ ] Integrate Review events/data
- [ ] Expose API
- [ ] Add evaluation tests

### Content Generator

- [ ] Implement product content generation
- [ ] Implement SEO content generation
- [ ] Add human-review workflow
- [ ] Add tests

### Fraud Detection

- [ ] Define fraud signals
- [ ] Define fraud scoring interface
- [ ] Implement initial detection model
- [ ] Integrate checkout/payment events
- [ ] Add evaluation tests

---

# 6. Milestone 5 — Quality, Security & Observability

## 6.1 Testing

- [ ] Configure unit testing
- [ ] Configure integration testing
- [ ] Configure contract testing
- [ ] Configure E2E testing
- [ ] Configure performance testing
- [ ] Configure test coverage reporting
- [ ] Enforce minimum 80% coverage
- [ ] Add CI test pipeline

## 6.2 Security

- [ ] Implement JWT security
- [ ] Implement refresh token security
- [ ] Implement RBAC
- [ ] Implement ABAC where required
- [ ] Implement rate limiting
- [ ] Implement audit log
- [ ] Implement encryption strategy
- [ ] Implement secrets management
- [ ] Configure HTTPS
- [ ] Configure Helmet
- [ ] Configure CORS
- [ ] Validate all external input
- [ ] Security test APIs

## 6.3 Logging

- [ ] Implement structured logging
- [ ] Add Request ID
- [ ] Add Correlation ID
- [ ] Add User ID where applicable
- [ ] Add Module
- [ ] Add Action
- [ ] Add Duration
- [ ] Add Error Code
- [ ] Remove production `console.log`

## 6.4 Monitoring

- [ ] Integrate OpenTelemetry
- [ ] Add application metrics
- [ ] Configure Prometheus
- [ ] Configure Grafana
- [ ] Configure Jaeger
- [ ] Configure health checks
- [ ] Add tracing
- [ ] Add alerting
- [ ] Define SLO/SLI baseline

---

# 7. Milestone 6 — CI/CD & Deployment

## 7.1 CI

- [ ] Create GitHub Actions workflow
- [ ] Install dependencies
- [ ] Run lint
- [ ] Run type checking
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Build applications
- [ ] Build Docker images
- [ ] Publish artifacts

## 7.2 CD

- [ ] Define deployment environments
- [ ] Define development environment
- [ ] Define staging environment
- [ ] Define production environment
- [ ] Configure image registry
- [ ] Configure deployment pipeline
- [ ] Configure database migration pipeline
- [ ] Configure rollback strategy

## 7.3 Infrastructure

- [ ] Production PostgreSQL
- [ ] Production Redis
- [ ] Production OpenSearch
- [ ] Production MinIO
- [ ] Production AI services
- [ ] Reverse proxy
- [ ] TLS
- [ ] Secrets management
- [ ] Backup strategy
- [ ] Disaster recovery strategy

---

# 8. Milestone 7 — Scale & Microservices

## 8.1 Event Infrastructure

- [ ] Validate In-Memory Event Bus abstraction
- [ ] Validate Outbox reliability
- [ ] Introduce Kafka
- [ ] Define Kafka topics
- [ ] Define Integration Event contracts
- [ ] Implement event publishing worker
- [ ] Implement consumer groups
- [ ] Implement retry strategy
- [ ] Implement dead-letter strategy
- [ ] Implement event versioning

## 8.2 Service Extraction

Extract services in the following order:

- [ ] Extract Inventory
- [ ] Extract Payment
- [ ] Extract Order
- [ ] Extract Search
- [ ] Extract Notification

For each extracted service:

- [ ] Extract application layer
- [ ] Extract domain layer
- [ ] Extract infrastructure layer
- [ ] Define service API
- [ ] Define integration events
- [ ] Define service-owned database
- [ ] Update Gateway routing
- [ ] Add contract tests
- [ ] Add observability
- [ ] Verify Domain Model remains unchanged

## 8.3 Kubernetes

- [ ] Define Kubernetes architecture
- [ ] Create application deployments
- [ ] Create services
- [ ] Create ConfigMaps
- [ ] Create Secrets
- [ ] Configure autoscaling
- [ ] Configure health probes
- [ ] Configure ingress
- [ ] Configure observability
- [ ] Configure rolling deployment

---

# 9. Milestone 8 — Multi-Tenant & Marketplace

## 9.1 Multi-Tenant

- [ ] Define Tenant domain
- [ ] Define tenant isolation strategy
- [ ] Add tenant context
- [ ] Add tenant-aware authorization
- [ ] Add tenant-aware data access
- [ ] Add tenant-level configuration
- [ ] Add tenant tests

## 9.2 Marketplace

- [ ] Define Seller domain
- [ ] Define Seller onboarding
- [ ] Define Seller profile
- [ ] Define Seller product ownership
- [ ] Define Seller order ownership
- [ ] Define commission model
- [ ] Define seller settlement
- [ ] Add Seller APIs
- [ ] Add Seller tests

---

# 10. Milestone 9 — International Commerce

- [ ] Multi-currency
- [ ] Currency conversion abstraction
- [ ] Multi-language
- [ ] Localization
- [ ] Tax abstraction
- [ ] Regional pricing
- [ ] Regional payment providers
- [ ] Regional shipping providers
- [ ] International address model
- [ ] Compliance foundation

---

# 11. Cross-Cutting Definition of Done

Một task chỉ được đánh dấu `[x]` khi:

- [ ] Code tuân thủ Clean Architecture
- [ ] Domain không phụ thuộc framework
- [ ] Không có cross-module database access
- [ ] Không chia sẻ Entity giữa các module
- [ ] Business logic nằm trong Domain/Application
- [ ] Dependency được inject
- [ ] Repository sử dụng interface
- [ ] Business errors sử dụng Result Pattern
- [ ] API có OpenAPI/Swagger documentation
- [ ] Có Unit Test phù hợp
- [ ] Có Integration Test phù hợp
- [ ] Có Event nếu thay đổi cần thông báo cho module khác
- [ ] Outbox được sử dụng khi cần Integration Event
- [ ] Logging/observability được bổ sung khi cần
- [ ] Security requirements được kiểm tra
- [ ] Không phá vỡ module boundaries

---

# 12. Architecture Review Checklist

Trước mỗi Pull Request, kiểm tra:

1. [ ] Feature thuộc Domain nào?
2. [ ] Aggregate Root là gì?
3. [ ] Business rule nằm ở đâu?
4. [ ] Có cần Domain Event không?
5. [ ] Có cần Outbox không?
6. [ ] Có cần CQRS không?
7. [ ] Có cần Cache không?
8. [ ] Có cần Search Index không?
9. [ ] Có cần AI không?
10. [ ] Có phá vỡ Clean Architecture không?
11. [ ] Có tạo dependency giữa các module không?
12. [ ] Có thể tách module thành Microservice sau này không?

---

# 13. Current Sprint — Sprint 0

**Objective:** Architecture & Project Foundation

**Status:** 🚧 ~90% documentation — pending review, sign-off, and remaining code alignment

### Completed

- [x] Vision (`docs/Project Context.md`)
- [x] Architecture (`docs/NovaCommerce Architecture.md`)
- [x] ADR (4 records in `docs/architecture/adrs/`)
- [x] Technical Context (`docs/techContext.md`)
- [x] Brand Guidelines + Design Tokens
- [x] Cursor / Agent Rules + Documentation First protocol
- [x] Documentation index (`docs/README.md`)
- [x] Monorepo Scaffold (`apps/`, `packages/`, `workers/`, `ai-services/`)
- [x] Docker Compose + Dockerfiles + `docs/docker.md`
- [x] `.env.example`
- [x] Foundation design docs written (see Current Tasks)
- [x] Root `README.md` (setup guide, architecture, docs links)
- [x] `modules/` folder structure (16 bounded contexts per repository-structure doc)
- [x] `@novacommerce/building-blocks` (DDD/Clean Architecture abstractions)
- [x] Development standards (`docs/coding-standards.md`, `docs/contributing.md`)
- [x] PR template (`.github/PULL_REQUEST_TEMPLATE.md` — NovaCommerce-specific)
- [x] Sync `docs/progress.md` with repo reality

### Current Tasks

- [~] Review & sign-off `docs/domain-model.md`
- [~] Review & sign-off `docs/database-design.md` + ERD
- [~] Review & sign-off `docs/event-catalog.md`
- [~] Review & sign-off `docs/api-guidelines.md`
- [~] Review & sign-off `docs/reponsitory-structure.md` (fix filename typo optional)
- [x] Prisma schema sync with `database-design.md` (audited 2026-09-09 — PostgreSQL ↔ Prisma empty diff)
- [ ] Implement In-Memory Event Bus (building-blocks interface exists)

### Exit Criteria

Sprint 0 hoàn thành khi:

- [~] Domain Model documented (draft exists — **needs approval**)
- [x] Database Design documented and synced with Prisma/PostgreSQL (v1.0.0)
- [~] Event Catalog documented (draft exists — **needs approval**)
- [~] API Guidelines documented (draft exists — **needs Gateway implementation**)
- [~] Repository Structure documented (draft exists — **`modules/` scaffold aligned**)
- [x] Root README có hướng dẫn setup
- [~] Monorepo có thể chạy local (scaffold builds; full stack via Docker)
- [x] Docker environment hoạt động

---

# 14. Next Sprint — Core Commerce

Sau khi Sprint 0 hoàn tất:

1. [ ] Identity
2. [ ] User
3. [ ] Catalog
4. [ ] Inventory
5. [ ] Cart
6. [ ] Checkout
7. [ ] Order
8. [ ] End-to-End Checkout Flow

**Target flow:**

```text
Customer
   ↓
Identity
   ↓
Catalog
   ↓
Cart
   ↓
Checkout
   ↓
Order
   ↓
OrderCreated
   ↓
Inventory
   ↓
StockReserved
   ↓
Outbox
   ↓
Event Bus
```

---

# 15. Project Success Criteria

NovaCommerce được xem là đạt mục tiêu kiến trúc khi:

- [ ] Các module có bounded context rõ ràng
- [ ] Domain độc lập framework
- [ ] Module không truy cập trực tiếp database của module khác
- [ ] Event-driven communication hoạt động
- [ ] Outbox hoạt động đáng tin cậy
- [ ] Có thể thay In-Memory Event Bus bằng Kafka
- [ ] AI Services chạy độc lập bằng Python
- [ ] API được version và document bằng OpenAPI
- [ ] Test coverage đạt tối thiểu 80%
- [ ] Có structured logging
- [ ] Có distributed tracing
- [ ] Có metrics và monitoring
- [ ] Hệ thống stateless và sẵn sàng scale ngang
- [ ] Có thể extract module thành Microservice mà không thay đổi Domain Model

---

# 16. Long-Term Roadmap

```text
Foundation
    ↓
Core Commerce
    ↓
Commerce Extensions
    ↓
Search + Analytics + AI
    ↓
Kafka
    ↓
Microservices
    ↓
Kubernetes
    ↓
Multi-Tenant
    ↓
Marketplace
    ↓
International Commerce
```

> **Build once as a Modular Monolith, scale forever with Event-Driven Microservices and AI.**
