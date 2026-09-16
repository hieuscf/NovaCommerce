# NovaCommerce Domain Model

> **Version:** 0.2.0  
> **Status:** Foundation Design — Reviewed for Implementation  
> **Last Updated:** 2026-09-09  
> **Related:** [event-catalog.md](./event-catalog.md), [database-design.md](./database-design.md), [NovaCommerce Architecture.md](./NovaCommerce%20Architecture.md)

---

## 1. Purpose

Định nghĩa Domain Driven Design (DDD) cho NovaCommerce:

- Bounded Context
- Aggregate Root
- Entity
- Value Object
- Domain Event
- Domain Service
- Quy tắc giao tiếp giữa các Context

Đây là **domain design**, không phải database schema. Persistence mapping thuộc Infrastructure layer.

---

## 2. Bounded Context Classification

### Core / Commerce Contexts (TypeScript — `modules/`)

| Context | Module | Responsibility |
|---------|--------|----------------|
| Identity | `modules/identity` | Authentication, credentials, identity lifecycle |
| User | `modules/user` | Customer profile, addresses, preferences |
| Catalog | `modules/catalog` | Product, variant, category |
| Cart | `modules/cart` | Shopping cart |
| Checkout | `modules/checkout` | Checkout orchestration |
| Order | `modules/order` | Order lifecycle |
| Inventory | `modules/inventory` | Stock and reservation |
| Payment | `modules/payment` | Payment lifecycle |
| Shipping | `modules/shipping` | Shipment and fulfillment |
| Promotion | `modules/promotion` | Promotion and coupon |
| Notification | `modules/notification` | Notification delivery |
| Review | `modules/review` | Product review and rating |
| CMS | `modules/cms` | Content management |

### Read / Supporting Contexts

| Context | Module | Domain Layer |
|---------|--------|--------------|
| Search | `modules/search` | Read model / CQRS — no transactional aggregate |
| Analytics | `modules/analytics` | Read model / projections — no transactional aggregate |

### External / Deferred Contexts

| Context | Location | Notes |
|---------|----------|-------|
| AI | `ai-services/` (Python/FastAPI) | **Not** a TypeScript module — independent AI platform |
| Seller | `modules/seller` | Scaffold only — insufficient requirements |
| ReturnRefund | — | Planned context — not in current scope |

`packages/building-blocks` and `packages/database` are supporting packages, not business bounded contexts.

---

## 3. Domain Audit Summary

Audit date: 2026-09-09. Cross-checked against `event-catalog.md`, `database-design.md`, `NovaCommerce Architecture.md`, and `modules/`.

| Context | Aggregates | Entities | Value Objects | Domain Services | Repositories | Events | Invariants | Code |
|---------|------------|----------|---------------|-----------------|--------------|--------|------------|------|
| Identity | Identity | Credential, ExternalIdentity, RefreshSession, Role, Permission, PasswordResetToken | EmailAddress, IdentityId, Provider, AccountStatus, PlainPassword, PermissionKey | — | IIdentityRepository, IRoleRepository, IPermissionRepository | 10+ | Account status transitions; disabled cannot authenticate | ✅ |
| User | User | UserProfile, UserAddress, UserPreference | UserId, DisplayName, PhoneNumber, Address | — | IUserRepository | 2 | Valid profile refs | ✅ |
| Catalog | Product, Category | ProductVariant, ProductImage, ProductAttribute, ProductOption | ProductSku, Money, ProductName, ProductSlug | — | IProductRepository, ICategoryRepository | 4 | Publish/price rules | ✅ |
| Cart | Cart | CartItem | CartId, ProductReference, Quantity, Money | — | ICartRepository | 4 | Valid quantities | ✅ |
| Checkout | CheckoutSession | CheckoutLine, CheckoutAdjustment | — | — | ICheckoutSessionRepository | 2 | Session lifecycle | ✅ |
| Order | Order | OrderLine, OrderAdjustment, OrderAddress, OrderPaymentReference, OrderShipmentReference | OrderId, OrderNumber, Money, Quantity, Address | — | IOrderRepository | 4 | Lines before confirm; no modify terminal state | ✅ |
| Inventory | InventoryItem | StockReservation, StockAdjustment | Sku, Quantity, ReservationId, WarehouseId | — | IInventoryItemRepository | 4 | Non-negative available stock | ✅ |
| Payment | Payment | PaymentAttempt, PaymentTransaction | Money, PaymentReference, PaymentMethod, ProviderReference | — | IPaymentRepository | 4 | Payment state transitions | ✅ |
| Shipping | Shipment | ShipmentItem, TrackingRecord | TrackingNumber, Address, CarrierCode | — | IShipmentRepository | 4 | Shipment lifecycle | ✅ |
| Promotion | Promotion, Coupon | PromotionRule, PromotionBenefit, CouponRedemption | CouponCode, Percentage, Money, DateRange | — | IPromotionRepository, ICouponRepository | 4 | Coupon usage rules | ✅ |
| Notification | Notification | NotificationDelivery | — | — | INotificationRepository | 3 | Delivery tracking | ✅ |
| Review | Review | ReviewMedia | Rating, ReviewText, ProductReference | — | IReviewRepository | 3 | Rating bounds | ✅ |
| CMS | Content | — | — | — | IContentRepository | 3 | Content publish lifecycle | ✅ |
| Search | — | ProductSearchDocument | — | — | IProductSearchIndex | consumes ProductCreated, ProductUpdated | N/A | ✅ indexer + keyword Search API |
| Analytics | — | — | — | — | — | consumes OrderCreated etc. | N/A | ⏳ read-side |
| Seller | TBD | TBD | TBD | — | TBD | TBD | TBD | ⏳ deferred |
| AI | — | — | — | Python services | — | AI consumption | N/A | 🚧 stub |

