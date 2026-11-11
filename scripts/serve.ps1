<#
.SYNOPSIS
    Serves the portfolio locally so you can check it before publishing.

.DESCRIPTION
    Opening index.html straight from disk works, but a local web server
    matches how GitHub Pages will actually serve the site. Press Ctrl+C to stop.

.PARAMETER Port
    Port to listen on. Default 8000.

.PARAMETER NoBrowser
    Do not open a browser window.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1
#>

[CmdletBinding()]
param(
    [int]$Port = 8000,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command py -ErrorAction SilentlyContinue }
if (-not $python) {
    throw 'Python was not found. Install it, or just open index.html in a browser.'
}

$url = "http://localhost:$Port"
Write-Host "Serving $root"
Write-Host "        $url" -ForegroundColor Green
Write-Host 'Ctrl+C to stop.'

if (-not $NoBrowser) { Start-Process $url }

Push-Location $root
try {
    & $python.Source -m http.server $Port
}
finally {
    Pop-Location
}
