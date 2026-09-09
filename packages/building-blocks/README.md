# @novacommerce/building-blocks

Technical building blocks for DDD and Clean Architecture across NovaCommerce modules.

## Purpose

Provides framework-independent abstractions shared by all bounded contexts:

- `Result` — operation outcome wrapper
- `DomainError` — typed domain failure base
- `BaseEntity` / `AggregateRoot` / `ValueObject` — DDD primitives
- `DomainEvent` — event contract
- `IEventBus` / `IOutboxStore` — messaging abstractions (interfaces only)
- `ISpecification` — composable domain rules
- Pagination, validation, logging, and caching interfaces

## Rules

- No business logic (Catalog, Order, Payment, etc.)
- No NestJS, Prisma, or framework dependencies
- Implementations of EventBus, Outbox, and repositories belong in module Infrastructure layers

## Usage

```typescript
import { Result, AggregateRoot, DomainEvent } from '@novacommerce/building-blocks';
```
