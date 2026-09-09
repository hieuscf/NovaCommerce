# ADR-001: Adopt Modular Monolith Architecture

**Status:** Accepted

**Date:** 2026-08-25

**Decision Makers:** NovaCommerce Architecture Team

---

# Context

NovaCommerce là một nền tảng E-Commerce Enterprise hướng tới khả năng mở rộng lâu dài.

Giai đoạn đầu của dự án cần:

- Phát triển nhanh.
- Dễ debug.
- Dễ triển khai.
- Chi phí vận hành thấp.
- Có khả năng chuyển sang Microservices khi cần.

Việc xây dựng Microservices ngay từ đầu sẽ dẫn đến:

- Độ phức tạp cao.
- Distributed Transactions.
- Eventual Consistency.
- DevOps phức tạp.
- Khó kiểm thử.
- Tăng chi phí phát triển.

---

# Decision

NovaCommerce sẽ sử dụng **Modular Monolith**.

Mỗi module được thiết kế như một Microservice độc lập:

- Domain
- Application
- Infrastructure
- Presentation
- Events
- Contracts

Các module không truy cập trực tiếp dữ liệu của nhau.

---

# Consequences

## Positive

- Triển khai nhanh.
- Đơn giản hóa DevOps.
- Debug dễ dàng.
- Transaction nhất quán.
- Không cần Distributed Transaction.
- Chuẩn bị sẵn cho Microservices.

## Negative

- Chia sẻ process.
- Chia sẻ Database.
- Scale toàn bộ application.

---

# Migration Strategy

```
Modular Monolith

↓

Event Driven

↓

Kafka

↓

Extract Module

↓

Microservices
```

---

# Alternatives Considered

- Microservices ngay từ đầu ❌
- Layered Monolith ❌
- Hexagonal Monolith ❌

---

# Decision Outcome

✅ Accepted
