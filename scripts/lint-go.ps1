$ErrorActionPreference = "Stop"
$root = git rev-parse --show-toplevel
Set-Location $root

$modules = Get-ChildItem -Path "services" -Filter "go.mod" -Recurse -ErrorAction SilentlyContinue

if (-not $modules) {
    Write-Host "No Go modules found under services/, skipping golangci-lint"
    exit 0
}

$failed = $false
foreach ($mod in $modules) {
    $dir = $mod.DirectoryName
    Write-Host "golangci-lint: $dir"
    Push-Location $dir
    try {
        golangci-lint run ./...
        if ($LASTEXITCODE -ne 0) { $failed = $true }
    } finally {
        Pop-Location
    }
}

if ($failed) { exit 1 }
