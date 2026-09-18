# progress.md

# NovaCommerce Development Progress

Project Version

0.1.0

Status

🟡 Foundation Phase (Bootstrap Scaffold)

Last Updated

2026-09-17

---

# Overall Progress

| Area                 | Status        | Progress | Notes |
| -------------------- | ------------- | -------: | ----- |
| Vision               | ✅ Complete   |     100% | `docs/Project Context.md` |
| Architecture         | ✅ Complete   |     100% | `docs/NovaCommerce Architecture.md` |
| Technical Context    | ✅ Complete   |     100% | `docs/techContext.md` |
| ADR                  | ✅ Complete   |     100% | 4 ADRs in `docs/architecture/adrs/` |
| Brand Guidelines     | ✅ Complete   |     100% | `docs/brand-guidelines.md` + `assets/design-tokens.*` |
| Agent / Cursor Setup | ✅ Complete   |     100% | `.cursor/rules/novacommerce.mdc`, skills |
| Coding Standards     | ✅ Complete   |     100% | `docs/coding-standards.md`, `.cursor/rules/novacommerce.mdc` |
| Development Workflow | ✅ Complete   |     100% | `docs/contributing.md` (branch, commit, verification) |
| Pull Request Process | ✅ Complete   |     100% | `.github/PULL_REQUEST_TEMPLATE.md` (NovaCommerce-specific) |
| Monorepo Scaffold    | 🚧 In Progress |      65% | apps, packages, workers, ai-services, `modules/` + domain code |
| Domain Modeling      | ✅ Complete   |     100% | `docs/domain-model.md` v0.2.0 — audited, reconciliation documented |
| Domain Implementation | 🚧 In Progress |      75% | Search query API reads OpenSearch; analytics/seller still deferred |
| Database Design      | ✅ Complete   |     100% | `docs/database-design.md` v1.0.0 — synced with Prisma + PostgreSQL (46 tables) |
| API Design           | ✅ Complete   |     100% | `docs/api-guidelines.md` synchronized with Gateway infrastructure |
| Backend              | 🚧 In Progress |      65% | Gateway `/api/v1` + Core Commerce Flow (Identity → Order → Inventory events) |
| Frontend             | 🚧 In Progress |      90% | Architecture foundation + `@novacommerce/frontend` client; homepage + Alloy `/login` `/register` `/account` dashboard + `/shop` and `/shop/[category]` listing via Search API + Alloy `/products/[slug]` PDP + `/cart` + `/checkout` + `/orders` list/detail/confirmation; header search → `/shop?q=`; session restore + global 401/403; Alloy admin dashboard shell |
| AI Platform          | 🚧 In Progress |       5% | FastAPI health endpoint stub |
| Testing              | 🚧 In Progress |      40% | Backend Vitest + web/admin frontend tests + Playwright smoke foundation; no CI yet |
| Deployment           | 🚧 Partial    |      50% | Docker Compose + app-level health/readiness + typed env validation |

---

# Documentation Progress

## Completed

- [x] `Project Context.md`
- [x] `NovaCommerce Architecture.md`
- [x] `techContext.md`
- [x] `progress.md`
- [x] `docker.md`
- [x] `brand-guidelines.md`
- [x] `domain-model.md` (v0.2.0 — Reviewed for Implementation)
- [x] `database-design.md` (v1.0.0 — synchronized with Prisma schema and PostgreSQL)
- [x] `event-catalog.md` (draft — pending review)
- [x] `api-guidelines.md` (draft — pending Gateway implementation)
- [x] `reponsitory-structure.md` (draft — filename typo)
- [x] `coding-standards.md`
- [x] `contributing.md`
- [x] `docs/README.md` (documentation index)
- [x] Root `README.md`
- [x] ADR-001 Modular Monolith
- [x] ADR-002 Event Bus + Outbox
- [x] ADR-003 Prisma + PostgreSQL
- [x] ADR-004 Python AI Services
- [x] Agent rules (`.cursor/rules/novacommerce.mdc`)
- [x] Agent instructions (`.cursor/cursorcustominstructions.md`)
- [x] PR template (`.github/PULL_REQUEST_TEMPLATE.md`)
- [x] Design tokens (`assets/design-tokens.json`, `assets/design-tokens.css`)
- [x] `design-system.md` (Web UI v1 — tokens, components, Three.js strategy)
- [x] `frontend-auth.md` (Web auth UI — routes, API boundary, session strategy)
- [x] `frontend-architecture.md` (Web/Admin foundation)
- [x] ADR-005 Frontend Architecture Foundation

