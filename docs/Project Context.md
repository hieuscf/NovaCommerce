# Project Context - NovaCommerce

> **Project Name:** NovaCommerce  
> **Version:** 1.0.0  
> **Architecture:** Modular Monolith → Event-Driven → Microservices  
> **Primary Language:** TypeScript  
> **AI Language:** Python  
> **Target:** Enterprise E-Commerce Platform

---

# 1. Vision

NovaCommerce là nền tảng thương mại điện tử mã nguồn mở hướng Enterprise, được thiết kế để có khả năng mở rộng từ một Modular Monolith sang Microservices mà không cần thay đổi Domain Logic.

Hệ thống hướng tới các tiêu chí:

- High Performance
- Domain Driven Design (DDD)
- Clean Architecture
- Event Driven Architecture
- Cloud Native
- AI First
- API First
- Security First

Mục tiêu không phải tạo một website bán hàng đơn giản mà là một nền tảng tương tự:

- Shopify
- Shopee
- Lazada
- Amazon
- Magento Enterprise
- Saleor

---

# 2. Core Principles

NovaCommerce luôn tuân thủ các nguyên tắc sau.

## Clean Architecture

Dependency chỉ đi vào trong.

```
Presentation
↓

Application
↓

Domain

Infrastructure implements interfaces
```

Domain không được phụ thuộc vào bất kỳ framework nào.

---

## Domain Driven Design

Mỗi module là một Bounded Context.

Ví dụ

Catalog

Order

Inventory

Payment

Identity

Promotion

Notification

Analytics

...

Không được truy cập trực tiếp Entity của module khác.

Chỉ giao tiếp thông qua

- Application Service
- Event
- Public Contract

---

## Event Driven

Các module không gọi trực tiếp nhau nếu không cần thiết.

Ví dụ

Order Created

↓

Inventory Reserve

↓

Notification

↓

Analytics

↓

Recommendation

↓

Search Index

Thông qua EventBus.

---

## SOLID

Toàn bộ source code phải tuân thủ SOLID.

---

## Dependency Injection

Không tạo object bằng new trong Business Logic.

Tất cả service phải inject.

---

## Repository Pattern

Application chỉ làm việc với Interface.

Không phụ thuộc ORM.

---

## Specification Pattern

Dùng cho các Query phức tạp.

---

## CQRS

Chỉ áp dụng cho module có lượng đọc lớn.

Ví dụ

Search

Analytics

Dashboard

Reporting

Không áp dụng toàn hệ thống.

---

# 3. Technology Stack

## Main Platform

Language

TypeScript

Framework

NestJS

ORM

Prisma ORM

Database

PostgreSQL

Cache

Redis

Search

OpenSearch

Object Storage

MinIO

Queue (Future)

Kafka

Current Event

In-Memory Event Bus

Outbox

Database Outbox Pattern

Authentication

JWT

OAuth2

OIDC

Frontend

Next.js

Mobile

React Native

Admin

Next.js

---

## AI Platform

Language

Python

Framework

FastAPI

AI Framework

LangChain

LLM

OpenAI

Gemini

Claude

Ollama

Vector Database

pgvector

Embedding

OpenAI Embedding

Sentence Transformers

PyTorch

Recommendation

LightFM

Scikit-learn

Monitoring

MLFlow

---

# 4. Project Architecture

```
Internet

↓

Next.js

↓

API Gateway

↓

Modular Monolith

↓

In Memory Event Bus

↓

Outbox

↓

Kafka (Future)

↓

Microservices
```

---

# 5. Modular Architecture

Modules

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

Search

Review

CMS

Analytics

Seller

AI

ReturnRefund

Shared

BuildingBlocks

---

# 6. Folder Structure

```
novacommerce

apps

gateway

web

admin

mobile

services-ai

packages

building-blocks

shared

modules

workers

infrastructure

docs

deployment

scripts

tests
```

---

# 7. Module Structure Standard

Mỗi module phải có cấu trúc giống nhau.

```
Catalog

application

domain

infrastructure

presentation

contracts

events

README.md
```

Không được phá vỡ convention này.

---

# 8. Layer Responsibilities

## Presentation

Controller

REST API

GraphQL

