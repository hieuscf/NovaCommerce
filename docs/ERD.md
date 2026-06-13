# NovaCommerce - Entity Relationship Diagram

> **Kiến trúc:** Microservices — mỗi service có schema database riêng biệt.  
> Các service giao tiếp với nhau qua **Apache Kafka** (event-driven), không join trực tiếp qua DB.

---

## 1. Identity Service (PostgreSQL)

```mermaid
erDiagram
    USERS {
        uuid        id              PK
        varchar     username        UK
        varchar     email           UK
        varchar     password_hash
        varchar     phone
        varchar     full_name
        varchar     avatar_url
        varchar     status
        timestamp   last_login_at
        timestamp   created_at
        timestamp   updated_at
    }

    ROLES {
        uuid        id              PK
        varchar     name            UK
        varchar     description
        timestamp   created_at
    }

    PERMISSIONS {
        uuid        id              PK
        varchar     resource
        varchar     action
        varchar     description
    }

    USER_ROLES {
        uuid        user_id         FK
        uuid        role_id         FK
        timestamp   assigned_at
    }

    ROLE_PERMISSIONS {
        uuid        role_id         FK
        uuid        permission_id   FK
    }

    OAUTH_ACCOUNTS {
        uuid        id              PK
        uuid        user_id         FK
        varchar     provider
        varchar     provider_user_id
        varchar     access_token
        varchar     refresh_token
        timestamp   token_expires_at
        timestamp   created_at
    }

    REFRESH_TOKENS {
        uuid        id              PK
        uuid        user_id         FK
        varchar     token_hash      UK
        varchar     device_info
        boolean     is_revoked
        timestamp   expires_at
        timestamp   created_at
    }

    USERS        ||--o{ USER_ROLES       : "has"
    ROLES        ||--o{ USER_ROLES       : "assigned to"
    ROLES        ||--o{ ROLE_PERMISSIONS : "has"
    PERMISSIONS  ||--o{ ROLE_PERMISSIONS : "granted via"
    USERS        ||--o{ OAUTH_ACCOUNTS   : "linked"
    USERS        ||--o{ REFRESH_TOKENS   : "owns"
```

---

## 2. Catalog Service (PostgreSQL + Redis)

```mermaid
erDiagram
    CATEGORIES {
        uuid        id              PK
        uuid        parent_id       FK
        varchar     name
        varchar     slug            UK
        varchar     description
        varchar     image_url
        int         sort_order
        boolean     is_active
        timestamp   created_at
        timestamp   updated_at
    }

    BRANDS {
        uuid        id              PK
        varchar     name            UK
        varchar     slug            UK
        varchar     logo_url
        varchar     description
        boolean     is_active
        timestamp   created_at
    }

    PRODUCTS {
        uuid        id              PK
        uuid        category_id     FK
        uuid        brand_id        FK
        uuid        seller_id
        varchar     name
        varchar     slug            UK
        text        description
        varchar     status
        decimal     base_price
        decimal     compare_price
        jsonb       meta
        timestamp   created_at
        timestamp   updated_at
    }

    PRODUCT_IMAGES {
        uuid        id              PK
        uuid        product_id      FK
        varchar     url
        int         sort_order
        boolean     is_primary
    }

    ATTRIBUTES {
        uuid        id              PK
        varchar     name
        varchar     type
    }

    ATTRIBUTE_VALUES {
        uuid        id              PK
        uuid        attribute_id    FK
        varchar     value
    }

    PRODUCT_VARIANTS {
        uuid        id              PK
        uuid        product_id      FK
        varchar     sku             UK
        decimal     price
        decimal     compare_price
        int         weight
        jsonb       dimensions
        boolean     is_active
        timestamp   created_at
        timestamp   updated_at
    }

    VARIANT_ATTRIBUTE_VALUES {
        uuid        variant_id      FK
        uuid        attribute_value_id FK
    }

    WAREHOUSES {
        uuid        id              PK
        varchar     name
        varchar     address
        varchar     city
        varchar     country
        boolean     is_active
    }

    INVENTORY {
        uuid        id              PK
        uuid        variant_id      FK
        uuid        warehouse_id    FK
        int         quantity
        int         reserved
        int         low_stock_threshold
        timestamp   updated_at
    }

    CATEGORIES          ||--o{ CATEGORIES         : "parent"
    CATEGORIES          ||--o{ PRODUCTS            : "contains"
    BRANDS              ||--o{ PRODUCTS            : "owns"
    PRODUCTS            ||--o{ PRODUCT_IMAGES      : "has"
    PRODUCTS            ||--o{ PRODUCT_VARIANTS    : "has"
    ATTRIBUTES          ||--o{ ATTRIBUTE_VALUES    : "has"
    PRODUCT_VARIANTS    ||--o{ VARIANT_ATTRIBUTE_VALUES : "has"
    ATTRIBUTE_VALUES    ||--o{ VARIANT_ATTRIBUTE_VALUES : "used in"
    PRODUCT_VARIANTS    ||--o{ INVENTORY           : "tracked in"
    WAREHOUSES          ||--o{ INVENTORY           : "stores"
```

