#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

mapfile -t modules < <(find services -name go.mod -print 2>/dev/null | sort || true)

if [ "${#modules[@]}" -eq 0 ]; then
  echo "No Go modules found under services/, skipping tests"
  exit 0
fi

for mod in "${modules[@]}"; do
  dir="$(dirname "$mod")"
  echo "test: $dir"
  (cd "$dir" && go test ./...)
done

echo "Tests complete."