**Domain Services:** No standalone Domain Services are defined in the current foundation design. Cross-cutting orchestration belongs in Application layer (e.g. Checkout). Domain Services will be added only when logic does not belong to a single Entity or Aggregate Root.

---

## 4. Design Decisions / Reconciliation

| Issue | Current State | Decision | Reason | Impact |
|-------|---------------|----------|--------|--------|
| AI as bounded context | Listed in domain-model alongside commerce contexts | AI is **external Python platform** (`ai-services/`), not `modules/` TypeScript code | Architecture ADR-004 separates AI microservices | No `modules/ai/`; AI events are consumption-only from commerce |
| Seller module | Listed with tentative aggregates | **Defer domain implementation** until business requirements are defined | domain-model §4 states insufficient requirements | `modules/seller/` remains scaffold + README only |
| ReturnRefund | Listed as planned context | **Out of Foundation scope** | Not enough requirements | No module folder yet |
| Search / Analytics | Search indexer projects Catalog events into OpenSearch; Search API queries that index; Analytics still deferred | **Read-side only** — no transactional aggregates. Search owns `ProductSearchDocument` + `IProductSearchIndex`; Catalog remains source of truth | CQRS pattern per architecture | Search query API implemented (keyword, filter, sort, pagination, cache). Analytics domain deferred |
| UserCreated event | In event-catalog, missing from original User events list | **Added to User domain** | Align catalog with user lifecycle | `UserCreatedEvent` implemented in `modules/user` |
| CheckoutStarted / CheckoutCompleted | In event-catalog, missing from original Checkout section | **Added to Checkout domain** | Align catalog with checkout flow | Events implemented in `modules/checkout` |
| IdentityDisabled | In domain-model, missing from event-catalog | **Documented in both** | Complete identity lifecycle | Added to event-catalog baseline |
| Money / Address duplication | Same VO names across contexts | **Per-context Value Objects** | DDD bounded context isolation | Each module owns its own `Money`, `Address` types |
| Domain vs Prisma schema | database-design has tables; domain has aggregates | **Separate models** — map via Repository in Infrastructure | Clean Architecture | No Prisma in domain layer |

---

## 5. Core Aggregates

### Identity

**Aggregate Root:** Identity

| Kind | Names |
|------|-------|
| Entities | Credential, ExternalIdentity, RefreshSession, Role, Permission, PasswordResetToken |
| Value Objects | EmailAddress, IdentityId, Provider, AccountStatus, PlainPassword, PermissionKey |
| Events | IdentityRegistered, IdentityAuthenticated, IdentityDisabled, PasswordChanged, PasswordResetRequested, PasswordResetCompleted, UserLoggedOut, RefreshTokenRotated, RoleAssigned, RoleRevoked |
| Invariants | Non-ACTIVE accounts cannot authenticate; refresh token rotation revokes prior session |

### User

**Aggregate Root:** User

| Kind | Names |
|------|-------|
| Entities | UserProfile, UserAddress, UserPreference |
| Value Objects | UserId, DisplayName, PhoneNumber, Address |
| Events | UserCreated, UserProfileUpdated |
| Invariants | User must reference valid identity |

### Catalog

**Aggregate Roots:** Product, Category

