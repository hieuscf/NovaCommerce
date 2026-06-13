# PROJECT_CONTEXT — NovaCommerce

> **Mục đích file này:** Cung cấp toàn bộ ngữ cảnh dự án cho Cursor AI Agent.  
> Agent phải đọc file này trước khi thực hiện bất kỳ task nào liên quan đến NovaCommerce.

---

## 1. TÊN & MỤC TIÊU DỰ ÁN

**Tên:** NovaCommerce — Enterprise Commerce & Intelligence Platform  
**Slogan:** Build. Sell. Analyze. Scale.  
**Phân loại:** Nền tảng Thương mại Điện tử Doanh nghiệp (B2B2C)  
**Kiến trúc:** Microservices + Event-Driven + Data Platform  
**Mục tiêu:** Xây dựng nền tảng thương mại điện tử quy mô doanh nghiệp, tích hợp AI, phân tích dữ liệu thời gian thực, giao dịch an toàn và trải nghiệm mua sắm tối ưu.

---

## 2. TECH STACK

### Backend

| Thành phần      | Công nghệ                 | Ghi chú                                |
| --------------- | ------------------------- | -------------------------------------- |
| Language        | **Go (Golang)**           | Toàn bộ microservices                  |
| Framework       | **Gin**                   | HTTP router & middleware               |
| Primary DB      | **PostgreSQL**            | OLTP, mỗi service 1 schema riêng       |
| Cache / Session | **Redis**                 | Cache, session, cart tạm               |
| Search          | **Elasticsearch**         | Full-text search                       |
| Vector DB       | **Qdrant**                | AI semantic search                     |
| Analytics DB    | **ClickHouse**            | OLAP, column-oriented                  |
| Message Broker  | **Apache Kafka**          | Event streaming, service communication |
| CDC             | **Debezium**              | Capture DB changes → Kafka             |
| Data Processing | **Apache Spark**          | Batch & stream ETL                     |
| Orchestration   | **Apache Airflow**        | Pipeline scheduling                    |
| Object Storage  | **MinIO (S3-compatible)** | Data lake, file storage                |

### Frontend

| Thành phần          | Công nghệ                        |
| ------------------- | -------------------------------- |
| Web Store           | React + TypeScript + TailwindCSS |
| Mobile App          | React Native (iOS & Android)     |
| Seller Center       | React + TypeScript + TailwindCSS |
| Admin Portal        | React + TypeScript + TailwindCSS |
| Analytics Dashboard | Apache Superset                  |

### Infrastructure & DevOps

| Thành phần        | Công nghệ                       |
| ----------------- | ------------------------------- |
| Container         | Docker                          |
| Orchestration     | Kubernetes (K8s)                |
| Package Manager   | Helm                            |
| Ingress           | Nginx                           |
| Service Mesh      | Istio                           |
| GitOps / CD       | ArgoCD                          |
| Auto-scaling      | HPA (Horizontal Pod Autoscaler) |
| Secret Management | K8s ConfigMap & Secrets         |

### Observability

| Thành phần   | Vai trò                               |
| ------------ | ------------------------------------- |
| Prometheus   | Metrics collection                    |
| Grafana      | Dashboard & alerting                  |
| Loki         | Log aggregation                       |
| Tempo        | Distributed tracing                   |
| Alertmanager | Alert routing (Slack/Email/PagerDuty) |

### Network & Security

| Thành phần       | Vai trò                   |
| ---------------- | ------------------------- |
| Cloudflare       | DNS, CDN, DDoS protection |
| Cloudflare WAF   | Web Application Firewall  |
| Nginx            | Load Balancer             |
| Kong / Nginx BFF | API Gateway               |

---

## 3. KIẾN TRÚC MICROSERVICES

Hệ thống gồm **6 Core Business Services**, mỗi service:

- Có database riêng biệt (Database per Service pattern)
- Giao tiếp qua **Apache Kafka** (không gọi DB trực tiếp của service khác)
- Deploy độc lập trên Kubernetes

```
[Client] → [Cloudflare CDN/WAF] → [Nginx Load Balancer] → [API Gateway Kong/Nginx]
    ↓
[Identity] [Catalog] [Commerce] [Fulfillment] [Engagement] [Discovery]
    ↓               ↓
[Apache Kafka Event Bus]
    ↓
[Data Platform: Debezium → Kafka → Spark → MinIO → ClickHouse → Superset]
```

