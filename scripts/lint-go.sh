#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"

mapfile -t modules < <(find services -name go.mod -print 2>/dev/null | sort || true)

if [ "${#modules[@]}" -eq 0 ]; then
  echo "No Go modules found under services/, skipping golangci-lint"
  exit 0
fi

status=0
for mod in "${modules[@]}"; do
  dir="$(dirname "$mod")"
  echo "golangci-lint: $dir"
  if ! (cd "$dir" && golangci-lint run ./...); then
    status=1
  fi
done

exit "$status"