## Planned

- [ ] `testing-strategy.md`
- [x] `security.md` (Identity foundation)
- [ ] `deployment.md`
- [ ] `monitoring.md`
- [ ] `local-development.md`

## Removed / Not applicable

- ~~`clinerules.md`~~ — replaced by `.cursor/rules/`
- ~~`.clinecustominstructions`~~ — replaced by `.cursor/cursorcustominstructions.md`
- ~~`architecture.md`~~ — actual name: `NovaCommerce Architecture.md`

---

# Repository Scaffold

| Item | Status | Location |
| ---- | ------ | -------- |
| pnpm monorepo | ✅ | `package.json`, `pnpm-workspace.yaml` |
| API Gateway (NestJS) | ✅ | `apps/gateway` — `/health`, `/ready`, `/api/v1`, OpenAPI |
| Web Store (Next.js) | 🚧 | `apps/web` — homepage (Gateway categories + featured products via `catalogClient`; hero/promo static), Alloy `/login` `/register` `/account` dashboard (User Gateway profile/addresses/preferences + editable forms), `/shop` and `/shop/[category]` listing (Gateway published products + client filters/sort/pagination; empty/skeleton/error), `/products/[slug]` Alloy PDP (gallery, buy box, seller aside, details tabs, related rail on mock catalog; loading/not-found/error), `/cart` (Gateway `GET /users/me/cart` via `cartClient` + catalog join; qty/remove persist; empty/skeleton/error), `/checkout` (Gateway cart + User address prefill; Place order via `checkoutClient` start/complete; Alloy payment tiles mapped to `paymentProvider`; empty/skeleton/error; navigates to `/orders/confirmed`), `/orders` list (Gateway `GET /users/me/orders` via `orderClient`; detail/confirmation still on mock orders; loading/error/not-found), `/seller` Alloy onboarding + registered seller dashboard/products/orders preview (`?demo=registered`; no Seller API), customer auth UI, default client → Gateway Identity, error boundaries, Vitest |
| Admin (Next.js) | 🚧 | `apps/admin` — Alloy dashboard + Product/Order/Account/Seller Management + Seller Approval fixtures, dark sidebar + topbar, isolated session/API client, error boundaries, Vitest |
| UI Design System | 🚧 | `packages/ui` — tokens, shadcn primitives, EmptyState, ErrorState |
| Frontend kit | ✅ | `packages/frontend` — HTTP, errors, env, request IDs |
| Building blocks | ✅ | `packages/building-blocks` — DDD abstractions + Event System contracts |
| Database package (Prisma) | ✅ | `packages/database` — 46 business models + OutboxMessage; migration `20250907000000_init` |
| Domain modules | 🚧 | `modules/` — domain layer in 13/16 contexts (154 TS files) |
| Domain build | ✅ | `pnpm build:modules` |
| Outbox worker | ✅ | `workers/outbox-publisher` — polls outbox, publishes via `InMemoryEventBus` |
| AI service (FastAPI) | 🚧 | `ai-services/api` — health endpoint only |
| Docker Compose | ✅ | `docker-compose.yml`, `docker-compose.dev.yml` |
| Dockerfiles | ✅ | Root + per-service Dockerfiles |
| GitHub Actions CI | ⏳ | No `.github/workflows/` |
| Development standards | ✅ | `coding-standards.md`, `contributing.md`, PR template |

---

# Architecture Status

> Design documented and accepted. Implementation in early scaffold phase.

| Component              | Design | Implementation |
| ---------------------- | ------ | -------------- |
| Modular Monolith       | ✅     | 🚧 Scaffold    |
| Clean Architecture     | ✅     | 🚧 domain layer in 13 modules |
| DDD                    | ✅     | 🚧 aggregates/entities/VOs implemented |
| Event Driven           | ✅     | 🚧 domain events in code; Event System foundation complete |
| Outbox Pattern         | ✅     | ✅ Table + Publisher (at-least-once) |
| CQRS Strategy          | ✅     | ⏳             |
| AI Architecture        | ✅     | 🚧 Health stub |
| Future Kafka Migration | ✅     | ⏳             |

