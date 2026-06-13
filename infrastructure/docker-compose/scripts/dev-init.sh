#!/usr/bin/env bash
# NovaCommerce — one-time local infrastructure bootstrap
# Run after the first successful `docker compose up -d`.
#
# Creates PostgreSQL databases, Kafka topics, Elasticsearch indices,
# Qdrant collections, MinIO buckets, and ClickHouse analytics database.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ROOT_DIR="$(cd "${COMPOSE_DIR}/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "ERROR: ${ENV_FILE} not found. Copy .env.example to .env first:"
  echo "  cp .env.example .env"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

COMPOSE=(docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_DIR}/docker-compose.yml" -f "${COMPOSE_DIR}/docker-compose.override.yml")

log() {
  printf '[dev-init] %s\n' "$*"
}

wait_for_postgres() {
  local attempt=1
  while (( attempt <= 30 )); do
    if "${COMPOSE[@]}" exec -T postgres pg_isready -U "${POSTGRES_USER}" >/dev/null 2>&1; then
      log "postgres is ready"
      return 0
    fi
    sleep 2
    attempt=$((attempt + 1))
  done
  echo "ERROR: postgres did not become ready in time"
  exit 1
}

wait_for_kafka() {
  local attempt=1
  while (( attempt <= 60 )); do
    if "${COMPOSE[@]}" exec -T kafka kafka-broker-api-versions --bootstrap-server localhost:9092 >/dev/null 2>&1; then
      log "kafka is ready"
      return 0
    fi
    sleep 3
    attempt=$((attempt + 1))
  done
  echo "ERROR: kafka did not become ready in time"
  exit 1
}

wait_for_http() {
  local name="$1"
  local url="$2"
  local max_attempts="${3:-60}"
  local attempt=1

  log "Waiting for ${name}..."
  while (( attempt <= max_attempts )); do
    if curl -sf "${url}" >/dev/null 2>&1; then
      log "${name} is ready"
      return 0
    fi
    sleep 3
    attempt=$((attempt + 1))
  done
  echo "ERROR: ${name} did not become ready in time"
  exit 1
}

wait_for_clickhouse() {
  local attempt=1
  while (( attempt <= 30 )); do
    if "${COMPOSE[@]}" exec -T clickhouse clickhouse-client --query "SELECT 1" >/dev/null 2>&1; then
      log "clickhouse is ready"
      return 0
    fi
    sleep 2
    attempt=$((attempt + 1))
  done
  echo "ERROR: clickhouse did not become ready in time"
  exit 1
}

run_psql() {
  "${COMPOSE[@]}" exec -T postgres psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" "$@"
}

create_postgres_databases() {
  log "Creating PostgreSQL service databases..."
  local databases=(
    identity_db
    catalog_db
    commerce_db
    fulfillment_db
    engagement_db
    notification_db
    file_db
  )

  for db in "${databases[@]}"; do
    local exists
    exists="$(run_psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${db}'")"
    if [[ "${exists}" == "1" ]]; then
      log "  database '${db}' already exists — skipping"
    else
      run_psql -c "CREATE DATABASE \"${db}\";"
      log "  created database '${db}'"
    fi
  done
}

create_kafka_topics() {
  log "Creating Kafka topics..."
  local partitions="${KAFKA_TOPIC_PARTITIONS:-3}"
  local replication="${KAFKA_TOPIC_REPLICATION_FACTOR:-1}"
  local topics=(
    user-events
    product-events
    inventory-events
    cart-events
    order-events
    payment-events
    shipping-events
    review-events
    notification-events
  )

  for topic in "${topics[@]}"; do
    if "${COMPOSE[@]}" exec -T kafka kafka-topics \
      --bootstrap-server localhost:9092 \
      --list 2>/dev/null | grep -qx "${topic}"; then
      log "  topic '${topic}' already exists — skipping"
    else
      "${COMPOSE[@]}" exec -T kafka kafka-topics \
        --bootstrap-server localhost:9092 \
        --create \
        --topic "${topic}" \
        --partitions "${partitions}" \
        --replication-factor "${replication}" \
        --if-not-exists
      log "  created topic '${topic}' (partitions=${partitions}, replication=${replication})"
    fi
  done
}

