# Build from repository root:
#   docker build -f services/identity-service/Dockerfile -t identity-service .
#
# Stage 1: Builder
FROM golang:1.23-alpine AS builder

ARG VERSION=1.0.0

WORKDIR /app

COPY pkg/ ./pkg/
COPY services/identity-service/go.mod services/identity-service/go.sum ./services/identity-service/

WORKDIR /app/services/identity-service
RUN go mod download

COPY services/identity-service/ .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s -X main.Version=${VERSION}" \
    -o /app/identity-service ./cmd/server

# Stage 2: Final — distroless
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app

COPY --from=builder /app/identity-service .
COPY --from=builder /app/services/identity-service/config/config.yaml ./config/
COPY --from=builder /app/services/identity-service/migrations ./migrations/

EXPOSE 8081

USER nonroot:nonroot

ENTRYPOINT ["/app/identity-service"]
