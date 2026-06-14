# Identity Service — Database Migrations
Tool: golang-migrate
Format: {version}_{description}.up.sql / {version}_{description}.down.sql
Naming convention: 3-digit version prefix (001, 002, ...)
Run: migrate -path ./migrations -database $DATABASE_URL up
