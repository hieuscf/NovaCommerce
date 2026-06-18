-- Catalog Service — development seed (idempotent).
--
-- Preferred: make seed-dev  (golang-migrate migration 008)
--
-- Manual psql (schema 001-007 must already be applied):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -c "SELECT set_config('app.environment', 'development', false);" \
--     -f migrations/008_seed_dev_data.up.sql
--
-- This file sets app.environment then includes the canonical seed migration.

SELECT set_config('app.environment', 'development', false);
