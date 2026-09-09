# Notification Module

**Bounded Context:** Notification

**Responsibility:** Notification delivery — email, SMS, push, and in-app notifications driven by platform events.

**Dependencies / Communication:** Consumes domain/integration events from Order, User, Payment, and others. Channel implementations (email, SMS) reside in Infrastructure. Event-driven only — no business logic from other modules.