create_elasticsearch_index() {
  local index="${ELASTICSEARCH_PRODUCTS_INDEX:-products}"
  log "Creating Elasticsearch index '${index}'..."

  local status
  status="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${ELASTICSEARCH_PORT:-9200}/${index}" || true)"

  if [[ "${status}" == "200" ]]; then
    log "  index '${index}' already exists — skipping"
    return 0
  fi

  curl -sf -X PUT "http://localhost:${ELASTICSEARCH_PORT:-9200}/${index}" \
    -H 'Content-Type: application/json' \
    -d '{
      "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "analysis": {
          "analyzer": {
            "product_analyzer": {
              "type": "custom",
              "tokenizer": "standard",
              "filter": ["lowercase", "asciifolding"]
            }
          }
        }
      },
      "mappings": {
        "properties": {
          "product_id": { "type": "keyword" },
          "name": { "type": "text", "analyzer": "product_analyzer" },
          "description": { "type": "text", "analyzer": "product_analyzer" },
          "category_id": { "type": "keyword" },
          "brand_id": { "type": "keyword" },
          "price": { "type": "float" },
          "status": { "type": "keyword" },
          "tags": { "type": "keyword" },
          "indexed_at": { "type": "date" }
        }
      }
    }' >/dev/null

  log "  created index '${index}'"
}

create_qdrant_collection() {
  local collection="${QDRANT_PRODUCTS_COLLECTION:-products}"
  local vector_size="${QDRANT_VECTOR_SIZE:-1536}"
  log "Creating Qdrant collection '${collection}'..."

  local status
  status="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${QDRANT_PORT:-6333}/collections/${collection}" || true)"

  if [[ "${status}" == "200" ]]; then
    log "  collection '${collection}' already exists — skipping"
    return 0
  fi

  curl -sf -X PUT "http://localhost:${QDRANT_PORT:-6333}/collections/${collection}" \
    -H 'Content-Type: application/json' \
    -d "{
      \"vectors\": {
        \"size\": ${vector_size},
        \"distance\": \"Cosine\"
      }
    }" >/dev/null

  log "  created collection '${collection}' (vector_size=${vector_size})"
}

create_minio_buckets() {
  log "Creating MinIO buckets..."
  local buckets=(
    nova-bronze
    nova-silver
    nova-gold
    nova-uploads
  )

  MSYS_NO_PATHCONV=1 docker run --rm --network nova-network \
    --entrypoint /bin/sh \
    minio/mc:latest -c "
      set -eu
      mc alias set local http://minio:9000 '${MINIO_ROOT_USER}' '${MINIO_ROOT_PASSWORD}'
      mc mb --ignore-existing local/nova-bronze
      mc mb --ignore-existing local/nova-silver
      mc mb --ignore-existing local/nova-gold
      mc mb --ignore-existing local/nova-uploads
    "

  for bucket in "${buckets[@]}"; do
    log "  ensured bucket '${bucket}'"
  done
}

create_clickhouse_database() {
  log "Creating ClickHouse analytics database..."
  local db="${CLICKHOUSE_DB:-nova_analytics}"

  "${COMPOSE[@]}" exec -T clickhouse clickhouse-client --query "CREATE DATABASE IF NOT EXISTS ${db};"
  log "  ensured database '${db}'"
}

main() {
  log "Starting NovaCommerce local infrastructure bootstrap"
  log "Compose directory: ${COMPOSE_DIR}"

  wait_for_postgres
  wait_for_kafka
  wait_for_http "elasticsearch" "http://localhost:${ELASTICSEARCH_PORT:-9200}/_cluster/health" 90
  wait_for_http "qdrant" "http://localhost:${QDRANT_PORT:-6333}/readyz" 30
  wait_for_http "minio" "http://localhost:${MINIO_API_PORT:-9000}/minio/health/live" 30
  wait_for_clickhouse

  create_postgres_databases
  create_kafka_topics
  create_elasticsearch_index
  create_qdrant_collection
  create_minio_buckets
  create_clickhouse_database

  log "Bootstrap complete."
  log ""
  log "Service URLs:"
  log "  PostgreSQL:      localhost:${POSTGRES_PORT:-5432}  (Adminer: http://localhost:${ADMINER_PORT:-8888})"
  log "  Redis:           localhost:${REDIS_PORT:-6379}  (Commander: http://localhost:${REDIS_COMMANDER_PORT:-8889})"
  log "  Kafka:           localhost:${KAFKA_PORT:-9092}  (UI: http://localhost:${KAFKA_UI_PORT:-8090})"
  log "  Elasticsearch:   http://localhost:${ELASTICSEARCH_PORT:-9200}"
  log "  Kibana:          http://localhost:${KIBANA_PORT:-5601}"
  log "  Qdrant:          http://localhost:${QDRANT_PORT:-6333}"
  log "  MinIO API:       http://localhost:${MINIO_API_PORT:-9000}  (Console: http://localhost:${MINIO_CONSOLE_PORT:-9001})"
  log "  ClickHouse HTTP: http://localhost:${CLICKHOUSE_HTTP_PORT:-8123}"
}

main "$@"
