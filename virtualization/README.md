# Windows Host, Registry & Hypervisor Governance (`virtualization/`)

Layer-2 Bounded Context managing Windows 11 host integration for WSL2 custom distributions, including zero-script Windows Registry catalog registration, `.wslconfig` hypervisor memory/VHDX governance, and workspace package orchestration.

---

## Asset Catalog

| Asset Path | Purpose |
| :--- | :--- |
| [`package.json`](./package.json) | Workspace package manifest (`@tupynambalucas-dev/workstation-virtualization`). |
| [`registry/tupynambalucas-dev.reg`](./registry/tupynambalucas-dev.reg) | Registers `DistributionListUrlAppend` in `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss` for zero-script `wsl --install` support. |
| [`registry/override-local-manifest.ps1`](./registry/override-local-manifest.ps1) | Configures a `file:///` catalog override pointing to [`../distributions/catalog/DistributionInfo.json`](../distributions/catalog/DistributionInfo.json) for offline/local `.wsl` testing. |
| [`config/.wslconfig.example`](./config/.wslconfig.example) | Enterprise `%UserProfile%\.wslconfig` template enabling `sparseVhd=true`, `autoMemoryReclaim=gradual`, `nestedVirtualization=true`, and `dnsTunneling=true`. |
| [`scripts/install.ps1`](./scripts/install.ps1) | Legacy PowerShell bootstrapper retained with deprecation notice redirecting developers to `gh tl host prepare`. |

---

## Usage

### 1. Universal Go CLI Host Preparation (Recommended)

```powershell
# Prepare Windows host: registry enrollment, .wslconfig backup/staging, and terminal fragments
gh tl host prepare

# Verify host readiness gates
gh tl host verify

# Install distribution via native WSL streaming
gh tl distro install tupynambalucas-dev
```

### 2. Zero-Script Registry Enrollment (Manual / Intune GPO)

Double-click [`registry/tupynambalucas-dev.reg`](./registry/tupynambalucas-dev.reg) (or deploy via Intune / Group Policy), then run:

```powershell
wsl.exe --list --online
wsl.exe --install -d tupynambalucas-dev
```

### 3. Local Manifest Testing (`file:///` Protocol)

```powershell
# Register local file:/// override (requires Elevated PowerShell)
.\virtualization\registry\override-local-manifest.ps1

# Verify catalog resolution
wsl.exe --list --online

# Clear local override when finished
.\virtualization\registry\override-local-manifest.ps1 -ClearOverride
```

---

## Navigation

- [Workstation Monorepo Root (`../README.md`)](../README.md)
- [WSL2 Distributions Subsystem (`../distributions/README.md`)](../distributions/README.md)
- [Developer Toolchain & CLI (`../extensions/README.md`)](../extensions/README.md)
- [Documentation Hub (`../references/README.md`)](../references/README.md)
