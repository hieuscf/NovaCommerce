#!/usr/bin/env bash
# NovaCommerce — reset local infrastructure to a clean state
# Destroys all Docker volumes and re-runs dev-init.sh.

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

COMPOSE=(docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_DIR}/docker-compose.yml" -f "${COMPOSE_DIR}/docker-compose.override.yml")

log() {
  printf '[dev-reset] %s\n' "$*"
}

confirm_reset() {
  if [[ "${NO_CONFIRM:-}" == "1" ]]; then
    return 0
  fi

  echo ""
  echo "WARNING: This will stop all infrastructure containers and DELETE all persisted data volumes."
  echo "         All databases, Kafka messages, Elasticsearch indices, and MinIO objects will be lost."
  echo ""
  read -r -p "Continue? [y/N] " reply
  if [[ ! "${reply}" =~ ^[Yy]$ ]]; then
    log "Aborted."
    exit 0
  fi
}

main() {
  confirm_reset

  log "Stopping containers and removing volumes..."
  "${COMPOSE[@]}" down -v --remove-orphans

  log "Starting fresh infrastructure stack..."
  "${COMPOSE[@]}" up -d

  log "Re-running bootstrap..."
  bash "${SCRIPT_DIR}/dev-init.sh"

  log "Reset complete."
}

main "$@"