---

## 3. Commerce Service (PostgreSQL + Redis)

```mermaid
erDiagram
    CARTS {
        uuid        id              PK
        uuid        user_id
        varchar     status
        timestamp   expires_at
        timestamp   created_at
        timestamp   updated_at
    }

    CART_ITEMS {
        uuid        id              PK
        uuid        cart_id         FK
        uuid        variant_id
        uuid        product_id
        varchar     product_name
        varchar     variant_sku
        decimal     unit_price
        int         quantity
        jsonb       snapshot
        timestamp   added_at
    }

    COUPONS {
        uuid        id              PK
        varchar     code            UK
        varchar     type
        decimal     value
        decimal     min_order_amount
        decimal     max_discount_amount
        int         usage_limit
        int         used_count
        uuid        seller_id
        timestamp   starts_at
        timestamp   expires_at
        boolean     is_active
        timestamp   created_at
    }

    ORDERS {
        uuid        id              PK
        varchar     order_number    UK
        uuid        user_id
        uuid        coupon_id       FK
        varchar     status
        decimal     subtotal
        decimal     discount_amount
        decimal     shipping_fee
        decimal     tax_amount
        decimal     total_amount
        jsonb       shipping_address
        varchar     note
        timestamp   created_at
        timestamp   updated_at
    }

    ORDER_ITEMS {
        uuid        id              PK
        uuid        order_id        FK
        uuid        variant_id
        uuid        product_id
        varchar     product_name
        varchar     variant_sku
        decimal     unit_price
        int         quantity
        decimal     subtotal
        jsonb       snapshot
    }

    ORDER_STATUS_HISTORY {
        uuid        id              PK
        uuid        order_id        FK
        varchar     status
        varchar     note
        uuid        changed_by
        timestamp   created_at
    }

    RETURNS {
        uuid        id              PK
        uuid        order_id        FK
        varchar     reason
        varchar     status
        decimal     refund_amount
        text        description
        timestamp   requested_at
        timestamp   resolved_at
    }

    RETURN_ITEMS {
        uuid        id              PK
        uuid        return_id       FK
        uuid        order_item_id   FK
        int         quantity
        varchar     condition
    }

    CARTS               ||--o{ CART_ITEMS          : "contains"
    ORDERS              }o--o| COUPONS              : "applies"
    ORDERS              ||--o{ ORDER_ITEMS          : "contains"
    ORDERS              ||--o{ ORDER_STATUS_HISTORY : "tracks"
    ORDERS              ||--o{ RETURNS              : "has"
    RETURNS             ||--o{ RETURN_ITEMS         : "includes"
    ORDER_ITEMS         ||--o{ RETURN_ITEMS         : "referenced in"
```

---

## 4. Fulfillment Service (PostgreSQL)

```mermaid
erDiagram
    PAYMENT_METHODS {
        uuid        id              PK
        varchar     name
        varchar     provider
        varchar     type
        boolean     is_active
        jsonb       config
    }

    PAYMENTS {
        uuid        id              PK
        uuid        order_id
        uuid        payment_method_id FK
        varchar     transaction_id  UK
        decimal     amount
        varchar     currency
        varchar     status
        varchar     gateway_response
        jsonb       metadata
        timestamp   paid_at
        timestamp   created_at
        timestamp   updated_at
    }

    REFUNDS {
        uuid        id              PK
        uuid        payment_id      FK
        uuid        return_id
        decimal     amount
        varchar     status
        varchar     reason
        varchar     gateway_ref
        timestamp   requested_at
        timestamp   processed_at
    }

    SHIPPING_CARRIERS {
        uuid        id              PK
        varchar     name
        varchar     code            UK
        varchar     api_endpoint
        boolean     is_active
    }

    SHIPMENTS {
        uuid        id              PK
        uuid        order_id
        uuid        carrier_id      FK
        varchar     tracking_number UK
        varchar     status
        jsonb       origin_address
        jsonb       destination_address
        decimal     weight
        decimal     shipping_fee
        timestamp   picked_up_at
        timestamp   estimated_delivery
        timestamp   delivered_at
        timestamp   created_at
        timestamp   updated_at
    }

    SHIPMENT_TRACKING {
        uuid        id              PK
        uuid        shipment_id     FK
        varchar     status
        varchar     location
        varchar     description
        timestamp   event_time
    }

    INVOICES {
        uuid        id              PK
        uuid        order_id
        uuid        seller_id
        varchar     invoice_number  UK
        decimal     subtotal
        decimal     commission_fee
        decimal     net_amount
        varchar     status
        timestamp   issued_at
        timestamp   settled_at
    }

    PAYMENT_METHODS     ||--o{ PAYMENTS             : "used in"
    PAYMENTS            ||--o{ REFUNDS              : "refunded via"
    SHIPPING_CARRIERS   ||--o{ SHIPMENTS            : "handles"
    SHIPMENTS           ||--o{ SHIPMENT_TRACKING    : "tracked by"
```