| Kind | Names |
|------|-------|
| Product Entities | ProductVariant, ProductImage, ProductAttribute, ProductOption |
| Value Objects | ProductSku, Money, ProductName, ProductSlug |
| Events | ProductCreated, ProductUpdated, ProductPublished, ProductPriceChanged |

### Cart

**Aggregate Root:** Cart

| Kind | Names |
|------|-------|
| Entities | CartItem |
| Value Objects | CartId, ProductReference, Quantity, Money |
| Events | CartCreated, CartItemAdded, CartItemRemoved, CartCleared |

### Checkout

**Aggregate Root:** CheckoutSession

| Kind | Names |
|------|-------|
| Entities | CheckoutLine, CheckoutAdjustment |
| Events | CheckoutStarted, CheckoutCompleted |
| Role | Orchestration between Cart, Catalog, Inventory, Promotion, User to create Order |

### Order

**Aggregate Root:** Order

| Kind | Names |
|------|-------|
| Entities | OrderLine, OrderAdjustment, OrderAddress, OrderPaymentReference, OrderShipmentReference |
| Value Objects | OrderId, OrderNumber, Money, Quantity, Address |
| Events | OrderCreated, OrderConfirmed, OrderCancelled, OrderCompleted |
| Invariants | Order must have lines before confirm; quantity and total valid; cannot modify Completed/Cancelled |

### Inventory

**Aggregate Root:** InventoryItem

| Kind | Names |
|------|-------|
| Entities | StockReservation, StockAdjustment |
| Value Objects | Sku, Quantity, ReservationId, WarehouseId |
| Events | StockAdjusted, StockReserved, StockReservationReleased, StockDepleted |
| Invariants | Available stock cannot be negative; reservation cannot exceed available |

### Payment

**Aggregate Roots:** Payment, SavedPaymentMethod

| Kind | Names |
|------|-------|
| Entities | PaymentAttempt, PaymentTransaction |
| Value Objects | Money, PaymentReference, PaymentMethod, ProviderReference, CardBrand, CardLastFour, CardExpiry |
| Events | PaymentInitiated, PaymentSucceeded, PaymentFailed, PaymentRefunded, SavedPaymentMethodAdded, SavedPaymentMethodRemoved, SavedPaymentMethodDefaultChanged |

**SavedPaymentMethod invariants (ADR-006):** Never store CVV/CVC or full PAN. Persist only opaque `providerToken` + display metadata (`brand`, `last4`, `expMonth`, `expYear`, `cardholderName`). CVV is collected per charge in the client and must not appear in Gateway persistence.

### Shipping

**Aggregate Root:** Shipment

| Kind | Names |
|------|-------|
| Entities | ShipmentItem, TrackingRecord |
| Value Objects | TrackingNumber, Address, CarrierCode |
| Events | ShipmentCreated, ShipmentDispatched, ShipmentInTransit, ShipmentDelivered |

### Promotion

**Aggregate Roots:** Promotion, Coupon

| Kind | Names |
|------|-------|
| Entities | PromotionRule, PromotionBenefit, CouponRedemption |
| Value Objects | CouponCode, Percentage, Money, DateRange |
| Events | PromotionActivated, PromotionDeactivated, CouponApplied, CouponUsed |

### Notification

**Aggregate Root:** Notification

| Kind | Names |
|------|-------|
| Entities | NotificationDelivery |
| Events | NotificationRequested, NotificationSent, NotificationFailed |

### Review

**Aggregate Root:** Review

| Kind | Names |
|------|-------|
| Entities | ReviewMedia |
| Value Objects | Rating, ReviewText, ProductReference |
| Events | ReviewCreated, ReviewUpdated, ReviewPublished |

### CMS

**Aggregate Root:** Content

| Kind | Names |
|------|-------|
| Events | ContentCreated, ContentUpdated, ContentPublished |

---

## 6. Read / Supporting Contexts

### Search

Read Model / CQRS — not a transactional aggregate. Catalog remains the source of truth for Product.

Search owns:

- `ProductSearchDocument` — search/read representation (not the Catalog Product entity)
- `IProductSearchIndex` — index port (implemented with OpenSearch in Infrastructure)

```text
ProductCreated / ProductUpdated → Event → ProductIndexer → OpenSearch → Search API
```

Search does not query PostgreSQL. Search does not update Catalog.

### Analytics

Read Models, projections, aggregations. Does not own Order/Product/Payment transactional data.

### AI (External)

Python/FastAPI services: Chatbot, Recommendation, Semantic Search, OCR, Fraud Detection, Review Summary, Content Generator.

AI does not own commerce transaction state.

### Seller (Deferred)

