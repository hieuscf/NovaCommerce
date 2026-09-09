NovaCommerce Domain Model

Version: 0.1.0
Status: Draft / Foundation Design
Last Updated: 2026-09-09

1. Purpose

Định nghĩa Domain Driven Design (DDD) cho NovaCommerce:

Bounded Context

Aggregate Root

Entity

Value Object

Domain Event

Domain Service

Quy tắc giao tiếp giữa các Context

Đây là domain design, không phải database schema.

2. Bounded Contexts

Context

Trách nhiệm

Identity

Authentication, credentials, identity

User

User/customer profile

Catalog

Product, variant, category

Cart

Shopping cart

Checkout

Checkout orchestration

Order

Order lifecycle

Inventory

Stock & reservation

Payment

Payment lifecycle

Shipping

Shipment/fulfillment

Promotion

Promotion & coupon

Notification

Notification delivery

Review

Product review & rating

Search

Search/read model

CMS

Content management

Analytics

Reporting & analytics

Seller

Seller/marketplace

AI

AI services độc lập

ReturnRefund

Planned context

Shared và BuildingBlocks chỉ là supporting packages, không phải Business Context.

3. Core Aggregates

Identity

Aggregate: Identity

Entities:

Credential

ExternalIdentity

RefreshSession

Value Objects:

EmailAddress

IdentityId

Provider

Events:

IdentityRegistered

IdentityAuthenticated

IdentityDisabled

User

Aggregate: User

Entities:

UserProfile

UserAddress

UserPreference

Value Objects:

UserId

DisplayName

PhoneNumber

Address

Catalog

Aggregates: Product, Category

Product:

ProductVariant

ProductImage

ProductAttribute

ProductOption

Value Objects:

ProductSku

Money

ProductName

ProductSlug

Events:

ProductCreated

ProductUpdated

ProductPublished

ProductPriceChanged

Cart

Aggregate: Cart

Entities:

CartItem

Value Objects:

CartId

ProductReference

Quantity

Money

Events:

CartCreated

CartItemAdded

CartItemRemoved

CartCleared

Checkout

Aggregate: CheckoutSession

Entities:

CheckoutLine

CheckoutAdjustment

Vai trò: orchestration giữa Cart, Catalog, Inventory, Promotion, User để tạo Order.

Order

Aggregate: Order

Entities:

OrderLine

OrderAdjustment

OrderAddress

OrderPaymentReference

OrderShipmentReference

Value Objects:

OrderId

OrderNumber

Money

Quantity

Address

Events:

OrderCreated

OrderConfirmed

OrderCancelled

OrderCompleted

Invariants chính:

Order phải có line trước khi confirm.

Quantity và total phải hợp lệ.

Không sửa Order đã Completed/Cancelled.

Inventory

Aggregate: InventoryItem

Entities:

StockReservation

StockAdjustment

Value Objects:

Sku

Quantity

ReservationId

WarehouseId

Events:

StockAdjusted

StockReserved

StockReservationReleased

StockDepleted

Invariant: available stock không được âm; reservation không vượt stock có thể reserve.

Payment

Aggregate: Payment

Entities:

PaymentAttempt

PaymentTransaction

Value Objects:

Money

PaymentReference

PaymentMethod

ProviderReference

Events:

PaymentInitiated

PaymentSucceeded

PaymentFailed

PaymentRefunded

Shipping

Aggregate: Shipment

Entities:

ShipmentItem

TrackingRecord

Value Objects:

TrackingNumber

Address

CarrierCode

Events:

ShipmentCreated

ShipmentDispatched

ShipmentInTransit

ShipmentDelivered

Promotion

Aggregates: Promotion, Coupon

Entities:

PromotionRule

PromotionBenefit

CouponRedemption

Value Objects:

CouponCode

Percentage

Money

DateRange

Events:

PromotionActivated

PromotionDeactivated

CouponApplied

CouponUsed

Notification

Aggregate: Notification

Entities:

NotificationDelivery

Events:

NotificationRequested

NotificationSent

NotificationFailed

Review

Aggregate: Review

Entities:

ReviewMedia

Value Objects:

Rating

ReviewText

ProductReference

Events:

ReviewCreated

ReviewUpdated

ReviewPublished

4. Read / Supporting Contexts

Search

Chủ yếu là Read Model/CQRS, không phải transactional Aggregate.

ProductUpdated
↓
Event
↓
Indexer
↓
OpenSearch
↓
Search API

Analytics

Chủ yếu dùng Read Models, projections và aggregations.

Không sở hữu transactional data của Order/Product/Payment.

CMS

Aggregate chính: Content

Events:

ContentCreated

ContentUpdated

ContentPublished

Seller

Chưa đủ business requirements để chốt model. Dự kiến:

Seller

SellerProfile

SellerStore

SellerProductListing

AI

AI chạy độc lập bằng Python/FastAPI.

Services:

Chatbot

Recommendation

Semantic Search

OCR

Fraud Detection

Review Summary

Content Generator

Image Search

SEO Generator

AI không sở hữu transaction state của Commerce.

ReturnRefund

Là planned context; chưa đủ requirements để chốt Aggregate.

5. Cross-Context Rules

Không được truy cập Entity/Repository của Context khác.

Sai:

Order → InventoryRepository

Đúng:

OrderCreated
↓
Event Bus
↓
Inventory Handler

Cross-context dùng:

Application Service

Public Contract

Domain Event

Integration Event

Chỉ dùng ID/reference thay vì Entity của Context khác.

6. Aggregate Rules

Aggregate là consistency boundary.

Chỉ Aggregate Root được truy cập từ bên ngoài.

Giữ Aggregate nhỏ.

Invariant cần strong consistency nằm trong Aggregate.

Giữa các Context dùng eventual consistency.

Repository tập trung vào Aggregate Root.

Không mutate trực tiếp Aggregate khác.

7. Domain Events & Outbox

Các event quan trọng:

Event

Owner

OrderCreated

Order

StockReserved

Inventory

PaymentSucceeded

Payment

ReviewCreated

Review

CouponUsed

Promotion

Flow:

Change Domain State
↓
Save Outbox
↓
Commit
↓
Worker
↓
Publish Event

Không publish event trực tiếp trong transaction.

8. CQRS

Chỉ áp dụng khi cần:

Search

Analytics

Dashboard

Reporting

Không áp dụng cho CRUD đơn giản.

9. Dependency Rule

Presentation
↓
Application
↓
Domain
↑
Infrastructure

Domain không phụ thuộc:

NestJS

Prisma

Redis

OpenSearch

MinIO

Kafka

HTTP clients

Payment/Shipping providers

LLM providers

Infrastructure implement các interface của Domain/Application.

10. Shared Building Blocks

Có thể chứa:

Result

Error

BaseEntity

AggregateRoot

Specification

DomainEvent

EventBus

Outbox

Logger

Validation

Pagination

ValueObject

Không chứa business logic.

11. Domain → Module Mapping

<module>/
├── application/
├── domain/
│ ├── entities/
│ ├── aggregates/
│ ├── events/
│ ├── repositories/
│ └── value-objects/
├── infrastructure/
├── presentation/
├── contracts/
└── README.md

Domain phải framework-independent.

12. Implementation Status

Đây là design baseline, chưa phải implementation.

Hiện repository mới có Outbox model; business domain modules chưa được triển khai.
