# progress.md

# NovaCommerce Development Progress

Project Version

0.1.0

Status

🟡 Foundation Phase (Bootstrap Scaffold)

Last Updated

2026-09-09

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
| Coding Standards     | 🚧 Partial    |      30% | Rules in `.cursor/rules/` — chưa có `docs/coding-standards.md` |
| Development Workflow | 🚧 Partial    |      20% | `.github/PULL_REQUEST_TEMPLATE.md` — chưa có workflow doc |
| Monorepo Scaffold    | 🚧 In Progress |      40% | pnpm workspace, apps, packages, workers, ai-services |
| Domain Modeling      | ⏳ Pending    |       0% | Chưa có `docs/domain-model.md` |
| Database Design      | 🚧 Partial    |      10% | Prisma outbox table only — chưa có ERD doc |
| API Design           | ⏳ Pending    |       0% | Chưa có `docs/api-guidelines.md` |
| Backend              | 🚧 In Progress |       5% | Gateway health endpoint, outbox worker stub |
| Frontend             | 🚧 In Progress |       5% | Next.js web/admin placeholder pages |
| AI Platform          | 🚧 In Progress |       5% | FastAPI health endpoint stub |
| Testing              | ⏳ Pending    |       0% | Chưa có test suite |
| Deployment           | 🚧 Partial    |      40% | Docker Compose + `docs/docker.md` — chưa có CI/CD |

---

# Documentation Progress

## Completed

- [x] `Project Context.md`
- [x] `NovaCommerce Architecture.md`
- [x] `techContext.md`
- [x] `progress.md`
- [x] `docker.md`
- [x] `brand-guidelines.md`
- [x] ADR-001 Modular Monolith
- [x] ADR-002 Event Bus + Outbox
- [x] ADR-003 Prisma + PostgreSQL
- [x] ADR-004 Python AI Services
- [x] Agent rules (`.cursor/rules/novacommerce.mdc`)
- [x] Agent instructions (`.cursor/cursorcustominstructions.md`)
- [x] Design tokens (`assets/design-tokens.json`, `assets/design-tokens.css`)

## Partial (exists outside `docs/` or incomplete)

- [~] Coding standards → `.cursor/rules/novacommerce.mdc` (chưa tách sang `docs/`)
- [~] PR workflow → `.github/PULL_REQUEST_TEMPLATE.md` (chưa có `contributing.md`)

## Planned

- [ ] `domain-model.md`
- [ ] `event-catalog.md`
- [ ] `api-guidelines.md`
- [ ] `database-design.md`
- [ ] `coding-standards.md`
- [ ] `testing-strategy.md`
- [ ] `security.md`
- [ ] `deployment.md`
- [ ] `monitoring.md`
- [ ] `repository-structure.md`
- [ ] `local-development.md`
- [ ] `docs/README.md` (index điều hướng)
- [ ] Root `README.md` (hiện chỉ placeholder)

## Removed / Not applicable

- ~~`clinerules.md`~~ — không tồn tại, đã thay bằng `.cursor/rules/`
- ~~`.clinecustominstructions`~~ — không tồn tại, đã thay bằng `.cursor/cursorcustominstructions.md`
- ~~`architecture.md`~~ — tên thực tế là `NovaCommerce Architecture.md`

---

# Repository Scaffold

| Item | Status | Location |
| ---- | ------ | -------- |
| pnpm monorepo | ✅ | `package.json`, `pnpm-workspace.yaml` |
| API Gateway (NestJS) | 🚧 | `apps/gateway` — health endpoint only |
| Web Store (Next.js) | 🚧 | `apps/web` — placeholder page |
| Admin (Next.js) | 🚧 | `apps/admin` — placeholder page |
| Database package (Prisma) | 🚧 | `packages/database` — OutboxMessage only |
| Outbox worker | 🚧 | `workers/outbox-publisher` — stub |
| AI service (FastAPI) | 🚧 | `ai-services/api` — health endpoint only |
| Docker Compose | ✅ | `docker-compose.yml`, `docker-compose.dev.yml` |
| Dockerfiles | ✅ | Root + per-service Dockerfiles |
| GitHub Actions CI | ⏳ | Chưa có workflows |
| Domain modules | ⏳ | Chưa có `modules/` business logic |

