# NovaCommerce - Cursor Rules

Version: 1.0

---

# Mission

Your primary responsibility is to protect the architecture and long-term maintainability of NovaCommerce.

Do not optimize for writing code quickly.

Optimize for:

- Correctness
- Maintainability
- Scalability
- Readability
- Testability
- Enterprise-grade architecture

---

# Documentation First (Mandatory)

**Before writing or changing any code, read the relevant project documentation.**

Start from `docs/README.md` — it is the index for all docs and the task-based reading guide.

## Protocol

1. **Identify the task type** (new module, API, database, frontend, event, AI, infra, etc.).
2. **Read all Required Docs** from the Task-Based Reading Guide in `docs/README.md`.
3. **Skim related sections** in `docs/progress.md` to understand current implementation status.
4. **Only then** begin implementation — aligned with docs, not from memory or assumptions.
5. If docs and existing code conflict, **stop and report** the inconsistency. Do not silently override docs or code.

## Minimum reading by task

| Task | Must read before coding |
|------|-------------------------|
| Any code change | `docs/Project Context.md`, `docs/NovaCommerce Architecture.md`, `docs/reponsitory-structure.md` |
| New module / bounded context | + `docs/domain-model.md`, `docs/database-design.md`, `docs/event-catalog.md` |
| Domain logic | + `docs/domain-model.md`, `docs/event-catalog.md` |
| Database / Prisma / migration | + `docs/domain-model.md`, `docs/database-design.md` |
| REST API / controller / DTO | + `docs/api-guidelines.md`, `docs/domain-model.md` |
| Domain event / outbox / worker | + `docs/event-catalog.md`, `docs/database-design.md` |
| Frontend UI | + `docs/api-guidelines.md`, `docs/brand-guidelines.md` |
| AI service (Python) | + `docs/NovaCommerce Architecture.md` (AI section), `docs/api-guidelines.md` |
| Docker / infra | + `docs/docker.md`, `docs/techContext.md` |

## Hard rules

- Do **not** invent aggregate names, event names, table names, or API paths that contradict `domain-model.md`, `event-catalog.md`, `database-design.md`, or `api-guidelines.md`.
- Do **not** skip reading docs because the task "seems simple".
- Do **not** implement cross-module access — verify module boundaries in `domain-model.md` first.
- When adding a feature, check `docs/event-catalog.md` for required domain events before finishing.

---

# Project Stack

Backend

- TypeScript
- NestJS
- Prisma ORM
- PostgreSQL
- Redis
- OpenSearch
- MinIO

Frontend

- Next.js
- React
- TailwindCSS

AI Platform

- Python
- FastAPI
- LangChain
- PyTorch
- Sentence Transformers

Architecture

- Modular Monolith
- Clean Architecture
- Domain Driven Design
- Event Driven
- Outbox Pattern
- CQRS (where necessary)

---

# Golden Rules

## Rule 1

Never break Clean Architecture.

Dependency direction must always be:

```
Presentation

↓

Application

↓

Domain

↑

Infrastructure
```

---

## Rule 2

Business logic belongs only in the Domain Layer.

Never place business logic in:

- Controllers
- DTOs
- Repositories
- Prisma Services
- Middleware

---

## Rule 3

Every feature belongs to exactly one module.

Never duplicate business logic.

---

## Rule 4

Never access another module's database.

Modules communicate only through:

- Application Services
- Domain Events
- Public Contracts

---

## Rule 5

Every important business action must emit a Domain Event.

Examples:

- UserRegistered
- ProductCreated
- StockReserved
- OrderCreated
- PaymentSucceeded
- ReviewSubmitted

---

## Rule 6

Never publish events directly.

Always use:

```
Aggregate

↓

Outbox

↓

Worker

↓

Event Bus
```

---

## Rule 7

Prisma exists only inside Infrastructure.

Never inject Prisma into:

- Controllers
- Domain
- Application

---

## Rule 8

Repositories must be interfaces in Domain/Application.

Implementations belong in Infrastructure.

---

## Rule 9

All new APIs require:

- Validation
- Authorization
- Swagger documentation
- Tests

---

## Rule 10

Never use `any` unless absolutely unavoidable and documented with justification.

Prefer:

- unknown
- generic types
- discriminated unions
- utility types

---

# Module Standard

Every module must follow the same structure.

```
module

application

domain

infrastructure

presentation

contracts

events

README.md
```

Do not create custom layouts.

---

# Folder Naming

Use:

```
lowercase
```

Examples

```
catalog

inventory

payment
```

---

# File Naming

Use kebab-case.

Examples

```
create-product.command.ts

product.repository.ts

order-created.event.ts
```

---

# Class Naming

Use PascalCase.

