# File Service

Supporting microservice for media upload and object storage.

## Responsibilities

- Upload product images, avatars, and review images
- Validate file type and size
- Store objects in MinIO (`nova-media` bucket)
- Generate resized variants (thumbnail, medium, original)
- Serve presigned URLs for secure access

## Tech stack

| Component | Technology |
|-----------|------------|
| Language | Go (Gin) |
| Storage | MinIO (S3-compatible) |
| CDN | Cloudflare (optional) |

## API (target)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/files/upload` | Upload file |
| `GET` | `/files/:key` | Presigned URL (TTL 1h) |
| `DELETE` | `/files/:key` | Delete file |

## Constraints

| Rule | Value |
|------|-------|
| Allowed types | JPEG, PNG, WebP |
| Max size | 10 MB |
| Image sizes | 200×200, 600×600, original |

## Design notes

- Used by Catalog Service (product images) and Identity Service (avatars)
- Bucket: `nova-media` on MinIO (`:9000` local)

## Project structure (target)

```
file-service/
├── cmd/server/
├── internal/domain|application|infrastructure/
└── config/
```

## Related tasks

- `SHARED-003` in [TASKS.md](../../TASKS.md)

## Documentation

- [PROJECT_CONTEXT — MinIO](../../docs/PROJECT_CONTEXT.md#12-environment--deployment)
