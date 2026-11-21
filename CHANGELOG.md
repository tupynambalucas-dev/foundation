# Changelog - @tupynambalucas-dev/foundation

<!-- changelog-start -->

## [0.2.0] - 2026-11-20

### Features & Capabilities

- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) feat(distro): introduce socket-activated Docker engine (`docker.socket`) in base developer workstation image ([@tupynambalucas](https://github.com/tupynambalucas))
- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) feat(distro): provide dedicated `k3d` Kubernetes node engine with kernel sysctl tuning in cluster image ([@tupynambalucas](https://github.com/tupynambalucas))
- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) feat(distro): implement First-Boot Out-of-Box Experience (`/etc/oobe.sh`) for zero-key duplication across host and WSL ([@tupynambalucas](https://github.com/tupynambalucas))
- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) feat(host): native Win32 Go registry catalog federation via `gh tl host prepare` ([@tupynambalucas](https://github.com/tupynambalucas))
- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) feat(host): non-destructive automatic backup for `%UserProfile%\.wslconfig` (`.wslconfig.bak`) ([@tupynambalucas](https://github.com/tupynambalucas))
- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) feat(host): stage corporate wallpaper and Windows Terminal fragments dynamically ([@tupynambalucas](https://github.com/tupynambalucas))
- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) feat(cli): transparent catalog auto-enrollment in `gh tl distro install` ([@tupynambalucas](https://github.com/tupynambalucas))
- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) feat(cli): non-destructive host readiness audit with 5 validation gates in `gh tl host verify` ([@tupynambalucas](https://github.com/tupynambalucas))
- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) feat(cli): cryptographic onboarding and 7 readiness gates in `gh tl onboard` and `gh tl verify` ([@tupynambalucas](https://github.com/tupynambalucas))
- [#9](https://github.com/tupynambalucas-dev/workstation/pull/9) feat(release): deploy modular composite actions, cliff.toml, and 3-job atomic release pipeline ([@tupynambalucas](https://github.com/tupynambalucas))

### Refactoring & Internal Architecture

- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) refactor(architecture): enforce Clean Root Invariant, relocating `go.mod` and `go.sum` into `tools/github/extensions/gh-tl/` ([@tupynambalucas](https://github.com/tupynambalucas))
- [#6](https://github.com/tupynambalucas-dev/workstation/pull/6) refactor(architecture): establish pnpm workspaces (pnpm v12), Turborepo task pipelines, and solution TypeScript project references ([@tupynambalucas](https://github.com/tupynambalucas))

### Documentation & Specifications

- [#7](https://github.com/tupynambalucas-dev/workstation/pull/7) docs(references): establish Diataxis documentation hub across 4 quadrants ([@tupynambalucas](https://github.com/tupynambalucas))
- [#7](https://github.com/tupynambalucas-dev/workstation/pull/7) docs(references): document modern WSL catalog federation vs legacy distributions ([@tupynambalucas](https://github.com/tupynambalucas))
- [#7](https://github.com/tupynambalucas-dev/workstation/pull/7) docs(references): document host readiness and PowerShell installer deprecation rationale ([@tupynambalucas](https://github.com/tupynambalucas))
- [#8](https://github.com/tupynambalucas-dev/workstation/pull/8) docs(workstation): align subsystems and navigation with bounded context architecture ([@tupynambalucas](https://github.com/tupynambalucas))
- [#10](https://github.com/tupynambalucas-dev/workstation/pull/10) docs(changelog): standardize v0.1.0 entries and set release title to version ([@tupynambalucas](https://github.com/tupynambalucas))

### Bug Fixes & Corrections

- [#5](https://github.com/tupynambalucas-dev/workstation/pull/5) fix(ignore): remove trailing wildcard from `.ignore` and `.rgignore` ([@tupynambalucas](https://github.com/tupynambalucas))

### Committers: 1

- Tupynambá Lucas V. R. ([@tupynambalucas](https://github.com/tupynambalucas))

---

## [0.1.0] - 2026-10-31

Initial release of the `tupynambalucas-dev` developer workstation tooling and GitHub CLI extension suite.

### Features & Capabilities

- [49ae855](https://github.com/tupynambalucas-dev/workstation/commit/49ae855) feat(cli): initialize unified gh-tl extension suite combining developer onboarding and system tools ([@tupynambalucas](https://github.com/tupynambalucas))
- [531ad0d](https://github.com/tupynambalucas-dev/workstation/commit/531ad0d) feat(onboard): cryptographic developer onboarding with SSH Ed25519 key generation and Git signing ([@tupynambalucas](https://github.com/tupynambalucas))

### Refactoring & Internal Architecture

- [dbcba51](https://github.com/tupynambalucas-dev/workstation/commit/dbcba51) refactor(cli): modularize command structure and encapsulate domain implementations ([@tupynambalucas](https://github.com/tupynambalucas))

### Documentation & Specifications

- [8a18075](https://github.com/tupynambalucas-dev/workstation/commit/8a18075) docs(governance): add Layer-1 AGENTS.md context router and developer runbooks ([@tupynambalucas](https://github.com/tupynambalucas))
- [c4718a5](https://github.com/tupynambalucas-dev/workstation/commit/c4718a5) docs(release): set release version tag reference to v0.1.0 ([@tupynambalucas](https://github.com/tupynambalucas))

### Committers: 1

- Tupynambá Lucas V. R. ([@tupynambalucas](https://github.com/tupynambalucas))

[0.2.0]: https://github.com/tupynambalucas-dev/workstation/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tupynambalucas-dev/workstation/releases/tag/v0.1.0
