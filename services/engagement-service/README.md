# Engagement Service

Core microservice for reviews, notifications, and customer support chat.

## Responsibilities

- Product reviews with verified-purchase validation
- Review moderation and reporting
- Multi-channel notifications (email, SMS, push)
- Real-time support chat via WebSocket
- Notification template engine

## Tech stack

| Component | Technology |
|-----------|------------|
| Language | Go (Gin) |
| Database | PostgreSQL |
| Cache | Redis |
| Messaging | Kafka |
| Real-time | WebSocket |

## Local development

| Setting | Value |
|---------|-------|
| HTTP port | `8085` |
| WebSocket | `WS /chat/connect` |
| Health check | `GET /health` |
| API prefix | `/api/v1` |

## Kafka

| Direction | Topic | Events |
|-----------|-------|--------|
| Publish | `review-events` | `REVIEW_CREATED`, `REVIEW_UPDATED`, `REVIEW_DELETED` |
| Publish | `notification-events` | Order, payment, shipping notifications |
| Consume | `order-events` | Order confirmation, review reminders |
| Consume | `payment-events` | Payment success / failure |
| Consume | `shipping-events` | Delivery updates |

## Database entities

`reviews`, `review_images`, `review_votes`, `review_reports`, `notifications`, `notification_templates`, `chat_conversations`, `chat_messages`

See [docs/ERD.md](../../docs/ERD.md#5-engagement-service-postgresql--redis--kafka).

## Notification channels

| Channel | Provider |
|---------|----------|
| Email | SendGrid |
| Push | Firebase FCM |
| SMS | VAIS / Twilio |

## Design notes

- Reviews require `is_verified_purchase` (linked to order item)
- Notifications use template engine with Vietnamese support
- Chat supports image/file attachments

## Project structure (target)

```
engagement-service/
├── cmd/server/
├── internal/domain|application|infrastructure/
├── migrations/
└── config/
```

## Related tasks

- `SVC-ENG-001` → `SVC-ENG-003` in [TASKS.md](../../TASKS.md)

## Documentation

- [PROJECT_CONTEXT — Engagement Service](../../docs/PROJECT_CONTEXT.md#45-engagement-service)
