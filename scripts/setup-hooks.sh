#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

chmod +x .githooks/pre-commit scripts/lint-go.sh 2>/dev/null || true

if command -v pre-commit >/dev/null 2>&1; then
  echo "Installing pre-commit hooks from .pre-commit-config.yaml..."
  pre-commit install --hook-type pre-commit
else
  echo "pre-commit not found. Using .githooks/pre-commit (gofmt + golangci-lint)."
  git config core.hooksPath .githooks
  echo "Optional: pip install pre-commit  then re-run this script for full hook suite."
fi

echo "Done. Hooks configured."
