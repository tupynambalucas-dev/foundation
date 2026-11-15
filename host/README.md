# Windows Host, Registry & Hypervisor Governance (`host/`)

Layer-2 Bounded Context managing Windows 11 host integration for WSL2 custom distributions, including zero-script Windows Registry catalog registration, `.wslconfig` hypervisor memory/VHDX governance, and Day-0 host onboarding automation.

---

## Asset Catalog

| Asset Path | Purpose |
| :--- | :--- |
| [`registry/tupynambalucas-dev.reg`](./registry/tupynambalucas-dev.reg) | Registers `DistributionListUrlAppend` in `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss` for zero-script `wsl --install` support. |
| [`registry/override-local-manifest.ps1`](./registry/override-local-manifest.ps1) | Configures a `file:///` catalog override pointing to [`../distros/catalog/DistributionInfo.json`](../distros/catalog/DistributionInfo.json) for offline/local `.wsl` testing. |
| [`config/.wslconfig.example`](./config/.wslconfig.example) | Enterprise `%UserProfile%\.wslconfig` template enabling `sparseVhd=true`, `autoMemoryReclaim=gradual`, `nestedVirtualization=true`, and `dnsTunneling=true`. |
| [`scripts/install.ps1`](./scripts/install.ps1) | Optional Day-0 PowerShell bootstrapper that backs up `.wslconfig`, stages `monygang.png` into `$FRAGMENT_ROOT`, registers the catalog, and runs `wsl --install`. |
| [`scripts/lib/wsl-helpers.psm1`](./scripts/lib/wsl-helpers.psm1) | Reusable PowerShell module functions (`Test-WSLInstalled`, `Set-CorporateWSLCatalog`, `Install-CorporateWSLConfig`). |

---

## Usage

### 1. Zero-Script Registry Enrollment (Recommended)

Double-click [`registry/tupynambalucas-dev.reg`](./registry/tupynambalucas-dev.reg) (or deploy via Intune / Group Policy), then run:

```powershell
wsl --list --online
wsl --install tupynambalucas-dev
wsl --install tupynambalucas-dev-cluster
```

### 2. Local Manifest Testing (`file:///` Protocol)

To test locally built `.wsl` archives before publishing a GitHub Release:

```powershell
# Register local file:/// override (requires Elevated PowerShell)
.\host\registry\override-local-manifest.ps1

# Verify catalog resolution
wsl --list --online

# Clear local override when finished
.\host\registry\override-local-manifest.ps1 -ClearOverride
```

### 3. Day-0 Host Readiness Script

```powershell
.\host\scripts\install.ps1 -ApplyWslConfig -InstallBase -InstallCluster
```

---

## Navigation

- [Workstation Monorepo Root (`../README.md`)](../README.md)
- [WSL2 Distributions Subsystem (`../distros/README.md`)](../distros/README.md)
- [Developer CLI Subsystem (`../cli/README.md`)](../cli/README.md)