---

# Architecture Status

> Trạng thái **thiết kế** (documented & accepted), chưa phải implementation.

| Component              | Design | Implementation |
| ---------------------- | ------ | -------------- |
| Modular Monolith       | ✅     | 🚧 Scaffold    |
| Clean Architecture     | ✅     | ⏳             |
| DDD                    | ✅     | ⏳             |
| Event Driven           | ✅     | 🚧 Outbox stub |
| Outbox Pattern         | ✅     | 🚧 Table only  |
| CQRS Strategy          | ✅     | ⏳             |
| AI Architecture        | ✅     | 🚧 Health stub |
| Future Kafka Migration | ✅     | ⏳             |

---

# Modules

| Module       | Design | Implementation |
| ------------ | ------ | -------------- |
| Identity     | ⏳     | ⏳             |
| User         | ⏳     | ⏳             |
| Catalog      | ⏳     | ⏳             |
| Cart         | ⏳     | ⏳             |
| Checkout     | ⏳     | ⏳             |
| Order        | ⏳     | ⏳             |
| Inventory    | ⏳     | ⏳             |
| Payment      | ⏳     | ⏳             |
| Shipping     | ⏳     | ⏳             |
| Promotion    | ⏳     | ⏳             |
| Review       | ⏳     | ⏳             |
| Search       | ⏳     | ⏳             |
| CMS          | ⏳     | ⏳             |
| Analytics    | ⏳     | ⏳             |
| Notification | ⏳     | ⏳             |
| Seller       | ⏳     | ⏳             |
| AI           | ⏳     | 🚧 Stub        |

Legend

- ⏳ Not Started
- 🚧 In Progress
- ✅ Completed
- ❌ Blocked

---

# Infrastructure

| Item           | Docker Config | App Integration |
| -------------- | ------------- | --------------- |
| PostgreSQL     | ✅            | 🚧 Outbox only  |
| Redis          | ✅            | ⏳              |
| OpenSearch     | ✅            | ⏳              |
| MinIO          | ✅            | ⏳              |
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

Status

🚧

Deliverables

- [x] Project Vision
- [x] Architecture
- [x] ADR
- [x] Technical Context
- [x] Brand Guidelines
- [x] Monorepo Scaffold
- [x] Docker Environment
- [x] Agent / Cursor Rules
- [ ] Domain Model
- [ ] Database Design (ERD doc)
- [ ] Event Catalog
- [ ] API Standards
- [ ] Repository Structure doc

---

## Milestone 2 — Core Commerce

Status

⏳

Modules

- Identity
- Catalog
- Inventory
- Cart
- Checkout
- Order

---

## Milestone 3 — Commerce Extensions

Status

⏳

Modules

- Payment
- Shipping
- Promotion
- Notification
- Review

---

## Milestone 4 — Intelligence

Status

⏳

Modules

- Search
- Analytics
- AI Platform

---

## Milestone 5 — Scale

Status

⏳

Objectives

- Kafka
- Microservices
- Kubernetes
- Horizontal Scaling

---

# Current Sprint

Sprint 0

Objective

Architecture & Project Foundation

Tasks

- [x] Vision
- [x] Architecture
- [x] ADR
- [x] Technical Context
- [x] Brand Guidelines + Design Tokens
- [x] Cursor / Agent Rules
- [x] Monorepo Scaffold (`apps/`, `packages/`, `workers/`, `ai-services/`)
- [x] Docker Compose + Dockerfiles
- [ ] Domain Model
- [ ] ER Diagram + `database-design.md`
- [ ] Event Catalog
- [ ] API Standards
- [ ] `repository-structure.md`
- [ ] Root `README.md`

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

1. Hoàn thành `domain-model.md`.
2. Thiết kế `database-design.md` và ERD (đồng bộ với Prisma schema).
3. Xây dựng `event-catalog.md`.
4. Chuẩn hóa `api-guidelines.md`.
5. Viết `repository-structure.md` mô tả monorepo hiện tại.
6. Mở rộng root `README.md` với hướng dẫn setup nhanh.
