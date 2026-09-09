# NovaCommerce Coding Standards

> **Version:** 1.0  
> **Last Updated:** 2026-09-09  
> **Status:** Official — Foundation Phase  
> **Related:** [contributing.md](./contributing.md), [NovaCommerce Architecture.md](./NovaCommerce%20Architecture.md), `.cursor/rules/novacommerce.mdc`

---

## 1. Purpose

This document defines the official coding standards for NovaCommerce. It applies to all code in:

```text
apps/
modules/
packages/
workers/
ai-services/
```

These standards protect Clean Architecture, bounded context isolation, and long-term maintainability. AI agents must also follow `.cursor/rules/novacommerce.mdc`, which enforces these rules during code generation.

**Source of truth hierarchy:**

```text
docs/coding-standards.md     ← developer-facing documentation
        ↑
.cursor/rules/novacommerce.mdc   ← AI agent enforcement
```

If rules conflict, align code and agent rules to this document — then report the inconsistency.

---

## 2. General Principles

All code must follow:

| Principle | Requirement |
|-----------|-------------|
| Clean Architecture | Dependency direction: Presentation → Application → Domain; Infrastructure implements interfaces |
| DDD | One bounded context per module; aggregates enforce invariants |
| SOLID | Single responsibility, interface segregation, dependency inversion |
| Dependency Injection | Business logic receives dependencies; does not construct infrastructure with `new` |
| Repository Pattern | Domain/Application depend on interfaces, not Prisma |
| Specification Pattern | Composable domain rules where appropriate |
| Event-Driven Architecture | Modules communicate via events and contracts |
| API First | Public APIs documented with OpenAPI/Swagger |
| Security First | Validate input, enforce auth, never expose secrets |
| AI First | AI workloads in Python services — not embedded in domain modules |

**Domain must be framework-independent.** No NestJS, Prisma, Redis, Kafka, or HTTP client code in Domain.

---

## 3. Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Class | PascalCase | `CreateOrderHandler` |
| Interface | `I` + PascalCase | `IProductRepository` |
| Variable | camelCase | `productId` |
| Function / method | camelCase | `createProduct()` |
| File | kebab-case | `create-product.command.ts` |
| Directory | lowercase | `repositories/` |
| Constant | UPPER_SNAKE_CASE when truly constant | `MAX_RETRY_COUNT` |
| Domain Event (class) | PascalCase, past tense | `OrderCreatedEvent` |
| Command | Imperative PascalCase | `CreateProductCommand` |
| Query | Descriptive PascalCase | `GetProductByIdQuery` |

Module folders use lowercase single-word names: `catalog`, `inventory`, `order`.

---

## 4. TypeScript Standards

- **Strict TypeScript** — `strict: true` in `tsconfig.base.json`; do not weaken compiler options.
- **No `any`** — use `unknown`, generics, or discriminated unions. If `any` is unavoidable, document why.
- **No ESLint bypass** — do not disable lint rules to merge broken code.
- **Avoid type assertions** — prefer type guards and proper modeling.
- **Explicit public API types** — exported functions, handlers, and contracts must have clear signatures.
- **Immutability** — prefer readonly properties and frozen value objects where appropriate.
- **Avoid unnecessary `static`** — prefer instance methods and dependency injection.

---

## 5. Architecture Rules

### Dependency Direction

```text
Presentation
      ↓
Application
      ↓
Domain

Infrastructure implements Domain/Application interfaces
```

### Domain Independence

Domain must **not** depend on:

```text
NestJS
Prisma
Redis
Kafka
HTTP frameworks
External service SDKs
```

Infrastructure may depend on frameworks, databases, and third-party SDKs.

---

## 6. Module Isolation

Each folder under `modules/` is an independent bounded context.

**Forbidden:**

```text
Order → InventoryRepository          ❌
Catalog → OrderEntity                ❌
Payment → direct query on order DB   ❌
```

**Required communication:**

```text
Application Service
Domain Event
Integration Event
Public Contract
```

Modules do not share entities. Each module owns its domain model and database tables.

---

## 7. Domain Rules

Domain layer may contain:

```text
Entity
Aggregate Root
Value Object
Domain Service
Domain Event
Repository Interface
Specification
```

Domain layer must **not** contain:

```text
SQL / Prisma queries
HTTP calls
NestJS decorators (@Injectable in domain is discouraged — keep domain pure)
Redis / Kafka implementations
External API calls
DTO mapping for HTTP
```

One Aggregate Root per aggregate. Invariants requiring strong consistency stay inside the aggregate.

---

## 8. Application Rules

Application layer contains:

```text
Use Case (Command / Query Handler)
Command / Query objects
Transaction orchestration
Application DTOs
Outbox coordination
```

Application layer must **not** contain:

- Raw SQL or Prisma calls (delegate to Infrastructure repositories)
- HTTP request/response handling
- Business invariants (those belong in Domain)

**CQRS** applies only where read scalability is required — Search, Analytics, Dashboard, Reporting. Do not apply CQRS to simple CRUD across the entire platform.

---

## 9. Infrastructure Rules

Infrastructure implements:

```text
Prisma repositories
Redis caching
OpenSearch indexing
MinIO storage
Kafka producers (future)
Email / SMS providers
Payment / shipping provider adapters
```

Infrastructure must **not** implement business rules. It maps between persistence/external formats and domain objects.

Prisma exists **only** inside `infrastructure/` (or `packages/database` for shared DB infrastructure). Never inject `PrismaClient` into Controllers or Domain.

