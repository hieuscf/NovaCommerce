# Notification Service

Supporting microservice for delivering notifications across channels.

## Responsibilities

- Consume `notification-events` from Engagement Service
- Route notifications to email, SMS, and push providers
- Retry failed deliveries with backoff
- Track delivery status

## Tech stack

| Component | Technology |
|-----------|------------|
| Language | Go |
| Messaging | Kafka (consumer) |
| Providers | SendGrid, Firebase FCM, VAIS / Twilio |

## Kafka

| Direction | Topic |
|-----------|-------|
| Consume | `notification-events` |

## Design notes

- Decouples notification delivery from Engagement Service business logic
- Idempotent consumers with `idempotency_key`
- Template rendering handled upstream; this service focuses on delivery

## Project structure (target)

```
notification-service/
├── cmd/server/
├── internal/domain|application|infrastructure/
└── config/
```

## Related tasks

- `SVC-ENG-002` (Engagement owns templates; this service delivers)

## Documentation

- [PROJECT_CONTEXT — Kafka Topics](../../docs/PROJECT_CONTEXT.md#5-kafka-topics)
