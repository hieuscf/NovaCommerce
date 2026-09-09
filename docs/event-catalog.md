NovaCommerce Event Catalog

> **Version:** 0.1.0  
> **Status:** Foundation Design  
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
UserCreated	User	User được tạo
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
ProductUpdated
    ↓
Search Indexer
    ↓
OpenSearch

Search không query PostgreSQL trực tiếp để thực hiện product search.

5.5 Payment → Order
PaymentSucceeded
    ↓
Order Handler
    ↓
Update Order State

Order chỉ phản ứng với business event; Payment không sửa trực tiếp Order Entity.

6. Event Payload

Mỗi event nên có envelope tối thiểu:

eventId
eventType
aggregateType
aggregateId
occurredAt
payload
metadata

Metadata có thể chứa:

correlationId
causationId
requestId
version

Ví dụ:

{
  "eventId": "uuid",
  "eventType": "order.created",
  "aggregateType": "Order",
  "aggregateId": "order-id",
  "occurredAt": "timestamp",
  "payload": {},
  "metadata": {
    "correlationId": "uuid",
    "causationId": "uuid",
    "version": 1
  }
}

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

Khi thay đổi breaking:

order.created.v1
order.created.v2

Không silently thay đổi payload của event đang được consumer sử dụng.

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
OrderCreated
StockReserved
PaymentSucceeded
ProductUpdated
CartItemAdded
CheckoutCompleted
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
Search indexing events
AI consumption events

P2 event payloads sẽ được chốt khi Search, Analytics và AI use cases được triển khai.

13. Current Status

Đây là event design baseline, chưa phải implementation.

Hiện repository mới có Outbox model/worker stub; business event handlers chưa được triển khai hoàn chỉnh.

Tiếp theo:

Chốt payload cho P0 events.
Implement Domain Events trong Aggregates.
Implement Event Bus.
Hoàn thiện Outbox Publisher.
Viết Integration/Event Contract Tests.
Khi chuyển Kafka, map Domain Event → Integration Event.
```
