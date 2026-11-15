<#
.SYNOPSIS
    Overrides or appends the local WSL ModernDistributions manifest URL for testing custom .wsl archives.
.DESCRIPTION
    Follows the official Microsoft Learn local distribution testing specification:
    https://learn.microsoft.com/en-us/windows/wsl/build-custom-distro#test-the-distribution-locally
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$ManifestPath = (Join-Path $PSScriptRoot "..\..\distros\catalog\DistributionInfo.json"),

    [Parameter(Mandatory = $false)]
    [switch]$ClearOverride
)

$ErrorActionPreference = "Stop"
$lxssRegistryPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss"

if ($ClearOverride) {
    Remove-ItemProperty -Path $lxssRegistryPath -Name "DistributionListUrl" -ErrorAction SilentlyContinue
    Write-Host "[PASS] Cleared local DistributionListUrl override." -ForegroundColor Green
    exit 0
}

$resolved = (Resolve-Path $ManifestPath).Path.Replace('\', '/')
$fileUri = "file:///$resolved"

Set-ItemProperty -Path $lxssRegistryPath -Name "DistributionListUrlAppend" -Value $fileUri -Type String
Write-Host "[PASS] Registered local WSL catalog override: $fileUri" -ForegroundColor Green
Write-Host "[INFO] Verify with: wsl.exe --list --online" -ForegroundColor Cyan
