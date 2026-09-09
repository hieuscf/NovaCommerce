# NovaCommerce Architecture

> **Project:** NovaCommerce
> **Architecture Version:** 1.0
> **Status:** Modular Monolith (Ready for Microservices)
> **Primary Language:** TypeScript
> **AI Platform:** Python
> **Architecture Style:** Domain Driven Design + Clean Architecture + Event Driven Architecture

---

# 1. Architecture Vision

NovaCommerce được thiết kế theo triết lý:

> **Build as a Modular Monolith today, evolve into Event-Driven Microservices tomorrow.**

Mục tiêu của kiến trúc là:

- Có thể phát triển nhanh ở giai đoạn đầu.
- Không bị over-engineering.
- Không tạo distributed system khi chưa cần.
- Chuẩn bị đầy đủ nền tảng để tách service sau này.
- AI được phát triển độc lập với hệ thống chính.
- Không thay đổi Domain khi chuyển sang Microservices.

---

# 2. High Level Architecture

```
                        Users
                          │
        ┌──────────────────────────────────┐
        │                                  │
     Web (Next.js)                   Mobile (React Native)
        │                                  │
        └──────────────┬───────────────────┘
                       │
                 API Gateway / BFF
                       │
       ===========================================
              Modular Monolith (NestJS)
       ===========================================

 Identity
 User
 Catalog
 Search
 Cart
 Checkout
 Order
 Payment
 Inventory
 Shipping
 Promotion
 Review
 Notification
 CMS
 Analytics
 Seller

               In Memory Event Bus

                Outbox Pattern

             Background Publisher

                     Kafka
                  (Future)

         Python AI Services Cluster

         Chatbot
         Recommendation
         Semantic Search
         OCR
         Fraud Detection

```

---

# 3. Architecture Principles

NovaCommerce tuân thủ:

- Clean Architecture
- Domain Driven Design
- Event Driven Architecture
- SOLID
- Dependency Injection
- API First
- AI First
- Security First

---

# 4. Clean Architecture

Mỗi module đều áp dụng Clean Architecture.

```
Presentation

↓

Application

↓

Domain

↑

Infrastructure
```

## Dependency Rule

Chỉ được phụ thuộc vào layer bên trong.

Không bao giờ:

Infrastructure

↓

Domain

---

# 5. Modular Monolith

Toàn bộ hệ thống là một ứng dụng.

Nhưng mỗi module hoạt động như một Microservice.

Ví dụ

```
Catalog

Application

Domain

Infrastructure

Presentation
```

```
Order

Application

Domain

Infrastructure

Presentation
```

Các module không chia sẻ Entity.

---

# 6. Bounded Context

NovaCommerce chia thành các Domain sau.

```
Identity

User

Catalog

Cart

Checkout

Order

Inventory

Payment

Shipping

Promotion

Notification

Review

CMS

Search

Analytics

Seller

AI
```

Mỗi Domain sở hữu Database Model của chính nó.

Không được sửa dữ liệu Domain khác.

---

# 7. Module Communication

## Không được

```
OrderService

↓

InventoryRepository
```

Sai.

---

## Được phép

```
OrderCreated

↓

Event Bus

↓

Inventory Handler
```

Hoặc

```
Application Service
```

---

# 8. Event Driven Architecture

Mọi sự kiện nghiệp vụ đều sinh Event.

Ví dụ

```
Customer Checkout

↓

Create Order

↓

OrderCreated Event

↓

Inventory

↓

Reserve Stock

↓

Notification

↓

Analytics

↓

Search

↓

Recommendation
```

Không gọi trực tiếp.

---

# 9. Event Types

## Domain Event

Chỉ tồn tại trong Monolith.

Ví dụ

```
OrderCreated

PaymentSucceeded

StockReserved

CouponApplied
```

---

## Integration Event

Dùng cho Kafka.

Ví dụ

```
order.created

inventory.stock_reserved

payment.completed

notification.sent
```

---

# 10. Outbox Pattern

```
Create Order

↓

Save Order

↓

Save Outbox

↓

Commit Transaction

↓

Worker

↓

Publish Event
```

Không publish Event trong Transaction.

---

# 11. CQRS

Chỉ áp dụng nơi cần.

Ví dụ

```
Search

Analytics

Dashboard

Reporting
```

Không áp dụng CRUD đơn giản.

---

# 12. Folder Architecture