Validation

DTO

Không chứa Business Logic.

---

## Application

Use Case

Commands

Queries

Event Handler

Transaction

Không chứa SQL.

---

## Domain

Aggregate

Entity

Value Object

Domain Service

Domain Event

Repository Interface

Không phụ thuộc NestJS.

---

## Infrastructure

Prisma

Redis

MinIO

Kafka

Email

Payment

Shipping

Third Party API

---

# 9. Shared Packages

Shared chỉ chứa

Result

Error

Base Entity

Aggregate Root

Specification

Guard

EventBus

Outbox

Logger

Security

Caching

Validation

Pagination

Utils

Không chứa Business Logic.

---

# 10. Event Architecture

## Domain Event

Ví dụ

OrderCreated

StockReserved

PaymentSucceeded

ReviewCreated

CouponUsed

---

## Integration Event

Chỉ dùng khi chuyển sang Kafka.

Ví dụ

inventory.stock_reserved

order.created

payment.completed

notification.sent

---

# 11. Outbox Pattern

Transaction

↓

Save Order

↓

Save Outbox

↓

Commit

↓

Worker Publish

↓

Kafka

Không publish event trong transaction.

---

# 12. AI Architecture

AI được tách thành dịch vụ Python độc lập.

Services

Chatbot

Recommendation

Semantic Search

Review Summary

Fraud Detection

OCR

Image Search

Product Generator

SEO Generator

Mọi AI Service expose

REST API

hoặc

gRPC

Không nhúng AI trực tiếp vào Business Module.

---

# 13. Search Architecture

Search không query trực tiếp PostgreSQL.

Flow

Product Updated

↓

Event

↓

Indexer

↓

OpenSearch

↓

Semantic Search

↓

Response

---

# 14. Coding Standards

Tên class

PascalCase

Tên interface

Prefix I

Ví dụ

IProductRepository

IEventBus

ICacheService

Tên biến

camelCase

Tên file

kebab-case

Tên thư mục

lowercase

Không dùng static nếu không cần.

Không dùng any.

Không disable eslint.

---

# 15. Error Handling

Sử dụng Result Pattern.

Không throw Exception cho Business Error.

Ví dụ

Result.Success()

Result.Fail()

---

# 16. Security

JWT

Refresh Token

RBAC

ABAC

Rate Limiting

Audit Log

Encryption

Secret Manager

HTTPS

Helmet

CORS

Validation

---

# 17. Logging

Structured Logging

CorrelationId

RequestId

UserId

Duration

ErrorCode

Không dùng console.log trong Production.

---

# 18. Monitoring

OpenTelemetry

Prometheus

Grafana

Jaeger

Health Check

Metrics

Tracing

---

# 19. Testing

Unit Test

Integration Test

Contract Test

E2E Test

Performance Test

Coverage tối thiểu

80%

---

# 20. Future Roadmap

Phase 1

Modular Monolith

Phase 2

AI Platform

Phase 3

Kafka

Phase 4

Microservices

Phase 5

Kubernetes

Phase 6

Multi Tenant

Phase 7

Marketplace

Phase 8

International Commerce

---

# 21. Non-Functional Requirements

- Hỗ trợ tối thiểu 100.000 sản phẩm.
- Hỗ trợ trên 10.000 đơn hàng/ngày.
- Độ sẵn sàng mục tiêu ≥ 99.9%.
- Thiết kế stateless để dễ mở rộng theo chiều ngang.
- Mọi module phải có khả năng tách thành microservice mà không thay đổi Domain Model.
- Toàn bộ API được quản lý bằng OpenAPI/Swagger và versioning.

---

# 22. Development Rules

Mọi Pull Request phải đảm bảo:

- Không vi phạm Clean Architecture.
- Không phụ thuộc chéo giữa các module.
- Không truy cập trực tiếp Database của module khác.
- Mọi thay đổi Domain phải phát sinh Domain Event nếu ảnh hưởng đến module khác.
- Mọi API mới phải có tài liệu Swagger.
- Mọi tính năng mới phải có Unit Test và Integration Test tương ứng.

---

# Project Motto

> **"Build once as a Modular Monolith, scale forever with Event-Driven Microservices and AI."**