---

## 5. Engagement Service (PostgreSQL + Redis + Kafka)

```mermaid
erDiagram
    REVIEWS {
        uuid        id              PK
        uuid        product_id
        uuid        order_item_id
        uuid        user_id
        int         rating
        varchar     title
        text        content
        varchar     status
        boolean     is_verified_purchase
        int         helpful_count
        timestamp   created_at
        timestamp   updated_at
    }

    REVIEW_IMAGES {
        uuid        id              PK
        uuid        review_id       FK
        varchar     url
        int         sort_order
    }

    REVIEW_VOTES {
        uuid        user_id
        uuid        review_id       FK
        boolean     is_helpful
        timestamp   voted_at
    }

    REVIEW_REPORTS {
        uuid        id              PK
        uuid        review_id       FK
        uuid        reporter_id
        varchar     reason
        varchar     status
        timestamp   created_at
    }

    NOTIFICATIONS {
        uuid        id              PK
        uuid        user_id
        varchar     type
        varchar     channel
        varchar     title
        text        content
        jsonb       data
        boolean     is_read
        timestamp   read_at
        timestamp   sent_at
        timestamp   created_at
    }

    NOTIFICATION_TEMPLATES {
        uuid        id              PK
        varchar     code            UK
        varchar     channel
        varchar     subject
        text        body_template
        boolean     is_active
    }

    CHAT_CONVERSATIONS {
        uuid        id              PK
        uuid        user_id
        uuid        support_agent_id
        varchar     status
        varchar     subject
        timestamp   last_message_at
        timestamp   created_at
        timestamp   closed_at
    }

    CHAT_MESSAGES {
        uuid        id              PK
        uuid        conversation_id FK
        uuid        sender_id
        varchar     sender_type
        text        content
        varchar     message_type
        jsonb       attachments
        timestamp   sent_at
        boolean     is_read
    }

    REVIEWS                 ||--o{ REVIEW_IMAGES     : "has"
    REVIEWS                 ||--o{ REVIEW_VOTES      : "receives"
    REVIEWS                 ||--o{ REVIEW_REPORTS    : "reported via"
    CHAT_CONVERSATIONS      ||--o{ CHAT_MESSAGES     : "contains"
```

---

## 6. Discovery Service (Elasticsearch + Qdrant)

> Discovery Service chủ yếu dùng **Elasticsearch** (full-text search) và **Qdrant** (vector search).  
> Dữ liệu được đồng bộ từ Catalog Service qua Kafka — không lưu trữ trong PostgreSQL riêng.

```mermaid
erDiagram
    SEARCH_INDEX_PRODUCTS {
        string      id              PK
        string      name
        string      description
        string      category_path
        string      brand_name
        decimal     price
        decimal     compare_price
        float       avg_rating
        int         review_count
        int         sold_count
        boolean     in_stock
        string      seller_id
        vector      embedding
        datetime    indexed_at
    }

    SEARCH_SUGGESTIONS {
        string      id              PK
        string      keyword
        int         search_count
        float       weight
        datetime    updated_at
    }

    USER_SEARCH_HISTORY {
        string      id              PK
        string      user_id
        string      query
        int         result_count
        datetime    searched_at
    }

    TRENDING_KEYWORDS {
        string      keyword         PK
        int         search_count
        float       trend_score
        string      period
        datetime    calculated_at
    }

    SEARCH_INDEX_PRODUCTS   ||--o{ USER_SEARCH_HISTORY    : "found via"
    SEARCH_SUGGESTIONS      }o--o{ TRENDING_KEYWORDS      : "derived from"
```

---

## 7. Data Platform (ClickHouse — Analytics Warehouse)

