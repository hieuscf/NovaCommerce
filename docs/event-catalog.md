NovaCommerce Event Catalog

> **Version:** 0.1.0  
> **Status:** Foundation Design — Aligned with domain-model v0.2.0  
> **Last Updated:** 2026-09-09

## 1. Purpose

Định nghĩa các Domain Event và Integration Event chính của NovaCommerce.

Nguyên tắc:

- Domain Event thuộc Bounded Context phát sinh event.
- Module khác không truy cập trực tiếp Entity/Repository của nhau.
- Event-driven là cơ chế giao tiếp chính cho business reaction.
- Integration Event dùng khi event vượt qua process/service boundary.
- Outbox đảm bảo event được lưu cùng transaction.
- Event payload chỉ chứa dữ liệu cần thiết cho consumer.

---

## 2. Event Flow

```text
Domain Action
    ↓
Aggregate
    ↓
Domain Event
    ↓
Save Outbox
    ↓
Commit
    ↓
Event Publisher
    ↓
Event Bus
    ↓
Handlers / Consumers

Khi dùng Kafka:

Outbox
   ↓
Publisher
   ↓
Kafka
   ↓
Integration Consumers

Không publish event trực tiếp trong database transaction.

3. Event Naming
Domain Event

Dùng PascalCase:

OrderCreated
StockReserved
PaymentSucceeded
Integration Event

Dùng event name dạng:

order.created
inventory.stock_reserved
payment.completed

Tên event phải mô tả business fact đã xảy ra, không phải command.

Đúng:

OrderCreated

Không dùng:

CreateOrder
4. Core Event Catalog
Event	Owner	Ý nghĩa
IdentityRegistered	Identity	Identity mới được tạo
IdentityAuthenticated	Identity	Authentication thành công
IdentityDisabled	Identity	Identity bị vô hiệu hoá
PasswordChanged	Identity	Mật khẩu đã đổi
PasswordResetRequested	Identity	Yêu cầu reset mật khẩu
PasswordResetCompleted	Identity	Reset mật khẩu hoàn tất
UserLoggedOut	Identity	Phiên refresh bị thu hồi
RefreshTokenRotated	Identity	Refresh token được rotate
RoleAssigned	Identity	Role gán cho identity
RoleRevoked	Identity	Role bị gỡ khỏi identity
UserCreated	User	User được tạo
UserProfileUpdated	User	Profile user được cập nhật
ProductCreated	Catalog	Product được tạo
ProductUpdated	Catalog	Product thay đổi
ProductPublished	Catalog	Product được publish
ProductPriceChanged	Catalog	Giá Product thay đổi
CartCreated	Cart	Cart được tạo
CartItemAdded	Cart	Item được thêm
CartItemRemoved	Cart	Item bị xoá
CartCleared	Cart	Cart được xoá nội dung
CheckoutStarted	Checkout	Checkout bắt đầu
CheckoutCompleted	Checkout	Checkout hoàn tất
OrderCreated	Order	Order được tạo
OrderConfirmed	Order	Order được xác nhận
OrderCancelled	Order	Order bị huỷ
OrderCompleted	Order	Order hoàn tất
StockAdjusted	Inventory	Stock thay đổi
StockReserved	Inventory	Stock được reserve
StockReservationReleased	Inventory	Reservation được release
StockDepleted	Inventory	Stock hết
PaymentInitiated	Payment	Payment bắt đầu
PaymentSucceeded	Payment	Payment thành công
PaymentFailed	Payment	Payment thất bại
PaymentRefunded	Payment	Payment được refund
SavedPaymentMethodAdded	Payment	Thẻ đã lưu (metadata only — không CVV)
SavedPaymentMethodRemoved	Payment	Thẻ đã xóa khỏi vault storefront
SavedPaymentMethodDefaultChanged	Payment	Thẻ mặc định thay đổi
ShipmentCreated	Shipping	Shipment được tạo
ShipmentDispatched	Shipping	Shipment được dispatch
ShipmentInTransit	Shipping	Shipment đang vận chuyển
ShipmentDelivered	Shipping	Shipment đã giao
PromotionActivated	Promotion	Promotion active
PromotionDeactivated	Promotion	Promotion inactive
CouponApplied	Promotion	Coupon được áp dụng
CouponUsed	Promotion	Coupon đã được sử dụng
NotificationRequested	Notification	Yêu cầu gửi notification
NotificationSent	Notification	Notification gửi thành công
NotificationFailed	Notification	Notification gửi thất bại
ReviewCreated	Review	Review được tạo
ReviewUpdated	Review	Review thay đổi
ReviewPublished	Review	Review được publish
ContentCreated	CMS	Content được tạo
ContentUpdated	CMS	Content thay đổi
ContentPublished	CMS	Content được publish

Các event trên là baseline từ Domain Model và Architecture hiện tại; event chi tiết có thể bổ sung khi use case được implement.

5. Important Event Flows
5.1 Order → Inventory
OrderCreated
    ↓
Inventory Handler
    ↓
Reserve Stock
    ↓
StockReserved

Inventory không được gọi trực tiếp từ OrderRepository hoặc InventoryRepository của module khác.

5.2 Order → Notification
OrderCreated
    ↓
Notification Handler
    ↓
NotificationRequested
    ↓
NotificationSent
5.3 Order → Analytics
OrderCreated
    ↓
Analytics Consumer
    ↓
Update Read Model

Analytics không sở hữu Order transactional data.

5.4 Product → Search
ProductCreated
ProductUpdated
    ↓
ProductIndexer
    ↓
OpenSearch

Search không query PostgreSQL trực tiếp để thực hiện product search. Product search index: `novacommerce-products` (`OPENSEARCH_PRODUCT_INDEX`).

Search consumes Catalog integration events `catalog.product_created` and `catalog.product_updated`. Payload is a product snapshot (`name`, `slug`, `status`, `price`, `currency`, `images`, `attributes`, `createdAt`, `updatedAt`; optional `categoryId`). Search maps this into `ProductSearchDocument`; document ID is the Product aggregate ID. Consumers must be idempotent.

5.5 Payment → Order
PaymentSucceeded
    ↓
Order Handler
    ↓
Update Order State

Order chỉ phản ứng với business event; Payment không sửa trực tiếp Order Entity.

6. Event Payload

Mỗi integration event có envelope tối thiểu (implemented in `@novacommerce/building-blocks` as `IntegrationEvent`):

- `eventId` — unique event identity (outbox message id at publish time)
- `eventType` — dot-notation integration name (e.g. `order.created`)
- `eventVersion` — explicit contract version (integer, e.g. `1`)
- `aggregateType` — aggregate root type (e.g. `Order`)
- `aggregateId` — aggregate identity
- `occurredAt` — ISO-8601 timestamp
- `payload` — plain serializable data
- `metadata` (optional) — `correlationId`, `causationId`, `requestId`

Ví dụ:

```json
{
  "eventId": "uuid",
  "eventType": "order.created",
  "eventVersion": 1,
  "aggregateType": "Order",
  "aggregateId": "order-id",
  "occurredAt": "2026-01-01T00:00:00.000Z",
  "payload": {
    "orderNumber": "ORD-001",
    "customerId": "customer-id"
  },
  "metadata": {
    "correlationId": "uuid",
    "causationId": "uuid"
  }
}
```

Payload không chứa Entity object của Context khác.

7. Domain Event vs Integration Event
Domain Event

Dùng bên trong Modular Monolith:

OrderCreated

Mục đích:

Trigger domain/application handlers.
Tách business logic giữa các module.
Không phụ thuộc Kafka.
Integration Event

Dùng khi giao tiếp giữa process/service:

order.created

Mục đích:

Microservice communication.
Kafka consumers.
External integration.

Domain Event có thể được map thành Integration Event.

8. Outbox

Event cần cross module/service được xử lý theo:

Transaction
    │
    ├── Update Aggregate
    └── Save Outbox Message
    │
   COMMIT
    ↓
Outbox Worker
    ↓
Publish Event

Outbox message tối thiểu:

id
eventType
aggregateType
aggregateId
payload
occurredAt
publishedAt
retryCount
lastError

Nếu publish thất bại, worker retry theo policy của infrastructure.

9. Consumer Rules

Consumer phải:

Xử lý event idempotently.
Không phụ thuộc thứ tự event nếu không cần.
Validate event version.
Có retry/error handling.
Không mutate database của Context khác.
Ghi log với eventId, correlationId, aggregateId.

Không giả định event delivery chỉ xảy ra một lần.

10. Event Versioning

Event là public contract khi đã dùng giữa services.

Version được biểu diễn bằng trường `eventVersion` trên envelope (ví dụ `1`, `2`). Consumer validate `eventType` + `eventVersion` trước khi xử lý payload.

Khi thay đổi breaking, tăng `eventVersion` — không silently thay đổi payload của version đang được consumer sử dụng.

Ví dụ: `order.created` v1 và `order.created` v2 cùng `eventType`, khác `eventVersion` và payload schema.

11. Event Ownership

Mỗi event chỉ có một Owner.

Ví dụ:

OrderCreated → Order
StockReserved → Inventory
PaymentSucceeded → Payment
ReviewCreated → Review
CouponUsed → Promotion

Consumer chỉ subscribe; không trở thành owner của event.

12. Initial Priority
P0 — Core Commerce

| Domain Event | Integration Event Type | Version | Aggregate | Payload (required fields) |
| --- | --- | ---: | --- | --- |
| OrderCreated | `order.created` | 1 | Order | `orderNumber`, `customerId` |
| StockReserved | `inventory.stock_reserved` | 1 | InventoryItem | `orderId`, `quantity` |
| PaymentSucceeded | `payment.completed` | 1 | Payment | `orderId` |
| ProductCreated | `catalog.product_created` | 1 | Product | `name`, `slug` |
| ProductUpdated | `catalog.product_updated` | 1 | Product | `name` |
| CartItemAdded | `cart.item_added` | 1 | Cart | `productId`, `quantity` |
| CheckoutCompleted | `checkout.completed` | 1 | CheckoutSession | `orderId` |

Typed schemas: `packages/building-blocks/src/events/p0-events.ts`
P1 — Commerce Extensions
OrderConfirmed
OrderCancelled
PaymentFailed
ShipmentCreated
ShipmentDelivered
CouponUsed
NotificationSent
ReviewCreated
P2 — Intelligence / Supporting
ProductPublished
Analytics projections
Search indexing events — ProductCreated / ProductUpdated snapshot consumed by Search ProductIndexer (`status`, `price`, `currency`, `images`, `attributes`, `createdAt`, `updatedAt`; optional `categoryId`)
AI consumption events

P2 event payloads for Search indexing are the Catalog ProductCreated / ProductUpdated snapshots. Analytics and AI consumption payloads remain to be finalized with those use cases.

13. Current Status

| Component | Status |
| --- | --- |
| Domain Event classes | ✅ `modules/*/domain/events/` |
| `DomainEvent` interface | ✅ `@novacommerce/building-blocks` |
| `IntegrationEvent` envelope | ✅ `@novacommerce/building-blocks` |
| P0 payload schemas (v1) | ✅ `@novacommerce/building-blocks` |
| `IEventBus` + `InMemoryEventBus` | ✅ `@novacommerce/building-blocks` |
| Outbox table | ✅ `outbox_messages` |
| Outbox Publisher | ✅ `workers/outbox-publisher` — publish via `IEventBus`, mark processed only on success |
| Module event handlers | 🚧 Inventory, Notification, and Search handlers subscribe on `InMemoryEventBus` |

Delivery semantics: **at-least-once**. A crash after publish but before marking processed may cause duplicate delivery — consumers must be idempotent.

Tiếp theo:

- Wire module Application handlers to `InMemoryEventBus`.
- Persist integration events to Outbox from Application use cases.
- When migrating to Kafka, replace `InMemoryEventBus` transport without changing envelope contracts.
