## Description

<!-- What changed and why. Link related issue/task if applicable. -->

### What changed?

### Why?

---

## Scope

| Field | Value |
|-------|-------|
| **Module / package** | <!-- e.g. catalog, gateway, building-blocks, docs --> |
| **Layer** | <!-- e.g. domain, application, infrastructure, presentation, docs --> |

---

## Architecture

<!-- Check all that apply. Uncheck and explain in Description if an exception is justified. -->

- [ ] Correct bounded context — feature lives in one module only
- [ ] Clean Architecture respected (Presentation → Application → Domain)
- [ ] No cross-module internal dependency (no importing another module's entities/repositories)
- [ ] No direct access to another module's database
- [ ] Domain remains framework-independent (no NestJS/Prisma in domain)
- [ ] Events / public contracts used where cross-module communication is needed
- [ ] Outbox considered for domain events that must be published reliably

---

## Testing

<!-- Test infrastructure is not yet configured at repo root. Document what you verified. -->

- [ ] Unit tests added/updated (when applicable)
- [ ] Integration tests added/updated (when applicable)
- [ ] Existing tests pass (N/A if no tests exist for affected area)
- [ ] Manual verification performed

**Manual verification notes:**

<!-- Describe steps taken, e.g. curl /health, pnpm build:gateway -->

---

## API

<!-- Complete this section only if the PR changes HTTP APIs. Otherwise delete or mark N/A. -->

- [ ] N/A — no API changes
- [ ] Follows [api-guidelines.md](../docs/api-guidelines.md)
- [ ] Swagger / OpenAPI updated

---

## Documentation

- [ ] N/A — no doc impact
- [ ] Documentation updated
- [ ] Domain / Event / API / Database docs updated (if applicable)
- [ ] `docs/progress.md` updated (if milestone/sprint status changed)

---

## Security

- [ ] No secrets, credentials, or `.env` files committed
- [ ] Authorization considered for new/changed endpoints
- [ ] Input validation implemented for new/changed endpoints

---

## Breaking Changes

- [ ] No breaking changes
- [ ] Breaking changes — described below with migration notes

<!-- If breaking, describe impact and migration path -->

---

## Verification

<!-- List commands you ran and their results -->

```text
Commands run:
Results:
```

**Example:**

```text
pnpm --filter @novacommerce/gateway run build  → pass
pnpm build                                      → pass (or note partial failure)
```

---

## Checklist

- [ ] Single focused change — not multiple unrelated changes bundled together
- [ ] Follows [coding-standards.md](../docs/coding-standards.md)
- [ ] No `any` types without documented justification
- [ ] No commented-out code or TODOs without linked issue
- [ ] PR targets `master`
