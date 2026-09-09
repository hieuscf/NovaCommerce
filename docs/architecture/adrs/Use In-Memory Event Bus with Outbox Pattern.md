# ADR-002: Use In-Memory Event Bus with Outbox Pattern

**Status:** Accepted

**Date:** 2026-08-25

---

# Context

NovaCommerce cần giao tiếp bất đồng bộ giữa các module nhưng chưa muốn đưa Kafka vào từ đầu.

Các yêu cầu:

- Không mất Event.
- Không coupling module.
- Có thể thay Kafka sau này.
- Không thay đổi Domain Logic.

---

# Decision

Sử dụng:

- In-Memory Event Bus.
- Domain Events.
- Outbox Pattern.
- Background Publisher.

Luồng xử lý:

```
Application Service

↓

Aggregate

↓

Domain Events

↓

Outbox

↓

Commit Transaction

↓

Background Worker

↓

Publish Event
```

---

# Why Outbox

Nếu publish event trước khi transaction commit:

```
Publish Success

↓

Transaction Rollback

↓

Data và Event không đồng bộ
```

Outbox giải quyết vấn đề này.

---

# Future Migration

```
Current

Outbox

↓

InMemory EventBus

Future

Outbox

↓

Kafka
```

Không thay đổi Business Logic.

---

# Consequences

## Positive

- Reliable Messaging.
- Không mất Event.
- Chuẩn bị Kafka.
- Dễ kiểm thử.

## Negative

- Có độ trễ nhỏ do Background Worker.
- Tăng thêm bảng Outbox.

---

# Alternatives

- Direct Service Call ❌
- RabbitMQ từ đầu ❌
- Kafka từ đầu ❌

---

# Decision Outcome

✅ Accepted
