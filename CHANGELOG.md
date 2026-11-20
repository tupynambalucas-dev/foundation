# Changelog - tupynambalucas-dev/workstation

All notable changes to the `workstation` enterprise developer workstation monorepo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-11-20

### Features & Capabilities

- **distro** (`distributions/base`, `distributions/cluster`)
  - feat(distro): introduce socket-activated Docker engine (`docker.socket`) in base developer workstation image (#6)
  - feat(distro): provide dedicated `k3d` Kubernetes node engine with kernel sysctl tuning in cluster image (#6)
  - feat(distro): implement First-Boot Out-of-Box Experience (`/etc/oobe.sh`) for zero-key duplication across host and WSL (#6)

- **host** (`virtualization/`, `tools/github/extensions/gh-tl`)
  - feat(host): native Win32 Go registry catalog federation via `gh tl host prepare` (#6)
  - feat(host): non-destructive automatic backup for `%UserProfile%\.wslconfig` (`.wslconfig.bak`) (#6)
  - feat(host): stage corporate wallpaper and Windows Terminal fragments dynamically (#6)

- **cli** (`tools/github/extensions/gh-tl`)
  - feat(cli): transparent catalog auto-enrollment in `gh tl distro install` (#6)
  - feat(cli): non-destructive host readiness audit with 5 validation gates in `gh tl host verify` (#6)
  - feat(cli): cryptographic onboarding and 7 readiness gates in `gh tl onboard` and `gh tl verify` (#6)

### Architecture & Refactoring

- **workstation** (root monorepo)
  - refactor(architecture): enforce Clean Root Invariant, relocating `go.mod` and `go.sum` into `tools/github/extensions/gh-tl/` (#6)
  - refactor(architecture): establish pnpm workspaces (pnpm v12), Turborepo task pipelines, and solution TypeScript project references (#6)

### Documentation & Governance

- **references** (`references/tutorials`, `references/how-to-guides`, `references/reference`, `references/explanation`)
  - docs(references): establish Diataxis documentation hub across 4 quadrants (#7)
  - docs(references): document modern WSL catalog federation vs legacy distributions (#7)
  - docs(references): document host readiness and PowerShell installer deprecation rationale (#7)

- **workstation** (subsystem alignment)
  - docs(workstation): align subsystems and navigation with bounded context architecture (#8)

---

## [0.1.0] - 2026-10-31

### Features & Capabilities
- **cli**: initial release of the `gh-tl` extension providing basic onboarding commands and host preparation.

[0.2.0]: https://github.com/tupynambalucas-dev/workstation/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tupynambalucas-dev/workstation/releases/tag/v0.1.0
