# @novacommerce/frontend

Shared frontend infrastructure for `apps/web` and `apps/admin`.

This package is **generic**. It must not contain catalog, cart, order, identity, or admin workflows.

## Contents

- HTTP transport (`createApiClient`) — Next.js → API Gateway `/api/v1`
- Normalized API errors (`ApiClientError`)
- Public environment validation (`validatePublicEnv`)
- Request/correlation ID helpers
- Redacting observability hook
- Safe redirect sanitization

## Usage

```ts
import { createApiClient, getPublicEnv } from '@novacommerce/frontend';

const api = createApiClient({
  baseUrl: getPublicEnv().apiBaseUrl,
  getAccessToken: () => null,
});
```

See `docs/frontend-architecture.md`.
