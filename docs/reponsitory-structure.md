# NovaCommerce Repository Structure

> **Version:** 1.0
> **Architecture:** Modular Monolith → Event-Driven → Microservices
> **Primary Language:** TypeScript
> **AI Language:** Python

## 1. Overview

NovaCommerce sử dụng **pnpm monorepo**.

Repository được tổ chức theo các boundary rõ ràng:

- `apps/` — application entry points
- `modules/` — business domains
- `packages/` — shared technical components
- `workers/` — background workers
- `ai-services/` — Python AI services
- `infrastructure/` — infrastructure configuration
- `docs/` — project documentation
- `tests/` — cross-module tests

Mục tiêu là giữ module độc lập và cho phép tách từng module thành Microservice mà không thay đổi Domain Logic.

## 2. Root Structure

```text
novacommerce/
│
├── apps/
│   ├── gateway/
│   ├── web/
│   ├── admin/
│   └── mobile/
│
├── modules/
│   ├── identity/
│   ├── user/
│   ├── catalog/
│   ├── cart/
│   ├── checkout/
│   ├── order/
│   ├── inventory/
│   ├── payment/
│   ├── shipping/
│   ├── promotion/
│   ├── notification/
│   ├── review/
│   ├── search/
│   ├── cms/
│   ├── analytics/
│   └── seller/
│
├── packages/
│   ├── building-blocks/
│   ├── shared/
│   └── database/
│
├── workers/
│   └── outbox-publisher/
│
├── ai-services/
│   └── api/
│
├── infrastructure/
│
├── docs/
│
├── tests/
│
├── scripts/
│
├── package.json
├── pnpm-workspace.yaml
├── docker-compose.yml
└── docker-compose.dev.yml
```

## 3. `apps/`

Chứa các application entry point.

### `apps/gateway`

API Gateway / BFF.

Responsibilities:

- Authentication
- Authorization
- Rate limiting
- Request/Correlation ID
- Logging
- Routing tới module

Không chứa business logic.

### `apps/web`

Next.js storefront dành cho khách hàng.

### `apps/admin`

Next.js administration interface.

### `apps/mobile`

React Native mobile application.

## 4. `modules/`

Đây là nơi chứa **business domain** của NovaCommerce.

Mỗi module là một Bounded Context và phải độc lập với các module khác.

Cấu trúc chuẩn:

```text
modules/catalog/
│
├── application/
│   ├── commands/
│   ├── queries/
│   ├── handlers/
│   └── dto/
│
├── domain/
│   ├── entities/
│   ├── aggregates/
│   ├── value-objects/
│   ├── events/
│   └── repositories/
│
├── infrastructure/
│   ├── prisma/
│   ├── repositories/
│   └── services/
│
├── presentation/
│   └── controllers/
│
├── contracts/
│
├── events/
│
└── README.md
```

### Dependency rule

```text
Presentation
     ↓
Application
     ↓
Domain
```

Infrastructure implement các interface của Domain/Application.

Domain không phụ thuộc NestJS, Prisma hoặc framework cụ thể.

## 5. Module Boundaries

Không được truy cập trực tiếp implementation của module khác.

```text
Order
  ↓
InventoryRepository       ❌
```

Thay vào đó:

```text
Order
  ↓
Public Contract / Event
  ↓
Inventory
```

Không được:

- Import Entity của module khác.
- Import Repository của module khác.
- Query Database của module khác.
- Chia sẻ business logic giữa các module.

Mỗi module sở hữu domain model của chính mình.

## 6. `packages/`

Chứa các technical components dùng chung.

### `packages/building-blocks`

Các building blocks cho DDD/Clean Architecture:

```text
Result
Error
BaseEntity
AggregateRoot
ValueObject
DomainEvent
Specification
EventBus
Outbox
```

Không chứa business logic cụ thể của Commerce.

### `packages/shared`

Các thành phần cross-cutting:

```text
Validation
Pagination
Logger
Guards
Security
Caching
Common Types
Utilities
```

Không biến `shared` thành nơi chứa business logic dùng chung.

### `packages/database`

Database infrastructure và Prisma.

