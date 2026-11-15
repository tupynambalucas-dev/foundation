<context-hierarchy>
  <parent-context path="../AGENTS.md" description="Layer 1: Workstation Monorepo Root Agent Context Router" />
</context-hierarchy>

# Windows Host, Registry & Hypervisor Governance Agent Context (`host/`)

This document serves as the Layer-2 bounded context router for `workstation/host/`, governing Windows 11 host virtualization settings (`%UserProfile%\.wslconfig`), Windows Registry `ModernDistributions` catalog registration (`HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss`), and optional Day-0 PowerShell host readiness scripts.

## Architectural Scope & Assets

- [`host/registry/tupynambalucas-dev.reg`](./registry/tupynambalucas-dev.reg): Zero-script Windows Registry fragment registering `DistributionListUrlAppend` so native `wsl.exe --list --online` and `wsl.exe --install` discover `tupynambalucas-dev` and `tupynambalucas-dev-cluster`.
- [`host/registry/override-local-manifest.ps1`](./registry/override-local-manifest.ps1): Local `file:///` manifest testing script following Microsoft Learn's custom distribution testing specification.
- [`host/config/.wslconfig.example`](./config/.wslconfig.example): Authoritative hypervisor resource governance template (`memory=16GB`, `processors=8`, `sparseVhd=true`, `autoMemoryReclaim=gradual`, `dnsTunneling=true`).
- [`host/scripts/install.ps1`](./scripts/install.ps1) & [`host/scripts/lib/wsl-helpers.psm1`](./scripts/lib/wsl-helpers.psm1): Optional Day-0 Windows host readiness automation.

## Host Safety Guardrails

1. **Non-Destructive `.wslconfig` Updates**: Whenever automating `%UserProfile%\.wslconfig` installation via `Install-CorporateWSLConfig`, any pre-existing `.wslconfig` file MUST be backed up to `%UserProfile%\.wslconfig.bak` prior to overwriting.
2. **Additive Catalog Registration**: Always use `DistributionListUrlAppend` (rather than `DistributionListUrl`) in production registry templates so corporate distributions are appended alongside Microsoft's official distribution catalog rather than replacing it.
3. **3-Layer Ceiling**: Do NOT create child `AGENTS.md` or `README.md` files inside `host/config/`, `host/registry/`, or `host/scripts/`.
