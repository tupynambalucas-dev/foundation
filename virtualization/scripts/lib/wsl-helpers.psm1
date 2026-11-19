function Test-WSLInstalled {
    [CmdletBinding()]
    param()
    $cmd = Get-Command "wsl.exe" -ErrorAction SilentlyContinue
    return ($null -ne $cmd)
}

function Set-CorporateWSLCatalog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$CatalogUrl
    )
    $lxssRegistryPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss"
    if (-not (Test-Path $lxssRegistryPath)) {
        New-Item -Path $lxssRegistryPath -Force | Out-Null
    }
    Set-ItemProperty -Path $lxssRegistryPath -Name "DistributionListUrlAppend" -Value $CatalogUrl -Type String
}

function Install-CorporateWSLConfig {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$TemplatePath
    )
    $targetPath = Join-Path $env:USERPROFILE ".wslconfig"
    if (Test-Path $targetPath) {
        $backupPath = "$targetPath.bak"
        Copy-Item -Path $targetPath -Destination $backupPath -Force
    }
    Copy-Item -Path $TemplatePath -Destination $targetPath -Force
}

Export-ModuleMember -Function Test-WSLInstalled, Set-CorporateWSLCatalog, Install-CorporateWSLConfig
