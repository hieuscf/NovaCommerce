NovaCommerce Database Design

Version: 0.1.0
Status: Foundation Design
Last Updated: 2026-09-09

1. Purpose

Thiết kế database cho NovaCommerce dựa trên Domain Model và Architecture hiện tại.

Mục tiêu:

PostgreSQL là transactional database chính.

Mỗi Bounded Context sở hữu model/data của mình.

Không truy cập trực tiếp data của Context khác.

Thiết kế phù hợp với Modular Monolith và có thể tách Microservices sau này.

Outbox dùng để đảm bảo event được lưu cùng transaction.

Đây là logical database design. Chi tiết Prisma migration/index/constraint sẽ được bổ sung khi implementation bắt đầu.

2. Database Strategy

PostgreSQL
│
├── Identity
├── User
├── Catalog
├── Cart
├── Checkout
├── Order
├── Inventory
├── Payment
├── Shipping
├── Promotion
├── Notification
├── Review
├── CMS
└── Outbox

Trong giai đoạn Modular Monolith: một PostgreSQL, logical ownership theo module.

Search và Analytics không dùng PostgreSQL làm search/read store chính:

Search → OpenSearch

Analytics → Read Models / projections

MinIO dùng cho binary/object storage.

3. Core Tables

Identity

identities

credentials

external_identities

refresh_sessions

User

users

user_profiles

user_addresses

user_preferences

Catalog

products

product_variants

product_images

product_attributes

categories

Cart

carts

cart_items

Checkout

checkout_sessions

checkout_lines

checkout_adjustments

Order

orders

order_lines

order_adjustments

order_addresses

Inventory

inventory_items

stock_reservations

stock_adjustments

Payment

payments

payment_attempts

payment_transactions

Shipping

shipments

shipment_items

tracking_records

Promotion

promotions

promotion_rules

promotion_benefits

coupons

coupon_redemptions

Notification

notifications

notification_deliveries

Review

reviews

review_media

CMS

contents

content_revisions

Outbox

outbox_messages

outbox_messages là infrastructure table dùng cho Outbox Pattern, không phải business Aggregate.

4. Ownership Rules

Data

Owner

Identity credentials

Identity

User profile/address

User

Product/category

Catalog

Cart

Cart

Checkout session

Checkout

Order

Order

Stock/reservation

Inventory

Payment

Payment

Shipment

Shipping

Promotion/coupon

Promotion

Notification

Notification

Review

Review

Content

CMS

Search document

OpenSearch

Analytics model

Analytics

Không tạo foreign key để biến data ownership của module này thành dependency trực tiếp vào bảng business của module khác nếu dependency đó phá vỡ Bounded Context.

Cross-context reference dùng ID/public contract.

5. Key Relationships

Identity 1 ── 1 User

User 1 ── N UserAddress

Category 1 ── N Product
Product 1 ── N ProductVariant
Product 1 ── N ProductImage

Cart 1 ── N CartItem
CartItem ──> ProductVariant (reference)

CheckoutSession 1 ── N CheckoutLine

Order 1 ── N OrderLine
Order 1 ── N OrderAdjustment
Order 1 ── N OrderAddress

InventoryItem 1 ── N StockReservation
InventoryItem 1 ── N StockAdjustment

Payment 1 ── N PaymentAttempt
PaymentAttempt 1 ── N PaymentTransaction

Shipment 1 ── N ShipmentItem
Shipment 1 ── N TrackingRecord

Promotion 1 ── N PromotionRule
Promotion 1 ── N PromotionBenefit
Coupon 1 ── N CouponRedemption

Notification 1 ── N NotificationDelivery

Review 1 ── N ReviewMedia

Content 1 ── N ContentRevision

Các quan hệ có mũi tên ProductVariant, User, Order... giữa Context được hiểu là logical reference, không nhất thiết là database FK xuyên module.

6. Transaction Boundaries

Order + Outbox

BEGIN
│
├── Save Order
├── Save Order Lines
└── Save Outbox Message
│
COMMIT
│
Worker
│
Publish Event

Không publish event trực tiếp trong transaction.

7. Outbox Model

outbox_messages tối thiểu cần các thông tin:

id

event_type

aggregate_type

aggregate_id

payload

occurred_at

published_at

retry_count

last_error

Tên field có thể điều chỉnh theo Prisma implementation hiện tại.

8. Database / Infrastructure Mapping

Concern

Technology

Transactional data

PostgreSQL

ORM

Prisma

Cache

Redis

Search

OpenSearch

Object storage

MinIO

Event publishing

Outbox → In-Memory Event Bus / Kafka future

9. ERD

erDiagram
IDENTITY ||--|| USER : owns
USER ||--o{ USER_ADDRESS : has

    CATEGORY ||--o{ PRODUCT : contains
    PRODUCT ||--o{ PRODUCT_VARIANT : has
    PRODUCT ||--o{ PRODUCT_IMAGE : has

    CART ||--o{ CART_ITEM : contains
    CHECKOUT_SESSION ||--o{ CHECKOUT_LINE : contains

    ORDER ||--o{ ORDER_LINE : contains
    ORDER ||--o{ ORDER_ADJUSTMENT : has
    ORDER ||--o{ ORDER_ADDRESS : has

    INVENTORY_ITEM ||--o{ STOCK_RESERVATION : has
    INVENTORY_ITEM ||--o{ STOCK_ADJUSTMENT : has

    PAYMENT ||--o{ PAYMENT_ATTEMPT : has
    PAYMENT_ATTEMPT ||--o{ PAYMENT_TRANSACTION : contains

    SHIPMENT ||--o{ SHIPMENT_ITEM : contains
    SHIPMENT ||--o{ TRACKING_RECORD : has

    PROMOTION ||--o{ PROMOTION_RULE : has
    PROMOTION ||--o{ PROMOTION_BENEFIT : has
    COUPON ||--o{ COUPON_REDEMPTION : has

    NOTIFICATION ||--o{ NOTIFICATION_DELIVERY : has
    REVIEW ||--o{ REVIEW_MEDIA : has
    CONTENT ||--o{ CONTENT_REVISION : has

ERD Scope

ERD hiện tập trung vào Aggregate/Entity ownership, chưa cố định toàn bộ column-level schema.

Các logical references quan trọng:

CartItem → ProductVariant
CheckoutLine → ProductVariant
OrderLine → ProductVariant
Order → User
InventoryItem → ProductVariant
Review → Product

Các reference này không đồng nghĩa với việc module được phép truy cập trực tiếp Entity/Repository của module khác.

10. Indexing Guidelines

Các index cụ thể sẽ được xác định khi có query/use case thực tế.

Ưu tiên index cho:

Primary Key

Unique business identifiers

Foreign-key/reference columns trong cùng Context

Status + timestamp cho lifecycle queries

outbox_messages.published_at

outbox_messages.occurred_at

Không tạo index hàng loạt trước khi có query requirements.

11. Migration Strategy

Thiết kế Domain Model.

Chốt database model.

Implement Prisma schema.

Generate migration.

Integration tests.

Seed data cho development.

Kiểm tra migration backward compatibility.

Khi tách Microservice, migrate ownership của từng Context.

12. Current Status

Repository hiện mới có Outbox table/model, business domain tables chưa được implementation hoàn chỉnh.

Vì vậy document này là logical baseline, không phải mô tả schema đã tồn tại.
