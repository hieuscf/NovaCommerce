.PHONY: migrate-up migrate-down seed-dev seed-dev-psql

# Default local DSN (Docker Compose maps Postgres to host port 5433).
DATABASE_URL ?= postgres://nova:nova_dev_password@localhost:5433/catalog_db?sslmode=disable
MIGRATE_DEV_URL ?= $(DATABASE_URL)&options=-c%20app.environment%3Ddevelopment

migrate-up: ## Apply all migrations including dev seed (008)
	migrate -path ./migrations -database "$(MIGRATE_DEV_URL)" up

migrate-down: ## Roll back the last migration
	migrate -path ./migrations -database "$(MIGRATE_DEV_URL)" down 1

seed-dev: migrate-up ## Alias: run migrations through 008 (dev seed is idempotent)

seed-dev-psql: ## Apply seed SQL only via psql (schema migrations 001-007 must exist)
	psql "$(DATABASE_URL)" -v ON_ERROR_STOP=1 -f ./scripts/seed-dev.sql -f ./migrations/008_seed_dev_data.up.sql