Planned: Seller, SellerProfile, SellerStore, SellerProductListing — pending business requirements.

### ReturnRefund (Planned)

Not enough requirements to finalize aggregates.

---

## 7. Cross-Context Rules

Modules must not access another context's Entity or Repository directly.

**Wrong:**

```text
Order → InventoryRepository
```

**Correct:**

```text
OrderCreated → Event Bus → Inventory Handler → StockReserved
```

Cross-context communication uses:

- Application Service (when synchronous contract needed)
- Public Contract
- Domain Event
- Integration Event (future Kafka)

Use IDs and references — never foreign Entity instances across contexts.

---

## 8. Aggregate Rules

- Aggregate is the consistency boundary
- Only Aggregate Root is accessed from outside
- Keep aggregates small
- Strong consistency invariants enforced inside Aggregate
- Eventual consistency between contexts
- Repository interfaces target Aggregate Root
- Never mutate another context's Aggregate directly

---

## 9. Domain Events & Outbox

| Event | Owner |
|-------|-------|
| OrderCreated | Order |
| StockReserved | Inventory |
| PaymentSucceeded | Payment |
| ReviewCreated | Review |
| CouponUsed | Promotion |

```text
Change Domain State → Save Outbox → Commit → Worker → Publish Event
```

Never publish events directly inside a business transaction.

See [event-catalog.md](./event-catalog.md) for full catalog and integration event mapping.

---

## 10. CQRS

Apply only where read scalability is required:

- Search
- Analytics
- Dashboard
- Reporting

Do not apply CQRS to simple CRUD across the platform.

---

## 11. Dependency Rule

```text
Presentation → Application → Domain
Infrastructure implements Domain/Application interfaces
```

Domain must not depend on: NestJS, Prisma, Redis, OpenSearch, MinIO, Kafka, HTTP clients, payment/shipping providers, LLM providers.

---

## 12. Shared Building Blocks

Use `@novacommerce/building-blocks` for:

```text
Result, DomainError, BaseEntity, AggregateRoot, ValueObject,
DomainEvent (interface), Specification
```

Do not duplicate these primitives in modules. Do not put business logic in building-blocks.

---

## 13. Domain → Module Mapping

```text
modules/<context>/
├── domain/
│   ├── aggregates/
│   ├── entities/
│   ├── events/
│   ├── repositories/
│   ├── value-objects/
│   └── errors/
├── application/      (future)
├── infrastructure/   (future)
└── presentation/     (future)
```

---

## 14. Implementation Status

> Domain layer code exists under `modules/*/domain/` for commerce contexts. Application/Infrastructure/Presentation are implemented for Core Commerce and several extensions. Search has a **read-model indexer** (`ProductSearchDocument`, `IProductSearchIndex`, OpenSearch product index, ProductCreated/ProductUpdated handlers) and a **keyword Search API** (filters, sort, pagination, Redis cache). Analytics remain pending.

| Module | Domain Code | Files | Notes |
|--------|-------------|------:|-------|
| identity | ✅ | 40+ | Full auth/RBAC domain + application + infrastructure; presentation wired in gateway |
| user | ✅ | 12 | Includes UserCreatedEvent |
| catalog | ✅ | 17 | Product + Category aggregates |
| cart | ✅ | 12 | Cart aggregate with line management |
| checkout | ✅ | 7 | CheckoutSession orchestration root |
| order | ✅ | 17 | Invariants enforced in aggregate |
| inventory | ✅ | 13 | Stock reservation invariants |
| payment | ✅ | 13 | Payment lifecycle + saved cards (no CVV at rest) |
| shipping | ✅ | 12 | Shipment lifecycle |
| promotion | ✅ | 16 | Promotion + Coupon aggregates |
| notification | ✅ | 7 | Notification delivery aggregate |
| review | ✅ | 10 | Review + rating |
| cms | ✅ | 6 | Content aggregate |
| search | ✅ | indexer + query API | Read model: `ProductSearchDocument`, `IProductSearchIndex`, ProductCreated/ProductUpdated indexer, `GET /api/v1/search/products` |
| analytics | ⏳ | 0 | Read-side — deferred |
| seller | ⏳ | 0 | Requirements pending |
| AI | N/A | — | Python `ai-services/api` stub only |

**Build verification:** `pnpm build:modules` compiles all domain TypeScript.

**Tests:** No domain test suite yet — test infrastructure pending.

**Next steps:** Application layer (commands/queries/handlers), Infrastructure repositories (Prisma), Presentation (controllers), Prisma schema sync with database-design.