---

## 10. Error Handling

Use the **Result pattern** from `@novacommerce/building-blocks` for expected business failures:

```typescript
import { Result } from '@novacommerce/building-blocks';

// Success
return Result.ok(value);

// Business failure
return Result.fail(new DomainError('Product not found', 'PRODUCT_NOT_FOUND'));
```

- **Business / validation errors** → `Result.fail()` — not exceptions
- **Unexpected technical failures** → throw appropriate exceptions; catch at presentation/infrastructure boundaries
- **Never expose** internal stack traces or infrastructure details in API responses

---

## 11. Dependency Injection

Business logic must not construct infrastructure dependencies directly.

```text
CreateProductHandler
        ↓
IProductRepository          (injected)
        ↓
PrismaProductRepository     (Infrastructure)
```

Use NestJS DI in Presentation/Application wiring. Domain remains free of framework attributes where possible.

---

## 12. Repository Pattern

Application and Domain depend on abstractions:

```typescript
export interface IProductRepository {
  findById(id: ProductId): Promise<Product | null>;
  save(product: Product): Promise<void>;
}
```

Implementations live in `infrastructure/repositories/`. Never reference `PrismaClient` from Application or Domain.

---

## 13. Event Standards

### Domain Event (internal)

Used inside the Modular Monolith. PascalCase, past tense:

```text
OrderCreated
PaymentSucceeded
StockReserved
CouponApplied
```

### Integration Event (external boundary / future Kafka)

Lowercase dot notation:

```text
order.created
inventory.stock_reserved
payment.completed
notification.sent
```

Event names and payloads must match [event-catalog.md](./event-catalog.md).

### Outbox Flow

**Never publish events directly inside a business transaction.**

```text
Business Transaction
      ↓
Save Aggregate
      ↓
Save Outbox Message
      ↓
Commit
      ↓
Outbox Worker
      ↓
Event Bus / Kafka (future)
```

See ADR-002 and [event-catalog.md](./event-catalog.md).

---

## 14. API / Presentation Rules

Controllers are thin. They handle:

```text
HTTP request parsing
Input validation
Authentication / authorization checks
DTO ↔ Application mapping
Use case invocation
HTTP response formatting
```

Controllers must **not** contain business logic.

All new APIs must follow [api-guidelines.md](./api-guidelines.md):

- Versioned routes (`/api/v1/...`)
- Standard error format
- Pagination where applicable
- Swagger / OpenAPI documentation

---

## 15. Logging

Production code uses **structured logging** via `ILogger` from `@novacommerce/building-blocks` (implementation provided in Infrastructure).

Include context where available:

```text
RequestId
CorrelationId
UserId
Module
Action
Duration
ErrorCode
```

**Do not use `console.log()`** in production application code.

---

## 16. Security

Follow project security requirements:

```text
JWT access tokens
Refresh tokens
RBAC / ABAC
Rate limiting
Audit logging
Encryption at rest / in transit
Secrets via environment variables — never in source
HTTPS in production
Helmet / CORS configuration
Input validation on all public endpoints
```

Never commit `.env`, credentials, API keys, or tokens. Use `.env.example` for documentation only.

---

## 17. Testing Standards

### Target (not yet fully implemented)

| Type | Scope |
|------|-------|
| Unit Test | Domain logic, handlers, specifications |
| Integration Test | Repositories, API endpoints, outbox flow |
| Contract Test | Public contracts between modules |
| E2E Test | Critical user flows (checkout, auth) |
| Performance Test | Search, high-traffic endpoints |

**Coverage target:** ≥ 80% overall; critical domain logic near 100%.

> **Current status:** No root test runner or CI test pipeline exists yet. These are requirements for new features — see [contributing.md](./contributing.md) for verification steps available today.

Every new public API and domain feature must include unit and integration tests once test infrastructure is in place.

---

## 18. Code Review Quality

Code submitted for review must be:

- **Readable** — clear naming, small functions, minimal nesting
- **Testable** — dependencies injectable, domain logic isolated
- **Cohesive** — one reason to change per class/module
- **Low coupling** — no cross-module internal imports
- **DRY at the domain level** — no duplicated business rules across modules
- **Appropriately abstracted** — no unnecessary layers or premature generalization

Reviewers reject changes that violate module boundaries, skip documentation updates, or introduce framework dependencies into Domain.

---

## 19. Shared Packages

### `@novacommerce/building-blocks`

Allowed: Result, DomainError, BaseEntity, AggregateRoot, ValueObject, DomainEvent, IEventBus, IOutboxStore, Specification, pagination types, validation types, ILogger, ICache.

**Forbidden:** Catalog, Order, Payment, or any module-specific business logic.

### `@novacommerce/database`

Prisma schema and client. Modules must not use this package to query another module's tables.

---

## 20. AI Services (Python)

AI code lives in `ai-services/`. Business modules call AI via REST/gRPC — never embed LLM calls in NestJS domain or application layers.

Python services follow FastAPI conventions and project API guidelines for external contracts.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [contributing.md](./contributing.md) | Workflow, branches, commits, PR process |
| [api-guidelines.md](./api-guidelines.md) | REST API standards |
| [domain-model.md](./domain-model.md) | Aggregates and bounded contexts |
| [event-catalog.md](./event-catalog.md) | Event names and payloads |
| [reponsitory-structure.md](./reponsitory-structure.md) | Monorepo layout |
| `.cursor/rules/novacommerce.mdc` | AI agent enforcement rules |
