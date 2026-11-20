# Changelog - tupynambalucas-dev/workstation

All notable changes to the `workstation` enterprise developer workstation monorepo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- changelog-start -->

## [0.2.0] - 2026-11-20

### Features & Capabilities

- [feat(distro): introduce socket-activated Docker engine (`docker.socket`) in base developer workstation image #6](https://github.com/tupynambalucas-dev/workstation/pull/6)
- [feat(distro): provide dedicated `k3d` Kubernetes node engine with kernel sysctl tuning in cluster image #6](https://github.com/tupynambalucas-dev/workstation/pull/6)
- [feat(distro): implement First-Boot Out-of-Box Experience (`/etc/oobe.sh`) for zero-key duplication across host and WSL #6](https://github.com/tupynambalucas-dev/workstation/pull/6)
- [feat(host): native Win32 Go registry catalog federation via `gh tl host prepare` #6](https://github.com/tupynambalucas-dev/workstation/pull/6)
- [feat(host): non-destructive automatic backup for `%UserProfile%\.wslconfig` (`.wslconfig.bak`) #6](https://github.com/tupynambalucas-dev/workstation/pull/6)
- [feat(host): stage corporate wallpaper and Windows Terminal fragments dynamically #6](https://github.com/tupynambalucas-dev/workstation/pull/6)
- [feat(cli): transparent catalog auto-enrollment in `gh tl distro install` #6](https://github.com/tupynambalucas-dev/workstation/pull/6)
- [feat(cli): non-destructive host readiness audit with 5 validation gates in `gh tl host verify` #6](https://github.com/tupynambalucas-dev/workstation/pull/6)
- [feat(cli): cryptographic onboarding and 7 readiness gates in `gh tl onboard` and `gh tl verify` #6](https://github.com/tupynambalucas-dev/workstation/pull/6)
- [feat(release): deploy modular composite actions, cliff.toml, and 3-job atomic release pipeline #9](https://github.com/tupynambalucas-dev/workstation/pull/9)

### Refactoring & Internal Architecture

- [refactor(architecture): enforce Clean Root Invariant, relocating `go.mod` and `go.sum` into `tools/github/extensions/gh-tl/` #6](https://github.com/tupynambalucas-dev/workstation/pull/6)
- [refactor(architecture): establish pnpm workspaces (pnpm v12), Turborepo task pipelines, and solution TypeScript project references #6](https://github.com/tupynambalucas-dev/workstation/pull/6)

### Documentation & Specifications

- [docs(references): establish Diataxis documentation hub across 4 quadrants #7](https://github.com/tupynambalucas-dev/workstation/pull/7)
- [docs(references): document modern WSL catalog federation vs legacy distributions #7](https://github.com/tupynambalucas-dev/workstation/pull/7)
- [docs(references): document host readiness and PowerShell installer deprecation rationale #7](https://github.com/tupynambalucas-dev/workstation/pull/7)
- [docs(workstation): align subsystems and navigation with bounded context architecture #8](https://github.com/tupynambalucas-dev/workstation/pull/8)
- [docs(changelog): standardize v0.1.0 entries and set release title to version #10](https://github.com/tupynambalucas-dev/workstation/pull/10)

### Bug Fixes & Corrections

- [fix(ignore): remove trailing wildcard from `.ignore` and `.rgignore` #5](https://github.com/tupynambalucas-dev/workstation/pull/5)

---

## [0.1.0] - 2026-10-31

Initial release of the `tupynambalucas-dev` developer workstation tooling and GitHub CLI extension suite.

### Features & Capabilities

- [feat(cli): initialize unified gh-tl extension suite combining developer onboarding and system tools (49ae855)](https://github.com/tupynambalucas-dev/workstation/commit/49ae855)
- [feat(onboard): cryptographic developer onboarding with SSH Ed25519 key generation and Git signing (531ad0d)](https://github.com/tupynambalucas-dev/workstation/commit/531ad0d)

### Refactoring & Internal Architecture

- [refactor(cli): modularize command structure and encapsulate domain implementations (dbcba51)](https://github.com/tupynambalucas-dev/workstation/commit/dbcba51)

### Documentation & Specifications

- [docs(governance): add Layer-1 AGENTS.md context router and developer runbooks (8a18075)](https://github.com/tupynambalucas-dev/workstation/commit/8a18075)
- [docs(release): set release version tag reference to v0.1.0 (c4718a5)](https://github.com/tupynambalucas-dev/workstation/commit/c4718a5)

[0.2.0]: https://github.com/tupynambalucas-dev/workstation/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tupynambalucas-dev/workstation/releases/tag/v0.1.0
