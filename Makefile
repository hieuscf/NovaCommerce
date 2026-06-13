.PHONY: help build test lint docker-build fmt setup-hooks hooks

SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c

help: ## Show available targets
	@echo "NovaCommerce monorepo"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  %-16s %s\n", $$1, $$2}'

build: ## Build all Go services under services/
	@bash scripts/build-all.sh

test: ## Run tests for all Go services under services/
	@bash scripts/test-all.sh

lint: ## Run golangci-lint for all Go services
	@bash scripts/lint-go.sh

docker-build: ## Build Docker images for all services with a Dockerfile
	@bash scripts/docker-build-all.sh

fmt: ## Format all Go source files
	@mapfile -t modules < <(find services -name go.mod -print 2>/dev/null | sort || true); \
	if [ $${#modules[@]} -eq 0 ]; then \
		echo "No Go modules found under services/, skipping fmt"; \
		exit 0; \
	fi; \
	for mod in "$${modules[@]}"; do \
		dir=$$(dirname $$mod); \
		echo "gofmt: $$dir"; \
		(cd $$dir && gofmt -w .); \
	done

setup-hooks hooks: ## Install git pre-commit hooks
	@bash scripts/setup-hooks.sh