Package này không được trở thành cách để module truy cập trực tiếp database model của module khác.

## 7. `workers/`

Background processing.

Hiện tại:

```text
workers/
└── outbox-publisher/
```

Outbox Publisher chịu trách nhiệm:

```text
Database Outbox
      ↓
Worker
      ↓
Event Bus / Kafka
```

Không publish integration event trực tiếp trong business transaction.

## 8. `ai-services/`

AI Platform được tách khỏi NestJS backend và chạy bằng Python.

```text
ai-services/
└── api/
```

Các AI capability dự kiến:

- Chatbot
- Recommendation
- Semantic Search
- OCR
- Review Summary
- Content Generator
- Fraud Detection

AI service giao tiếp với platform thông qua REST hoặc gRPC.

AI không được nhúng trực tiếp vào business domain.

## 9. `infrastructure/`

Chứa cấu hình infrastructure/deployment.

Các thành phần hiện tại hoặc dự kiến:

```text
PostgreSQL
Redis
OpenSearch
MinIO
Kafka
Docker
Kubernetes
Monitoring
```

Infrastructure configuration không chứa business logic.

## 10. `docs/`

Tài liệu chính thức của project.

```text
docs/
├── Project Context.md
├── NovaCommerce Architecture.md
├── techContext.md
├── progress.md
├── domain-model.md
├── database-design.md
├── event-catalog.md
├── api-guidelines.md
├── repository-structure.md
├── coding-standards.md
├── testing-strategy.md
├── security.md
├── deployment.md
└── monitoring.md
```

Architecture/Domain documentation phải được cập nhật khi design thay đổi.

## 11. `tests/`

Chứa các test ở cấp repository hoặc cross-module.

Các loại test:

```text
Unit
Integration
Contract
E2E
Performance
```

Test riêng của module nên nằm gần module hoặc theo convention của package/module đó.

## 12. `scripts/`

Các development/maintenance scripts.

Ví dụ:

```text
Database migration
Seed
Code generation
Build
Development utilities
```

Script không chứa business logic.

## 13. Naming Convention

### Files

```text
kebab-case
```

Ví dụ:

```text
product-repository.ts
create-order.use-case.ts
order-created.event.ts
```

### Directories

```text
lowercase
```

### Classes

```text
PascalCase
```

### Variables / functions

```text
camelCase
```

### Interfaces

Prefix `I`:

```text
IProductRepository
IEventBus
ICacheService
```

## 14. Dependency Rules

### Allowed

```text
Presentation
    ↓
Application
    ↓
Domain

Infrastructure → implements Domain interfaces
```

### Forbidden

```text
Domain → NestJS
Domain → Prisma
Domain → Redis
Domain → HTTP client
Domain → Kafka
```

Module A không được phụ thuộc implementation của Module B.

## 15. Microservices Migration

Repository phải cho phép chuyển:

```text
modules/inventory
```

thành:

```text
services/inventory
```

mà không phải thay đổi Domain Model.

Communication sau khi tách service:

```text
Gateway
   ↓
Inventory Service
   ↓
Application
   ↓
Domain
```

Integration Event được truyền qua Kafka khi hệ thống chuyển sang distributed architecture.

## 16. Rules for New Code

Khi thêm code mới:

1. Xác định code thuộc application, domain hay infrastructure.
2. Xác định Bounded Context.
3. Không đặt business logic vào `apps/`.
4. Không đặt business logic vào `packages/shared`.
5. Không bypass module boundary.
6. Không truy cập database của module khác.
7. Không đưa framework dependency vào Domain.
8. Nếu có cross-module effect, xem xét Domain Event/Integration Event.
9. Nếu cần background processing, dùng worker.
10. Nếu cần AI, gọi AI Service thay vì nhúng AI vào Domain.

## 17. Repository Principle

> **Business code belongs to Modules.
> Shared code belongs to Packages.
> Entry points belong to Apps.
> Background processing belongs to Workers.
> AI belongs to AI Services.
> Infrastructure belongs to Infrastructure.**

Repository structure phải bảo vệ:

**High Cohesion → Low Coupling → Clear Boundaries → Microservices Ready**
