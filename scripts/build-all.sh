#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

mapfile -t modules < <(find services -name go.mod -print 2>/dev/null | sort || true)

if [ "${#modules[@]}" -eq 0 ]; then
  echo "No Go modules found under services/, skipping build"
  exit 0
fi

for mod in "${modules[@]}"; do
  dir="$(dirname "$mod")"
  echo "build: $dir"
  (cd "$dir" && go build ./...)
done

echo "Build complete."
