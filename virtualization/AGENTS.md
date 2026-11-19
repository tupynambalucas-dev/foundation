<context-hierarchy>
  <parent-context path="../AGENTS.md" description="Layer 1: Workstation Monorepo Root Agent Context Router" />
</context-hierarchy>

# Windows Host, Registry & Hypervisor Governance Agent Context (`virtualization/`)

This document serves as the Layer-2 bounded context router for `workstation/virtualization/`, governing Windows 11 host virtualization settings (`%UserProfile%\.wslconfig`), Windows Registry `ModernDistributions` catalog registration (`HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss`), workspace package orchestration, and host readiness governance.

## Architectural Scope & Assets

- [`virtualization/package.json`](./package.json): Workspace package manifest (`@tupynambalucas-dev/workstation-virtualization`).
- [`virtualization/registry/tupynambalucas-dev.reg`](./registry/tupynambalucas-dev.reg): Zero-script Windows Registry fragment registering `DistributionListUrlAppend` so native `wsl.exe --list --online` and `wsl.exe --install` discover `tupynambalucas-dev` and `tupynambalucas-dev-cluster`.
- [`virtualization/registry/override-local-manifest.ps1`](./registry/override-local-manifest.ps1): Local `file:///` manifest testing script following Microsoft Learn's custom distribution testing specification.
- [`virtualization/config/.wslconfig.example`](./config/.wslconfig.example): Authoritative hypervisor resource governance template (`memory=16GB`, `processors=8`, `sparseVhd=true`, `autoMemoryReclaim=gradual`, `dnsTunneling=true`).
- [`virtualization/scripts/install.ps1`](./scripts/install.ps1): Legacy installer script containing an explicit deprecation warning redirecting developers to `gh tl host prepare`.

## Host Safety Guardrails

1. **Non-Destructive `.wslconfig` Updates**: Whenever automating `%UserProfile%\.wslconfig` installation, any pre-existing `.wslconfig` file MUST be backed up to `%UserProfile%\.wslconfig.bak` prior to overwriting.
2. **Additive Catalog Registration**: Always use `DistributionListUrlAppend` (rather than `DistributionListUrl`) in production registry templates so corporate distributions are appended alongside Microsoft's official distribution catalog rather than replacing it.
3. **3-Layer Ceiling**: Do NOT create child `AGENTS.md` or `README.md` files inside `virtualization/config/`, `virtualization/registry/`, or `virtualization/scripts/`.