```mermaid
erDiagram
    FACT_ORDERS {
        uuid        order_id        PK
        uuid        user_id
        uuid        seller_id
        date        order_date
        varchar     status
        decimal     subtotal
        decimal     discount
        decimal     shipping_fee
        decimal     total
        varchar     payment_method
        varchar     channel
        timestamp   created_at
    }

    FACT_ORDER_ITEMS {
        uuid        id              PK
        uuid        order_id        FK
        uuid        product_id
        uuid        category_id
        uuid        brand_id
        decimal     unit_price
        int         quantity
        decimal     revenue
        date        order_date
    }

    FACT_PAGEVIEWS {
        uuid        id              PK
        uuid        user_id
        uuid        product_id
        varchar     session_id
        varchar     source
        varchar     device_type
        varchar     country
        int         duration_sec
        timestamp   viewed_at
    }

    FACT_SEARCH_EVENTS {
        uuid        id              PK
        uuid        user_id
        varchar     query
        int         result_count
        boolean     clicked
        uuid        clicked_product_id
        varchar     device_type
        timestamp   searched_at
    }

    DIM_DATE {
        date        date_key        PK
        int         year
        int         quarter
        int         month
        int         week
        int         day
        varchar     day_name
        boolean     is_weekend
    }

    DIM_USERS {
        uuid        user_id         PK
        varchar     segment
        varchar     country
        varchar     registration_channel
        date        first_order_date
        int         total_orders
        decimal     lifetime_value
    }

    DIM_PRODUCTS {
        uuid        product_id      PK
        varchar     name
        varchar     category
        varchar     brand
        varchar     seller_id
        decimal     current_price
    }

    FACT_ORDERS         }o--|| DIM_DATE          : "on"
    FACT_ORDERS         }o--|| DIM_USERS         : "by"
    FACT_ORDER_ITEMS    }o--|| FACT_ORDERS        : "part of"
    FACT_ORDER_ITEMS    }o--|| DIM_PRODUCTS       : "for"
    FACT_PAGEVIEWS      }o--|| DIM_PRODUCTS       : "views"
    FACT_PAGEVIEWS      }o--|| DIM_USERS          : "by"
```

---

## 8. Tổng quan Luồng Dữ liệu Giữa Các Service

```mermaid
erDiagram
    IDENTITY_SERVICE {
        string  publishes  "user-events"
        string  stores     "users, roles, permissions"
    }

    CATALOG_SERVICE {
        string  publishes  "product-events, inventory-events"
        string  consumes   "user-events"
        string  stores     "products, variants, inventory"
    }

    COMMERCE_SERVICE {
        string  publishes  "cart-events, order-events"
        string  consumes   "user-events, product-events"
        string  stores     "carts, orders, coupons"
    }

    FULFILLMENT_SERVICE {
        string  publishes  "payment-events, shipping-events"
        string  consumes   "order-events"
        string  stores     "payments, shipments, invoices"
    }

    ENGAGEMENT_SERVICE {
        string  publishes  "review-events, notification-events"
        string  consumes   "order-events, payment-events"
        string  stores     "reviews, notifications, chats"
    }

    DISCOVERY_SERVICE {
        string  consumes   "product-events, order-events, review-events"
        string  stores     "search index (Elasticsearch + Qdrant)"
    }

    DATA_PLATFORM {
        string  consumes   "all-events via CDC + Kafka"
        string  stores     "ClickHouse warehouse"
    }

    IDENTITY_SERVICE    ||--o{ COMMERCE_SERVICE     : "authenticates"
    IDENTITY_SERVICE    ||--o{ CATALOG_SERVICE      : "authenticates"
    CATALOG_SERVICE     ||--o{ DISCOVERY_SERVICE    : "syncs product data"
    COMMERCE_SERVICE    ||--o{ FULFILLMENT_SERVICE  : "triggers payment/shipping"
    COMMERCE_SERVICE    ||--o{ ENGAGEMENT_SERVICE   : "triggers notifications"
    FULFILLMENT_SERVICE ||--o{ ENGAGEMENT_SERVICE   : "triggers notifications"
    DATA_PLATFORM       }o--|| CATALOG_SERVICE      : "ingests via CDC"
    DATA_PLATFORM       }o--|| COMMERCE_SERVICE     : "ingests via CDC"
    DATA_PLATFORM       }o--|| FULFILLMENT_SERVICE  : "ingests via CDC"
```

---

## Ghi chú Thiết kế

| Nguyên tắc | Chi tiết |
|---|---|
| **Database per Service** | Mỗi microservice có schema PostgreSQL/Redis riêng, không share database |
| **Event-Driven Communication** | Các service không gọi DB của nhau; giao tiếp qua Kafka topics |
| **CQRS Pattern** | Discovery Service dùng Elasticsearch/Qdrant riêng cho read — tối ưu query |
| **Polyglot Persistence** | PostgreSQL (OLTP), Redis (cache/session), Elasticsearch (search), Qdrant (vector), ClickHouse (OLAP) |
| **Soft Delete** | Các entity quan trọng (users, products, orders) dùng `status` thay vì xóa cứng |
| **Audit Trail** | Order status history, shipment tracking lưu toàn bộ lịch sử thay đổi |
| **Data Snapshot** | `ORDER_ITEMS.snapshot` lưu thông tin sản phẩm tại thời điểm đặt hàng — tránh mất dữ liệu khi product thay đổi |
