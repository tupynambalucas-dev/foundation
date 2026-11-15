<#
.SYNOPSIS
    Day-0 Windows Host Readiness & Corporate WSL2 Distribution Installer.
.DESCRIPTION
    Configures %UserProfile%\.wslconfig (with non-destructive .bak backup), registers the
    tupynambalucas-dev ModernDistributions catalog in HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss,
    stages the shared Windows Terminal fragment wallpaper (monygang.png), and optionally invokes
    native 'wsl.exe --install' for tupynambalucas-dev and tupynambalucas-dev-cluster.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$CatalogUrl = "https://raw.githubusercontent.com/tupynambalucas-dev/workstation/main/distros/catalog/DistributionInfo.json",

    [Parameter(Mandatory = $false)]
    [switch]$ApplyWslConfig,

    [Parameter(Mandatory = $false)]
    [switch]$InstallBase,

    [Parameter(Mandatory = $false)]
    [switch]$InstallCluster
)

$ErrorActionPreference = "Stop"
Import-Module (Join-Path $PSScriptRoot "lib\wsl-helpers.psm1") -Force

if (-not (Test-WSLInstalled)) {
    throw "wsl.exe was not found on this Windows host. Enable WSL2 via 'wsl.exe --install --no-distribution' first."
}

if ($ApplyWslConfig) {
    $template = Join-Path $PSScriptRoot "..\config\.wslconfig.example"
    Install-CorporateWSLConfig -TemplatePath $template
    Write-Host "[PASS] Installed %UserProfile%\.wslconfig (existing file backed up to .wslconfig.bak if present)." -ForegroundColor Green
}

$wallpaperSource = Join-Path $PSScriptRoot "..\..\distros\shared\assets\monygang.png"
if (Test-Path $wallpaperSource) {
    $fragmentDir = Join-Path $env:LOCALAPPDATA "Microsoft\Windows Terminal\Fragments\Microsoft.WSL"
    New-Item -ItemType Directory -Force -Path $fragmentDir | Out-Null
    Copy-Item -Path $wallpaperSource -Destination (Join-Path $fragmentDir "monygang.png") -Force
    Write-Host "[PASS] Staged shared Windows Terminal wallpaper into $fragmentDir\monygang.png" -ForegroundColor Green
}

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) {
    Set-CorporateWSLCatalog -CatalogUrl $CatalogUrl
    Write-Host "[PASS] Registered corporate WSL catalog in HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss" -ForegroundColor Green
} else {
    Write-Host "[WARN] Not running as Administrator; skipping HKLM registry write (apply host/registry/tupynambalucas-dev.reg to register catalog)." -ForegroundColor Yellow
}

if ($InstallBase) {
    & wsl.exe --install -d tupynambalucas-dev
}

if ($InstallCluster) {
    & wsl.exe --install -d tupynambalucas-dev-cluster
}
