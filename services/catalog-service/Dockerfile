# Build from repository root:
#   docker build -f services/catalog-service/Dockerfile -t catalog-service .
#
# Stage 1: Builder
FROM golang:1.23-alpine AS builder

ARG VERSION=1.0.0

WORKDIR /app

COPY pkg/ ./pkg/
COPY services/catalog-service/go.mod services/catalog-service/go.sum ./services/catalog-service/

WORKDIR /app/services/catalog-service
RUN go mod download

COPY services/catalog-service/ .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s -X main.Version=${VERSION}" \
    -o /app/catalog-service ./cmd/server

# Stage 2: Final — distroless
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app

COPY --from=builder /app/catalog-service .
COPY --from=builder /app/services/catalog-service/config/config.yaml ./config/
COPY --from=builder /app/services/catalog-service/migrations ./migrations/

EXPOSE 8082

USER nonroot:nonroot

ENTRYPOINT ["/app/catalog-service"]
