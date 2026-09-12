# Notification Module

**Bounded Context:** Notification

**Responsibility:** Event-driven notification delivery via email and push channels. Consumes Order and Payment integration events, resolves templates, persists delivery state, and processes pending deliveries through the notification worker.

**Dependencies / Communication:** Consumes `order.created`, `payment.completed`, and `payment.failed` integration events. Publishes `NotificationRequested`, `NotificationSent`, and `NotificationFailed` through the Outbox. Channel implementations (email, push) reside in Infrastructure as stub providers until external integrations are configured.

**Worker:** Pending deliveries are processed by `NotificationProcessor`, wired into the outbox worker loop alongside outbox publication.
