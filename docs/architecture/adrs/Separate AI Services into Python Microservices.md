# ADR-004: Separate AI Services into Python Microservices

**Status:** Accepted

**Date:** 2026-08-25

---

# Context

NovaCommerce sẽ tích hợp AI cho:

- Chatbot.
- Semantic Search.
- Recommendation.
- OCR.
- Fraud Detection.
- Product Description.
- SEO.
- Review Summary.

Hệ sinh thái AI phát triển nhanh hơn trong Python so với TypeScript.

---

# Decision

Tách AI thành một cụm dịch vụ độc lập sử dụng:

- Python
- FastAPI

Backend TypeScript chỉ đóng vai trò điều phối.

---

# Architecture

```
Client

↓

NestJS

↓

REST

↓

FastAPI

↓

LLM

↓

Embedding

↓

Vector Database

↓

Response
```

---

# AI Services

```
chat-service

recommendation-service

semantic-search-service

ocr-service

review-summary-service

fraud-detection-service

content-generator-service
```

---

# AI Stack

- FastAPI
- LangChain
- Pydantic AI (khi phù hợp)
- OpenAI SDK
- Google Gemini SDK
- Anthropic SDK
- Sentence Transformers
- PyTorch
- scikit-learn
- pgvector
- MLflow

---

# Communication

Current

REST

Future

- gRPC
- Kafka Events

---

# Consequences

## Positive

- Tận dụng hệ sinh thái AI của Python.
- Không làm phình Backend TypeScript.
- Có thể scale AI độc lập.
- Dễ thay đổi LLM Provider.

## Negative

- Tăng độ phức tạp trong giao tiếp giữa các dịch vụ.
- Cần theo dõi và triển khai riêng cho AI Services.

---

# Alternatives

- AI trong NestJS ❌
- Monolithic AI Module ❌
- Serverless AI Functions ❌ (chưa phù hợp giai đoạn đầu)

---

# Decision Outcome

✅ Accepted