---

## 4. CHI TIẾT TỪNG SERVICE

### 4.1 Identity Service

- **Chức năng:** Authentication, Authorization, User Management
- **DB:** PostgreSQL
- **Công nghệ đặc biệt:** JWT, OAuth2, RBAC
- **Kafka publish:** `user-events`
- **Entities chính:** `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `oauth_accounts`, `refresh_tokens`
- **Lưu ý code:** Mọi request vào hệ thống đều phải qua Identity Service để verify token. Dùng middleware JWT ở API Gateway tầng Kong.

### 4.2 Catalog Service

- **Chức năng:** Quản lý sản phẩm, danh mục, thương hiệu, tồn kho
- **DB:** PostgreSQL + Redis (cache product)
- **Kafka publish:** `product-events`, `inventory-events`
- **Kafka consume:** `user-events`
- **Entities chính:** `products`, `product_variants`, `categories`, `brands`, `attributes`, `attribute_values`, `warehouses`, `inventory`
- **Lưu ý code:** Product có thể có nhiều `variants` (size, color). `inventory` theo dõi per `variant` per `warehouse`. Cache Redis cho product detail với TTL.

### 4.3 Commerce Service

- **Chức năng:** Giỏ hàng, đặt hàng, mã giảm giá, hoàn trả
- **DB:** PostgreSQL + Redis (cart session)
- **Kafka publish:** `cart-events`, `order-events`
- **Kafka consume:** `user-events`, `product-events`
- **Entities chính:** `carts`, `cart_items`, `orders`, `order_items`, `order_status_history`, `coupons`, `returns`, `return_items`
- **Lưu ý code:** `order_items` lưu `snapshot` (jsonb) — snapshot thông tin sản phẩm tại thời điểm đặt hàng để tránh mất dữ liệu khi product thay đổi giá. Cart dùng Redis với TTL. Order status flow: `pending` → `confirmed` → `processing` → `shipped` → `delivered` | `cancelled`.

### 4.4 Fulfillment Service

- **Chức năng:** Thanh toán, vận chuyển, hóa đơn
- **DB:** PostgreSQL + Redis
- **Kafka publish:** `payment-events`, `shipping-events`
- **Kafka consume:** `order-events`
- **Entities chính:** `payments`, `payment_methods`, `refunds`, `shipments`, `shipping_carriers`, `shipment_tracking`, `invoices`
- **Lưu ý code:** Tích hợp payment gateway qua adapter pattern (dễ thêm provider mới). Shipment tracking lưu full history từng event. Invoice settlement cho seller.

### 4.5 Engagement Service

- **Chức năng:** Đánh giá sản phẩm, thông báo đa kênh, chat hỗ trợ
- **DB:** PostgreSQL + Redis + Kafka
- **Kafka publish:** `review-events`, `notification-events`
- **Kafka consume:** `order-events`, `payment-events`, `shipping-events`
- **Entities chính:** `reviews`, `review_images`, `review_votes`, `review_reports`, `notifications`, `notification_templates`, `chat_conversations`, `chat_messages`
- **Lưu ý code:** Notification gửi qua Email/SMS/Push — dùng template engine. Chat dùng WebSocket. Review chỉ cho phép nếu user đã mua hàng (`is_verified_purchase`).

### 4.6 Discovery Service

- **Chức năng:** Tìm kiếm, gợi ý, cá nhân hóa, trending
- **DB:** Elasticsearch (full-text) + Qdrant (vector/semantic)
- **Kafka consume:** `product-events`, `order-events`, `review-events`
- **Không có PostgreSQL riêng** — dữ liệu đồng bộ từ Catalog qua Kafka
- **Lưu ý code:** Product được index vào Elasticsearch khi nhận `product-events`. Vector embedding lưu trong Qdrant cho AI semantic search. Auto-complete dùng Elasticsearch suggest. Recommendation dùng collaborative filtering + content-based.

---

## 5. KAFKA TOPICS

| Topic                 | Producer    | Consumers                                         |
| --------------------- | ----------- | ------------------------------------------------- |
| `user-events`         | Identity    | Catalog, Commerce, Engagement                     |
| `product-events`      | Catalog     | Commerce, Discovery, Data Platform                |
| `inventory-events`    | Catalog     | Commerce, Data Platform                           |
| `cart-events`         | Commerce    | Data Platform                                     |
| `order-events`        | Commerce    | Fulfillment, Engagement, Discovery, Data Platform |
| `payment-events`      | Fulfillment | Engagement, Data Platform                         |
| `shipping-events`     | Fulfillment | Engagement, Data Platform                         |
| `review-events`       | Engagement  | Discovery, Data Platform                          |
| `notification-events` | Engagement  | Notification Service                              |

---

## 6. VAI TRÒ NGƯỜI DÙNG (RBAC)

| Role       | Mô tả                            | Quyền chính                                           |
| ---------- | -------------------------------- | ----------------------------------------------------- |
| `customer` | Người mua hàng                   | Browse, add to cart, order, review, track delivery    |
| `seller`   | Nhà bán hàng                     | Manage products, process orders, view revenue reports |
| `admin`    | Quản trị viên                    | Full access: users, sellers, system config            |
| `analyst`  | Phân tích viên                   | Read-only Superset dashboard, ClickHouse queries      |
| `partner`  | Đối tác (vận chuyển, thanh toán) | API access theo scope đã thỏa thuận                   |

---

## 7. GIAO DIỆN NGƯỜI DÙNG

| Channel       | Framework           | Target Users | Đặc điểm                            |
| ------------- | ------------------- | ------------ | ----------------------------------- |
| Web Store     | React + TailwindCSS | Customer     | SEO-optimized, SSR/SSG              |
| Mobile App    | React Native        | Customer     | iOS & Android, offline-first        |
| Seller Center | React + TailwindCSS | Seller       | Dashboard, product/order management |
| Admin Portal  | React + TailwindCSS | Admin        | System management, config           |
| Analytics     | Apache Superset     | Analyst      | BI dashboards, no-code reports      |

---

## 8. AI & INTELLIGENCE MODULES

| Module                    | Mô tả                                                               | Công nghệ                                 |
| ------------------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| **AI Search**             | Semantic search — hiểu intent người dùng, không chỉ match keyword   | Qdrant + Embedding models                 |
| **Recommendation Engine** | Gợi ý sản phẩm dựa trên behavior, purchase history, trending        | ML models (collaborative + content-based) |
| **Shopping Assistant**    | LLM chatbot tư vấn sản phẩm, hỗ trợ đặt hàng bằng ngôn ngữ tự nhiên | LLM (OpenAI / local model)                |
| **Fraud Detection**       | Phát hiện giao dịch gian lận real-time                              | ML model (anomaly detection)              |

---

## 9. DATA PLATFORM PIPELINE

```
[PostgreSQL DBs] → [Debezium CDC] → [Kafka Raw Events]
                                          ↓
