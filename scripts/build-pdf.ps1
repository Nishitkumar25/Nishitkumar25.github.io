<#
.SYNOPSIS
    Regenerates assets/documents/portfolio.pdf from index.html.

.DESCRIPTION
    The downloadable portfolio PDF is printed from the live page using
    css/print.css. Because the site and the PDF share one source of content,
    anything you change in index.html appears in the next generated PDF.

    The script also bumps the ?v= cache-busting token on the PDF links inside
    index.html, so visitors who already downloaded an older copy are served
    the new one instead of a stale browser cache.

.PARAMETER NoVersionBump
    Generate the PDF but leave the ?v= tokens in index.html untouched.

.PARAMETER BrowserPath
    Full path to a Chrome or Edge executable, if it is not in a usual place.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\build-pdf.ps1

.NOTES
    No dependencies: it drives the Chromium browser you already have.
#>

[CmdletBinding()]
param(
    [switch]$NoVersionBump,
    [string]$BrowserPath
)

$ErrorActionPreference = 'Stop'

$root     = Split-Path -Parent $PSScriptRoot
$index    = Join-Path $root 'index.html'
$outDir   = Join-Path $root 'assets\documents'
$outFile  = Join-Path $outDir 'portfolio.pdf'

if (-not (Test-Path $index)) { throw "index.html not found at $index" }
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# ---------------------------------------------------------------- 1. browser
function Find-Browser {
    param([string]$Explicit)

    if ($Explicit) {
        if (Test-Path $Explicit) { return $Explicit }
        throw "No browser at the -BrowserPath you gave: $Explicit"
    }

    $candidates = @(
        (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),
        (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe'),
        (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe')
    )

    foreach ($c in $candidates) {
        if ($c -and (Test-Path $c)) { return $c }
    }

    throw 'Could not find Chrome or Edge. Pass one with -BrowserPath "C:\path\to\chrome.exe".'
}

$browser = Find-Browser -Explicit $BrowserPath
Write-Host "Browser  : $browser"
Write-Host "Source   : $index"
Write-Host "Output   : $outFile"

# ------------------------------------------------------------------- 2. print
# A temporary profile keeps the print run away from your everyday browser
# session, and lets it run even while Chrome is already open.
$profileDir = Join-Path $env:TEMP ("portfolio-pdf-" + [guid]::NewGuid().ToString('N'))
$fileUrl    = 'file:///' + ($index -replace '\\', '/')

# Every value that can contain a space (this project may live under
# "OneDrive - Company, Inc") is quoted, or the browser reads the tail of a path
# as a second URL and refuses with "Multiple targets are not supported".
$chromeArgs = @(
    '--headless',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    ('--user-data-dir="{0}"' -f $profileDir),
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=20000',
    ('--print-to-pdf="{0}"' -f $outFile),
    ('"{0}"' -f $fileUrl)
)

$stampBefore = if (Test-Path $outFile) { (Get-Item $outFile).LastWriteTimeUtc } else { [datetime]::MinValue }

Write-Host 'Printing ... (fonts are fetched from Google Fonts, so stay online)'
try {
    $p = Start-Process -FilePath $browser -ArgumentList $chromeArgs -NoNewWindow -Wait -PassThru
    if ($p.ExitCode -ne 0) {
        Write-Warning "The browser exited with code $($p.ExitCode). Checking the output anyway."
    }
}
finally {
    if (Test-Path $profileDir) {
        Remove-Item $profileDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

if (-not (Test-Path $outFile)) { throw 'The browser produced no PDF. Try -BrowserPath with another browser.' }

$item = Get-Item $outFile

# The run must have actually rewritten the file, or you would publish the old
# PDF believing it was refreshed.
if ($item.LastWriteTimeUtc -le $stampBefore) {
    throw 'The PDF on disk was NOT rewritten - the old file is still there. Scroll up for the browser error and fix that before publishing.'
}
if ($item.Length -lt 20KB) {
    throw "The generated PDF is only $($item.Length) bytes, so the print run failed. Regenerate before publishing."
}

Write-Host ("PDF      : {0:N0} KB written {1}" -f ($item.Length / 1KB), $item.LastWriteTime) -ForegroundColor Green

# ------------------------------------------------------- 3. cache-busting link
if ($NoVersionBump) {
    Write-Host 'Version  : left unchanged (-NoVersionBump)'
}
else {
    $stamp = Get-Date -Format 'yyyyMMdd'
    $human = Get-Date -Format 'yyyy-MM-dd'

    # index.html holds characters such as the download arrow and the middot.
    # Windows PowerShell reads a BOM-less file as ANSI and -Encoding utf8 WRITES
    # a BOM, which together mangle every one of them. Do the I/O through .NET
    # with an explicit UTF-8-without-BOM encoding instead.
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    $html = [System.IO.File]::ReadAllText($index, $utf8NoBom)

    $new = [regex]::Replace($html, '(?<file>resume\.pdf|portfolio\.pdf)\?v=\d+', {
        param($m) "$($m.Groups['file'].Value)?v=$stamp"
    })
    $new = [regex]::Replace($new, '(?<open><span data-pdf-updated>)[^<]*', {
        param($m) "$($m.Groups['open'].Value)$human"
    })

    if ($new -ne $html) {
        [System.IO.File]::WriteAllText($index, $new, $utf8NoBom)
        Write-Host "Version  : download links bumped to ?v=$stamp, page stamped $human"
    }
    else {
        Write-Host "Version  : already at ?v=$stamp"
    }
}

Write-Host ''
Write-Host 'Done. Open assets/documents/portfolio.pdf to check it, then publish.' -ForegroundColor Green
