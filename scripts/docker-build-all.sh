#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

mapfile -t dockerfiles < <(find services -name Dockerfile -print 2>/dev/null | sort || true)

if [ "${#dockerfiles[@]}" -eq 0 ]; then
  echo "No Dockerfiles found under services/, skipping docker-build"
  exit 0
fi

registry="${DOCKER_REGISTRY:-nova}"
tag="${DOCKER_TAG:-latest}"

for df in "${dockerfiles[@]}"; do
  dir="$(dirname "$df")"
  name="$(basename "$dir")"
  image="${registry}/${name}:${tag}"
  echo "docker build: $image ($dir)"
  docker build -t "$image" "$dir"
done

echo "Docker build complete."