[User Behavior Logs] → [Log Collector] → [Kafka]
                                          ↓
                              [Apache Spark ETL]
                             /          |          \
                    [Bronze]       [Silver]       [Gold]
                   (Raw/MinIO)  (Cleaned/MinIO)  (ClickHouse)
                                                      ↓
                                           [Apache Superset]
                                           [Analytics APIs]
```

**ClickHouse Schema pattern:** Star schema với Fact tables (`fact_orders`, `fact_order_items`, `fact_pageviews`, `fact_search_events`) và Dimension tables (`dim_date`, `dim_users`, `dim_products`).

---

## 10. NON-FUNCTIONAL REQUIREMENTS

| Yêu cầu       | Mục tiêu              | Giải pháp                                                   |
| ------------- | --------------------- | ----------------------------------------------------------- |
| Availability  | 99.9% uptime          | K8s auto-restart, no SPOF                                   |
| API Latency   | < 200ms p99           | Redis cache, CDN, connection pooling                        |
| Scalability   | Auto horizontal scale | K8s HPA theo CPU/memory/custom metrics                      |
| Reliability   | Zero data loss        | Kafka durability, Saga pattern cho distributed transactions |
| Security      | Zero-trust            | RBAC, JWT, TLS everywhere, WAF                              |
| Observability | Full-stack visibility | Prometheus + Grafana + Loki + Tempo                         |

---

## 11. CODING CONVENTIONS & PATTERNS

### Go Service Structure

```
/service-name
  /cmd
    /server         # main entrypoint
  /internal
    /domain         # entities, value objects, repository interfaces
    /application    # use cases / services
    /infrastructure
      /persistence  # PostgreSQL repositories
      /cache        # Redis
      /messaging    # Kafka producers/consumers
      /http         # Gin handlers, middleware, routes
  /pkg              # shared utilities
  /migrations       # SQL migration files
  /config           # configuration