---

# Modules

| Module       | Design | Implementation |
| ------------ | ------ | -------------- |
| Identity     | ✅     | ✅ auth, RBAC, audit, tests |
| User         | ✅     | ✅ profile, addresses, preferences, API, tests |
| Catalog      | ✅     | ✅ products, categories, API, events, tests |
| Cart         | ✅     | ✅ cart lifecycle, persistence, Redis cache, API, tests |
| Checkout     | ✅     | ✅ orchestration, API, tests (payment handoff via PaymentInitiationService) |
| Order        | ✅     | ✅ lifecycle, create-from-checkout, query/history/cancel API, outbox, tests |
| Inventory    | ✅     | ✅ stock, reservations, API, events, tests |
| Payment      | ✅     | ✅ intent/confirm/fail/refund, saved cards (token metadata, no CVV), provider abstraction, outbox, API, tests |
| Shipping     | ✅     | ✅ quotes, create, track, dispatch, provider abstraction, outbox, API, tests |
| Promotion    | ✅     | ✅ validation, discount calculation, usage limits, outbox, API, tests |
| Review       | ✅     | ✅ product reviews, rating, moderation, images, API, outbox, tests |
| ReturnRefund | ✅     | ✅ return requests, refund flow, Order/Payment integration, outbox, API, tests |
| CMS          | ✅     | 🚧 domain only |
| Notification | ✅     | ✅ event handlers, templates, email/push channels, worker, retry, tests |
| Search       | ✅     | ✅ indexer + keyword Search API (filters/sort/pagination/cache) over OpenSearch |
| Analytics    | ✅     | ⏳ read-side deferred |
| Seller       | ✅     | ⏳ requirements pending |
| AI           | ✅     | 🚧 Stub        |

Legend: ⏳ Not Started · 🚧 In Progress · ✅ Complete · ❌ Blocked

---

# Infrastructure

| Item           | Docker Config | App Integration |
| -------------- | ------------- | --------------- |
| PostgreSQL     | ✅            | ✅ Prisma + readiness probe |
| Redis          | ✅            | ✅ `RedisCacheService` → `ICache` |
| OpenSearch     | ✅            | ✅ `OpenSearchClientService` → `ISearchClient` |
| MinIO          | ✅            | ✅ `MinioStorageService` → `IObjectStorage` |
| Env validation | —             | ✅ `validateAppConfig` fail-fast |
| App health     | ✅ image HEALTHCHECK | ✅ `/health`, `/health/live`, `/ready`, `/health/ready` |
| Docker         | ✅            | ✅              |
| GitHub Actions | ⏳            | ⏳              |
| Monitoring     | ⏳            | ⏳              |

---

# AI Platform

| Service           | Status |
| ----------------- | ------ |
| Chatbot           | ⏳     |
| Recommendation    | ⏳     |
| Semantic Search   | ⏳     |
| OCR               | ⏳     |
| Review Summary    | ⏳     |
| Content Generator | ⏳     |
| Fraud Detection   | ⏳     |

> AI API stub (`/health`) exists at `ai-services/api`. No business services yet.

---

# Milestones

## Milestone 1 — Foundation

Status: 🚧

Deliverables

- [x] Project Vision
- [x] Architecture
- [x] ADR
- [x] Technical Context
- [x] Brand Guidelines
- [x] Monorepo Scaffold
- [x] Docker Environment
- [x] Agent / Cursor Rules
- [x] Coding Standards (`docs/coding-standards.md`)
- [x] Contributing Guide (`docs/contributing.md`)
- [x] PR Template (NovaCommerce-specific)
- [x] Root README
- [x] `modules/` folder structure (16 bounded contexts)
- [x] `@novacommerce/building-blocks`
- [x] Domain Model (v0.2.0 — audited)
- [x] Domain layer implementation (13 commerce modules)
- [x] Database Design (v1.0.0 — Prisma/PostgreSQL audit complete)
- [x] Event Catalog (P0 payloads + Event System implementation synchronized)
- [~] API Guidelines (draft — pending Gateway implementation)
- [~] Repository Structure doc (draft — filename typo)

---

## Milestone 2 — Core Commerce