```
apps

gateway

admin

web

mobile

packages

modules

shared

building-blocks

workers

ai-services

deployment

docs

tests
```

---

# 13. Module Standard

```
catalog

application

commands

queries

handlers

dto

domain

entities

aggregates

events

repositories

value-objects

infrastructure

prisma

repositories

services

presentation

controllers

contracts

README.md
```

Mọi module phải theo đúng cấu trúc này.

---

# 14. Shared Components

Shared chỉ chứa:

```
Result

Errors

Common Types

BaseEntity

AggregateRoot

DomainEvent

EventBus

Outbox

Logger

Guard

Utils

Validation

Pagination

Specification

ValueObject
```

Không chứa Business Logic.

---

# 15. API Layer

Toàn bộ API đều đi qua Gateway.

```
Client

↓

Gateway

↓

Modules
```

Gateway chịu trách nhiệm:

- Authentication
- Authorization
- Rate Limiting
- Logging
- Request ID
- Response Format

---

# 16. AI Architecture

AI không nằm trong Monolith.

```
NestJS

↓

REST / gRPC

↓

Python FastAPI

↓

LLM

↓

Response
```

Các AI Service:

```
Chatbot

Recommendation

Semantic Search

Review Summary

OCR

Image Search

SEO Generator

Content Generator

Fraud Detection
```

---

# 17. Search Architecture

```
Product Updated

↓

Domain Event

↓

Indexer

↓

OpenSearch

↓

Search API

↓

Frontend
```

Không Search trực tiếp PostgreSQL.

---

# 18. Database Architecture

```
PostgreSQL

│

├── Identity

├── Catalog

├── Order

├── Inventory

├── Payment

├── Promotion

├── Review

└── Analytics
```

Logical Separation.

Không tạo nhiều Database khi còn Monolith.

---

# 19. Cache Architecture

Redis dùng cho

```
Session

Product Cache

Search Cache

Permission Cache

Rate Limiting

Distributed Lock

OTP

Refresh Token
```

---

# 20. Storage

MinIO

Lưu

```
Product Images

Review Images

Documents

Invoices

Export Files
```

---

# 21. Security Architecture

```
HTTPS

↓

JWT

↓

RBAC

↓

Permission

↓

Audit Log
```

Bao gồm:

- Refresh Token
- MFA
- OAuth2
- OIDC
- Encryption
- Secrets Management

---

# 22. Logging

Structured Logging.

Log gồm:

```
RequestId

CorrelationId

UserId

Module

Action

Duration

ErrorCode
```

Không dùng console.log.

---

# 23. Monitoring

```
Application

↓

OpenTelemetry

↓

Prometheus

↓

Grafana

↓

AlertManager
```

Distributed Trace:

```
Jaeger
```

---

# 24. Deployment Architecture

```
Cloudflare

↓

Nginx

↓

Gateway

↓

NestJS

↓

Redis

↓

PostgreSQL

↓

OpenSearch

↓

MinIO

↓

Python AI

↓

Kafka (Future)
```

---

# 25. Migration to Microservices

Bước 1

```
Modular Monolith
```

↓

Bước 2

```
Event Bus
```

↓

Bước 3

```
Outbox
```

↓

Bước 4

```
Kafka
```

↓

Bước 5

```
Extract Inventory
```

↓

Bước 6

```
Extract Payment
```

↓

Bước 7

```
Extract Order
```

↓

Bước 8

```
Extract Search
```

↓

Bước 9

```
Extract Notification
```

---

# 26. Architecture Decision Rules

Mọi tính năng mới phải trả lời được các câu hỏi sau:

1. Thuộc Domain nào?
2. Aggregate Root là gì?
3. Có cần Domain Event không?
4. Có cần Outbox không?
5. Có cần CQRS không?
6. Có cần Cache không?
7. Có cần Search Index không?
8. Có cần AI xử lý không?
9. Có thể tách thành Microservice không?
10. Có phá vỡ Clean Architecture không?

Nếu không trả lời được các câu hỏi trên, không được merge Pull Request.

---

# 27. Design Goals

- High Cohesion
- Low Coupling
- Event Driven
- Cloud Native Ready
- AI Native
- Horizontal Scaling Ready
- Testable
- Observable
- Secure by Default
- Easy Migration to Microservices

---

# 28. Architecture Motto

> **"Keep the Domain Pure, Communicate by Events, Scale by Services, and Enhance with AI."**
