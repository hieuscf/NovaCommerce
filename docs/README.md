# NovaCommerce Documentation

> **Version:** 0.1.0  
> **Last Updated:** 2026-09-09  
> **Status:** Foundation Phase — design docs complete, implementation in progress

Tài liệu chính thức của NovaCommerce. AI agents và developers **phải đọc tài liệu liên quan trước khi viết code**.

---

## Quick Start — Reading Order

Đọc theo thứ tự này khi mới tham gia dự án:

| # | Document | Mục đích |
|---|----------|----------|
| 1 | [Project Context.md](./Project%20Context.md) | Vision, principles, bounded contexts |
| 2 | [NovaCommerce Architecture.md](./NovaCommerce%20Architecture.md) | Kiến trúc tổng thể, layers, modules |
| 3 | [techContext.md](./techContext.md) | Stack, tooling, conventions |
| 4 | [reponsitory-structure.md](./reponsitory-structure.md) | Monorepo layout, folder conventions |
| 5 | [domain-model.md](./domain-model.md) | DDD: aggregates, entities, value objects |
| 6 | [database-design.md](./database-design.md) | Schema, ERD, module DB ownership |
| 7 | [event-catalog.md](./event-catalog.md) | Domain events, payloads, consumers |
| 8 | [api-guidelines.md](./api-guidelines.md) | REST conventions, errors, versioning |
| 9 | [coding-standards.md](./coding-standards.md) | Architecture rules, naming, layer responsibilities |
| 10 | [contributing.md](./contributing.md) | Workflow, branches, commits, PR process |
| 11 | [progress.md](./progress.md) | Trạng thái dự án, sprint, milestones |

---

## Document Catalog

### Vision & Architecture

| Document | Description |
|----------|-------------|
| [Project Context.md](./Project%20Context.md) | Vision, core principles, technology stack, module list |
| [NovaCommerce Architecture.md](./NovaCommerce%20Architecture.md) | Clean Architecture, DDD, event-driven design, AI architecture |
| [techContext.md](./techContext.md) | NestJS, Next.js, Prisma, Python AI, dev environment |
| [progress.md](./progress.md) | Development progress tracker |

### Domain & Data Design

| Document | Description |
|----------|-------------|
| [domain-model.md](./domain-model.md) | 17 bounded contexts, aggregates, domain events, context map |
| [database-design.md](./database-design.md) | PostgreSQL schema, ERD, indexes, outbox, module ownership |
| [event-catalog.md](./event-catalog.md) | Event naming, payload schemas, publisher/consumer matrix |

### API & Repository

| Document | Description |
|----------|-------------|
| [api-guidelines.md](./api-guidelines.md) | REST API standards, auth, pagination, idempotency, OpenAPI |
| [reponsitory-structure.md](./reponsitory-structure.md) | pnpm monorepo: `apps/`, `modules/`, `packages/`, `workers/` |

### Development Standards

| Document | Description |
|----------|-------------|
| [coding-standards.md](./coding-standards.md) | Clean Architecture, DDD, naming, layers, events, testing targets |
| [contributing.md](./contributing.md) | Contribution flow, branch strategy, commits, verification commands |

### Operations & Brand

| Document | Description |
|----------|-------------|
| [docker.md](./docker.md) | Docker Compose, build, run, troubleshoot |
| [brand-guidelines.md](./brand-guidelines.md) | Colors, typography, voice, design components |

### Architecture Decision Records (ADRs)

| ADR | Decision |
|-----|----------|
| [ADR-001](./architecture/adrs/Adopt%20Modular%20Monolith%20Architecture.md) | Adopt Modular Monolith Architecture |
| [ADR-002](./architecture/adrs/Use%20In-Memory%20Event%20Bus%20with%20Outbox%20Pattern.md) | In-Memory Event Bus + Outbox Pattern |
| [ADR-003](./architecture/adrs/Use%20Prisma%20ORM%20with%20PostgreSQL.md) | Prisma ORM + PostgreSQL |
| [ADR-004](./architecture/adrs/Separate%20AI%20Services%20into%20Python%20Microservices.md) | Python AI Microservices |

---

## Task-Based Reading Guide

> Dùng bảng này để xác định tài liệu **bắt buộc** trước khi code.

| Task | Required Docs | Optional |
|------|---------------|----------|
| **Any code change** | `Project Context.md`, `NovaCommerce Architecture.md`, `reponsitory-structure.md`, `coding-standards.md` | `progress.md`, `contributing.md` |
| **New module / bounded context** | + `domain-model.md`, `database-design.md`, `event-catalog.md` | ADR-001 |
| **Domain logic (aggregate, VO, event)** | + `domain-model.md`, `event-catalog.md` | `database-design.md` |
| **Database / Prisma / migration** | + `domain-model.md`, `database-design.md` | ADR-003 |
| **REST API / controller / DTO** | + `api-guidelines.md`, `domain-model.md` | `event-catalog.md` |
| **Domain event / outbox / worker** | + `event-catalog.md`, `database-design.md` | ADR-002 |
| **Frontend UI (web/admin)** | + `api-guidelines.md`, `brand-guidelines.md` | `assets/design-tokens.css` |
| **AI service (Python)** | + `NovaCommerce Architecture.md` § AI, `api-guidelines.md` | ADR-004 |
| **Docker / infra / deploy** | + `docker.md`, `techContext.md` | `reponsitory-structure.md` |
| **Cross-module integration** | + `domain-model.md`, `event-catalog.md`, `NovaCommerce Architecture.md` | ADR-002 |

---

## Related Resources (outside `docs/`)

| Resource | Location | Purpose |
|----------|----------|---------|
| Coding standards | `docs/coding-standards.md` | Official architecture & code rules |
| Contributing guide | `docs/contributing.md` | Workflow, branches, commits, PRs |
| Cursor rules | `.cursor/rules/novacommerce.mdc` | AI agent enforcement (synced with coding-standards) |
| Doc-first protocol | `.cursor/rules/cursor.md` | Mandatory doc reading before code |
| Agent instructions | `.cursor/cursorcustominstructions.md` | Agent workflow overview |
| Design tokens | `assets/design-tokens.json`, `assets/design-tokens.css` | Brand colors, spacing, typography |
| PR template | `.github/PULL_REQUEST_TEMPLATE.md` | Pull request checklist |

---

## Planned Documentation

Chưa có — sẽ bổ sung trong các sprint tiếp theo:

- `testing-strategy.md`
- `security.md`
- `deployment.md`
- `monitoring.md`
- `local-development.md`

---

## Conventions

- **Domain design** lives in `domain-model.md` — not in database schema alone.
- **Events** must match `event-catalog.md` — do not invent event names ad hoc.
- **APIs** must follow `api-guidelines.md` — versioning, errors, pagination.
- **Folder layout** must follow `reponsitory-structure.md` — no custom module structures.
- Khi docs và code mâu thuẫn, **ưu tiên docs** và báo cáo inconsistency trước khi tự ý sửa docs.