Status: ✅ Core Commerce Flow complete (integration E2E verified)

Modules: Identity, Catalog, Inventory, Cart, Checkout (✅), Order (✅)

Core Commerce Flow: register → catalog → cart → checkout → order → `OrderCreated` → inventory reservation → `StockReserved` → outbox → event bus (worker + gateway handlers wired to `order.created`).

---

## Milestone 3 — Commerce Extensions

Status: ✅ Commerce Extensions complete

Modules: Payment (✅), Shipping (✅), Promotion (✅), Notification (✅), Review (✅), ReturnRefund (✅)

---

## Milestone 4 — Intelligence

Status: 🚧 Analytics and AI still open. Search query API is implemented and verified (gateway unit/API tests, typecheck, build). Live OpenSearch query tests run when `INTEGRATION_OPENSEARCH_URL` is set.

Modules: Search (✅ indexer + OpenSearch projection + keyword Search API), Analytics, AI Platform

Search query side:

| Capability | Status | Notes |
| ---------- | ------ | ----- |
| Keyword search | ✅ | `multi_match` + nested category name; `q` optional (`match_all` browse) |
| Filtering | ✅ | Whitelist: `categoryId`, `brandId`, `status`, `minPrice`, `maxPrice` |
| Sorting | ✅ | `relevance`, `price_*`, `name_*`, `createdAt_*` + `id` tie-breaker |
| Pagination | ✅ | `page` / `pageSize` (max 100), response `total` / `totalPages` |
| Search API | ✅ | `GET /api/v1/search/products` (public, OpenAPI) |
| Caching | ✅ | Redis `ICache`, `search:products:{hash}`, TTL via `SEARCH_CACHE_TTL_SECONDS` |
| Tests | ✅ | Unit + API. OpenSearch integration skipped unless `INTEGRATION_OPENSEARCH_URL` |
| PostgreSQL / Catalog | ✅ forbidden | Query path reads OpenSearch documents only |

Known limitations: no availability filter (not on the search document); cache invalidation is TTL-based; offset pagination only; semantic/vector search is out of scope.

---

## Milestone 5 — Scale

Status: ⏳

Objectives: Kafka, Microservices, Kubernetes, Horizontal Scaling

---

# Current Sprint

Sprint 0 — Architecture & Project Foundation

### Completed

- [x] Vision, Architecture, ADR, Technical Context
- [x] Brand Guidelines + Design Tokens
- [x] Cursor / Agent Rules
- [x] Monorepo Scaffold
- [x] Docker Compose + Dockerfiles
- [x] Root README
- [x] `modules/` structure + building-blocks
- [x] Coding standards + contributing guide + PR template
- [x] Domain model audit + domain layer (13 modules)

### In Progress

- [x] API Gateway infrastructure (`/api/v1`, OpenAPI, auth/authz wiring)
- [ ] Application layer (commands/queries/handlers)
- [ ] Infrastructure repositories (Prisma)
- [x] Wire module event handlers to `InMemoryEventBus` (Inventory `OrderCreated` → `order.created`; Notification `order.created`, `payment.completed`, `payment.failed`)

---

# Risks

| Risk                      | Mitigation                               |
| ------------------------- | ---------------------------------------- |
| Scope quá lớn             | Triển khai theo từng milestone           |
| Over-engineering          | Giữ Modular Monolith cho giai đoạn đầu   |
| AI phụ thuộc nhà cung cấp | Trừu tượng hóa qua provider interface    |
| Chuyển sang Microservices | Chuẩn hóa Domain Events và Outbox từ đầu |
| Docs lệch code thực tế    | Cập nhật `progress.md` sau mỗi sprint    |

---

# Success Criteria

- 100% tài liệu kiến trúc hoàn chỉnh.
- Các module độc lập, ít phụ thuộc.
- Có thể thay In-Memory Event Bus bằng Kafka mà không đổi Domain.
- AI Services hoạt động độc lập bằng Python.
- Kiến trúc sẵn sàng mở rộng theo chiều ngang.

---

# Next Immediate Goals

1. Application layer for Core Commerce (Identity, Catalog, Order).
2. Infrastructure repositories (Prisma implementations per module).
3. Wire Application handlers to Event Bus and Outbox.
4. Expand test coverage (domain unit tests, CI pipeline).
