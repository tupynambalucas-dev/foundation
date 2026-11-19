# Enrolling the WSL Distribution Catalog

Task-oriented runbook for registering, inspecting, and troubleshooting corporate WSL2 distribution manifests via the Windows Registry `DistributionListUrlAppend` mechanism.

---

## The Problem

By default, `wsl.exe --list --online` queries Microsoft's centralized manifest, showing only stock public distributions (Ubuntu, Debian, openSUSE). Corporate engineers need corporate distributions (`tupynambalucas-dev` and `tupynambalucas-dev-cluster`) to appear natively in `wsl.exe --list --online` and stream directly during `wsl.exe --install -d <name>` without requiring local Docker daemon setups.

---

## Solution Overview

WSL 2.4.4+ introduced native federation via the Windows Registry value:

- **Key**: `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss`
- **Value Name**: `DistributionListUrlAppend`
- **Type**: `REG_SZ` (String)
- **Value**: `https://github.com/tupynambalucas-dev/workstation/releases/latest/download/DistributionInfo.json`

When populated, WSL merges distributions declared in this remote JSON manifest with Microsoft's default catalog.

---

## Method 1: Automated Registration via Go CLI (Recommended)

The fastest and most deterministic method is executing `gh tl host prepare` in an **Elevated (Administrator)** terminal:

```bash
gh tl host prepare
```

### Verification:

Run `gh tl host verify` to assert that the key is present and matches the Single Source of Truth (SSOT):

```bash
gh tl host verify
```

Expected output:
```text
 PASS Gate 2 [WSL Catalog]: Canonical registry catalog URL registered
```

---

## Method 2: Manual Registration via PowerShell (Elevated)

If the CLI is not yet installed, you can set the registry key manually in Windows PowerShell:

```powershell
# Open PowerShell as Administrator
$RegistryPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss"
$CatalogUrl = "https://github.com/tupynambalucas-dev/workstation/releases/latest/download/DistributionInfo.json"

if (-not (Test-Path $RegistryPath)) {
    New-Item -Path $RegistryPath -Force | Out-Null
}

Set-ItemProperty -Path $RegistryPath -Name "DistributionListUrlAppend" -Value $CatalogUrl -Type String
Write-Host "Successfully registered WSL distribution catalog URL."
```

---

## Method 3: Registration via Windows Registry File (.reg)

Double-click the pre-built registry file located at:

```text
virtualization/registry/tupynambalucas-dev.reg
```

Or apply it from the command line:

```cmd
reg import virtualization\registry\tupynambalucas-dev.reg
```

---

## Testing Catalog Discovery

Once registered, query the online catalog:

```bash
wsl.exe --list --online
```

You should observe the following entries listed:

```text
NAME                                           FRIENDLY NAME
tupynambalucas-dev                             tupynambalucas-dev (Ubuntu 26.04 LTS)
tupynambalucas-dev-cluster                     tupynambalucas-dev-cluster (Ubuntu 26.04 LTS Kubernetes)
```

---

## Troubleshooting

### 1. Registry Value Present but Distros Do Not Appear

- **Cause**: WSL caches catalog metadata.
- **Fix**: Force a restart of the WSL service:
  ```powershell
  wsl.exe --shutdown
  Get-Service WslService | Restart-Service
  ```

### 2. Network Fetch Failure (HTTP 404 or 403)

- **Cause**: The remote release has not yet been cut or the URL points to a pre-release without an attached `DistributionInfo.json`.
- **Fix**: Verify accessibility of the URL in your browser or with curl:
  ```bash
  curl -fsSL https://github.com/tupynambalucas-dev/workstation/releases/latest/download/DistributionInfo.json
  ```
  If you are testing locally, override the URL to point to a local file or staging server via `virtualization/registry/override-local-manifest.ps1`.

### 3. Permission Denied Writing to Registry

- **Cause**: Modifying `HKLM` requires administrative privileges.
- **Fix**: Launch your terminal via **Run as Administrator** before executing `gh tl host prepare` or PowerShell scripts.

---

## Related References

- [Distribution Catalog Schema](../reference/distribution-catalog-schema.md)
- [Modern WSL Catalog vs Legacy Distros](../explanation/modern-wsl-catalog-vs-legacy-distros.md)