```

### Key Patterns

- **Repository Pattern** — domain không phụ thuộc vào infrastructure
- **Dependency Injection** — inject repositories vào use cases
- **Outbox Pattern** — đảm bảo at-least-once delivery khi publish Kafka events
- **Saga Pattern** — xử lý distributed transactions (ví dụ: order creation → payment → inventory deduct)
- **CQRS** — Discovery Service tách read model (Elasticsearch) khỏi write model
- **Snapshot in Order Items** — luôn lưu snapshot khi tạo order_item
- **Soft Delete** — dùng `deleted_at timestamp` hoặc `status` thay vì hard delete
- **Pagination** — cursor-based pagination cho list APIs (không dùng offset với large dataset)
- **Idempotency** — mọi Kafka consumer phải idempotent (dùng `idempotency_key`)

### API Conventions

- RESTful endpoints: `GET /api/v1/products`, `POST /api/v1/orders`
- Response format:

```json
{
  "data": { ... },
  "meta": { "page": 1, "total": 100 },
  "error": null
}
```

- Error format:

```json
{
  "data": null,
  "error": { "code": "NOT_FOUND", "message": "Product not found" }
}
```

- Auth: `Authorization: Bearer <jwt_token>` header

### Database Conventions

- UUID v4 cho tất cả primary keys
- `created_at`, `updated_at` timestamp (UTC) trên mọi table
- Index trên FK columns và các cột query thường xuyên
- Dùng `jsonb` cho flexible/schemaless data (snapshot, metadata, config)
- Migration tool: **golang-migrate**

---

## 12. ENVIRONMENT & DEPLOYMENT

### Local Development

```bash
# Start all services
docker-compose up -d

# Services ports (local)
# API Gateway:     :8080
# Identity:        :8081
# Catalog:         :8082
# Commerce:        :8083
# Fulfillment:     :8084
# Engagement:      :8085
# Discovery:       :8086

# Infrastructure ports (local)
# PostgreSQL:      :5432
# Redis:           :6379
# Kafka:           :9092
# Elasticsearch:   :9200
# Qdrant:          :6333
# MinIO:           :9000
# ClickHouse:      :8123
```

### CI/CD Pipeline

```
git push → GitHub Actions → Build & Test → Docker Build → Security Scan → Push Registry
                                                                               ↓
                                                                    ArgoCD detects → Deploy K8s
```

### Environments

- `development` — local Docker Compose
- `staging` — K8s cluster, mirrors production
- `production` — K8s cluster, multi-AZ, auto-scaling enabled

---

## 13. FILE & FOLDER STRUCTURE (MONOREPO)

```
/Novacommerce
  /services
    /identity-service
    /catalog-service
    /commerce-service
    /fulfillment-service
    /engagement-service
    /discovery-service
    /notification-service   # shared supporting service
    /file-service           # shared supporting service
    /analytics-service      # shared supporting service
  /frontend
    /web-store              # React (Customer)
    /seller-center          # React (Seller)
    /admin-portal           # React (Admin)
  /data-platform
    /spark-jobs
    /airflow-dags
    /clickhouse-schemas
  /infrastructure
    /kubernetes
      /helm-charts
      /argocd
    /docker-compose
    /terraform              # IaC for cloud
  /docs
    /ERD.md
    /PROJECT_CONTEXT.md
    /api-specs              # OpenAPI specs per service
```

---

## 14. QUICK REFERENCE — AGENT INSTRUCTIONS

Khi nhận task liên quan đến NovaCommerce, agent cần:

1. **Xác định service** — task thuộc service nào trong 6 core services
2. **Kiểm tra DB** — service đó dùng PostgreSQL/Redis/Elasticsearch/Qdrant
3. **Kiểm tra Kafka** — nếu action tạo ra side-effect (ví dụ: tạo order → publish `order-events`)
4. **Tuân thủ patterns** — Repository Pattern, Outbox, Saga, Snapshot
5. **API format** — luôn dùng response/error format chuẩn ở trên
6. **Auth** — mọi protected endpoint cần JWT middleware
7. **Không cross-DB** — không query DB của service khác, dùng Kafka để lấy data
8. **Idempotency** — consumer luôn idempotent, handler luôn check duplicate

---

_NovaCommerce — Build for the future_  
_Enterprise Commerce & Intelligence Platform | Build. Sell. Analyze. Scale._
