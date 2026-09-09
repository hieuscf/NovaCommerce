# @novacommerce/building-blocks

Technical building blocks for DDD and Clean Architecture across NovaCommerce modules.

## Purpose

Provides framework-independent abstractions shared by all bounded contexts:

- `Result` — operation outcome wrapper
- `DomainError` — typed domain failure base
- `BaseEntity` / `AggregateRoot` / `ValueObject` — DDD primitives
- `DomainEvent` — in-process domain fact contract
- `IntegrationEvent` — cross-context serializable event envelope
- `IEventBus` / `InMemoryEventBus` — event dispatch abstraction and default in-process transport
- `IEventHandler` — async handler contract
- `OutboxPublisher` / `IOutboxRepository` — durable outbox publication orchestration
- `ISpecification` — composable domain rules
- Pagination, validation, logging, and caching interfaces

## Rules

- No business logic (Catalog, Order, Payment, etc.)
- No NestJS, Prisma, or framework dependencies
- Prisma outbox repository implementation lives in `@novacommerce/database`

## Usage

```typescript
import {
  Result,
  AggregateRoot,
  DomainEvent,
  IntegrationEvent,
  InMemoryEventBus,
  OutboxPublisher,
} from '@novacommerce/building-blocks';
```
