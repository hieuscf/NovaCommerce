# techContext.md

# NovaCommerce Technical Context

Version: 1.0

---

# Overview

NovaCommerce là nền tảng E-Commerce Enterprise được xây dựng theo kiến trúc **Modular Monolith**, sẵn sàng chuyển đổi sang **Event-Driven Microservices**.

Mục tiêu kỹ thuật:

- High Performance
- High Availability
- Maintainability
- Testability
- Cloud Native Ready
- AI Ready
- Security First

---

# Backend Stack

Framework

- NestJS

Language

- TypeScript 5+

Runtime

- Node.js 22 LTS

Package Manager

- pnpm

API

- REST API
- OpenAPI (Swagger)

Future

- GraphQL
- gRPC

---

# Frontend Stack

Framework

- Next.js 15

Language

- TypeScript

UI

- TailwindCSS

State Management

- TanStack Query

Forms

- React Hook Form

Validation

- Zod

Charts

- ECharts

---

# Mobile

Framework

- React Native

Language

- TypeScript

---

# AI Platform

Language

- Python 3.12+

Framework

- FastAPI

Libraries

- LangChain
- Pydantic AI
- PyTorch
- Sentence Transformers
- Scikit-learn
- MLflow

LLM Providers

- OpenAI
- Gemini
- Claude
- Ollama

---

# Database

Primary Database

- PostgreSQL 17

Extensions

- pgvector
- uuid-ossp
- pg_trgm

Migration

- Prisma Migrate

---

# ORM

Prisma ORM

Responsibilities

- Schema
- Migration
- Type-safe Query
- Transaction

Rule

Prisma chỉ được sử dụng trong Infrastructure Layer.

---

# Cache

Redis

Use Cases

- Session
- JWT Blacklist
- Rate Limiting
- Product Cache
- Search Cache
- OTP
- Distributed Lock

---

# Search

OpenSearch

Indexes

- Product
- Category
- Brand
- Blog

Future

Semantic Search

---

# Object Storage

MinIO

Store

- Product Images
- Review Images
- Videos
- Documents
- Invoice PDFs

---

# Event System

Current

- In-Memory Event Bus

Future

- Apache Kafka

Reliability

- Outbox Pattern

---

# Authentication

JWT

Refresh Token

OAuth2

OIDC

MFA (Future)

---

# Authorization

RBAC

Future

ABAC

---

# Communication

Current

REST

Future

REST

gRPC

Kafka

---

# Validation

Library

Zod

Validation

- DTO
- API Request
- Environment Variables

---

# Documentation

Swagger

Architecture Docs

ADR

README

Decision Log

---

# Testing

Framework

Vitest

Integration

Supertest

E2E

Playwright

Coverage

> =80%

---

# Logging

Pino

Structured Logging

Fields

- RequestId
- CorrelationId
- UserId
- Module
- Duration

---

# Monitoring

OpenTelemetry

Prometheus

Grafana

Jaeger

Health Checks

---

# CI/CD

GitHub Actions

Pipeline

Lint

↓

Typecheck

↓

Unit Test

↓

Integration Test

↓

Build

↓

Docker

↓

Deploy

---

# Containerization

Docker

Docker Compose

Future

Kubernetes

Helm

---

# Code Quality

ESLint

Prettier

Husky

lint-staged

Commitlint

Conventional Commits

---

# Security

Helmet

CORS

Rate Limiting

Input Validation

Output Sanitization

Encryption

Audit Logs

Secret Management

---

# Development Environment

IDE

VS Code

Extensions

- ESLint
- Prisma
- Docker
- GitLens
- Error Lens

---

# Project Structure

apps/

packages/

modules/

shared/

building-blocks/

workers/

ai-services/

deployment/

docs/

tests/

---

# Design Principles

- Clean Architecture
- DDD
- SOLID
- CQRS (Selective)
- Event Driven
- Repository Pattern
- Specification Pattern
- Dependency Injection

---

# Future Technology

- Kafka
- Kubernetes
- Istio
- ArgoCD
- Temporal
- Keycloak
- ClickHouse
- Qdrant
- Apache Iceberg