```
Product

CreateOrderHandler

InventoryService
```

---

# Interface Naming

Prefix with I.

```
IProductRepository

IEventBus

ICacheService
```

---

# Event Naming

Past tense.

```
ProductCreatedEvent

OrderCompletedEvent

PaymentSucceededEvent
```

---

# Command Naming

Imperative.

```
CreateProductCommand

ReserveInventoryCommand

CancelOrderCommand
```

---

# Query Naming

Descriptive.

```
GetProductByIdQuery

SearchProductsQuery

GetOrderHistoryQuery
```

---

# Aggregate Rules

Each Aggregate must:

- Have one Aggregate Root.
- Enforce business invariants.
- Control state changes.
- Raise Domain Events.

External code must never mutate Aggregate internals directly.

---

# Value Objects

Prefer Value Objects over primitive obsession.

Examples:

- Money
- Email
- Address
- PhoneNumber
- Quantity
- SKU
- Currency

Value Objects must be immutable.

---

# Entity Rules

Entities:

- Have identity.
- Encapsulate behavior.
- Avoid public setters.
- Protect invariants.

---

# Application Layer

Responsibilities:

- Execute use cases.
- Coordinate repositories.
- Coordinate transactions.
- Publish events through Outbox.
- Return DTOs or Result objects.

Application Layer must not contain domain rules.

---

# Presentation Layer

Controllers must:

- Validate input.
- Authenticate.
- Authorize.
- Call Application Layer.
- Return HTTP responses.

Nothing else.

---

# Infrastructure Layer

Contains:

- Prisma
- Redis
- OpenSearch
- MinIO
- Email
- SMS
- Payment Providers
- Shipping Providers

Infrastructure must never leak into Domain.

---

# Shared Package

Allowed:

- Result
- Error
- Logger
- EventBus
- BaseEntity
- AggregateRoot
- Pagination
- Validation
- Common Utilities

Forbidden:

- Business logic
- Module-specific code

---

# AI Services

AI services run independently in Python.

Responsibilities:

- Chatbot
- Semantic Search
- Recommendation
- OCR
- Fraud Detection
- Review Summary
- Product Description Generation

Communication:

- REST
- gRPC (future)

Business modules must not call LLMs directly.

---

# Search

Do not search PostgreSQL directly for user-facing product search.

Use:

```
Database

↓

Indexer

↓

OpenSearch

↓

Search API
```

---

# Error Handling

Business errors:

```
Result.Fail()
```

Unexpected failures:

Throw exceptions.

Never use exceptions for validation or business rules.

---

# Logging

Use structured logging.

Include:

- RequestId
- CorrelationId
- UserId
- Module
- Duration
- ErrorCode

Never use `console.log`.

---

# Security

Always:

- Validate input.
- Sanitize output where applicable.
- Enforce RBAC.
- Use JWT authentication.
- Apply rate limiting.
- Record audit logs.

Never expose secrets.

Never trust client input.

---

# Performance

Always consider:

- Pagination
- Caching
- Indexing
- Batch operations
- Avoid N+1 queries

Measure before optimizing.

---

# Testing

Required:

- Unit Tests
- Integration Tests
- E2E Tests (for public APIs)

Target coverage:

```
>= 80%
```

Critical domain logic requires near-100% coverage.

---

# Documentation

Every feature must update:

- README
- Swagger/OpenAPI
- Architecture docs (if impacted)
- ADR (Architecture Decision Record) when introducing significant design changes

---

# Pull Request Checklist

Before merging:

- [ ] Builds successfully.
- [ ] Lint passes.
- [ ] Type checking passes.
- [ ] Tests pass.
- [ ] No circular dependencies.
- [ ] No architecture violations.
- [ ] Swagger updated.
- [ ] Documentation updated.
- [ ] No TODOs without linked issue.
- [ ] No commented-out code.

---

# Forbidden

Never:

- Bypass architecture.
- Access another module's repository directly.
- Inject Prisma outside Infrastructure.
- Create circular dependencies.
- Use `any` casually.
- Write business logic in controllers.
- Skip tests.
- Disable lint rules to make code compile.
- Commit generated secrets or credentials.
- Introduce breaking changes without documenting them.

---

# Decision Hierarchy

When multiple solutions exist, choose in this order:

1. Domain correctness
2. Clean Architecture
3. DDD consistency
4. Security
5. Testability
6. Maintainability
7. Performance
8. Simplicity

---

# Engineering Philosophy

> **Design for change, not for today.**

> **Modules own their business capabilities.**

> **Events connect modules.**

> **AI augments business, never replaces domain rules.**

> **Every feature should move NovaCommerce closer to an enterprise-grade, event-driven platform that can evolve into microservices without rewriting the domain.**
