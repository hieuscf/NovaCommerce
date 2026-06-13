$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (Get-Command pre-commit -ErrorAction SilentlyContinue) {
    Write-Host "Installing pre-commit hooks from .pre-commit-config.yaml..."
    pre-commit install --hook-type pre-commit
} else {
    Write-Host "pre-commit not found. Using .githooks/pre-commit (gofmt + golangci-lint)."
    git config core.hooksPath .githooks
    Write-Host "Optional: pip install pre-commit  then re-run this script for full hook suite."
}

Write-Host "Done. Hooks configured."
