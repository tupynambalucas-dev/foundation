# Workstation Bounded-Context Monorepo Agent Context Router

This document serves as the Layer-1 root context router for AI agents operating inside `tupynambalucas-dev/workstation`, the sovereign developer workstation monorepo hosting WSL2 custom distributions (`distros/`), the developer CLI & GitHub CLI extension suite (`cli/`), and Windows host virtualization governance (`host/`).

 When operating within the `org-core` umbrella workspace, also inherit root organizational policies from [`../AGENTS.md`](../AGENTS.md).

## Architectural Boundaries & Core Principles

- **Repository Slug**: `tupynambalucas-dev/workstation`
- **Go Module Identity (SSOT)**: `github.com/tupynambalucas-dev/workstation` (rooted at [`./go.mod`](./go.mod) via Inherited Configuration, with CLI entrypoint at `./cli/cmd/tl`).
- **Root CLI Invocations**: `tl <command>` (standalone), `gh tl <command>`, or `gh workstation <command>` (GitHub CLI precompiled extension).
- **Engineering Principles**:
  1. **DDD & Feature-Sliced Design (FSD)**: Strict Layer-2 separation across `distros/`, `cli/`, and `host/`. Within `cli/`, dependencies flow unidirectionally downward (`cli/cmd -> cli/domains/* -> cli/internal/*`).
  2. **SOLID Principles**: Narrow role-segregated interfaces in `cli/internal/contracts/` (`GitConfigReader` vs. `GitConfigMutator`, `WSLDistroInspector` vs. `WSLDistroOperator`), dependency injection for deterministic testing, and open/closed extensibility.
  3. **Single Source of Truth (SSOT)**: Authoritative WSL catalog in `distros/catalog/DistributionInfo.json` and centralized organizational constants in `cli/internal/config/config.go`.
  4. **Inherited Configuration**: `distros/cluster/Dockerfile` extends `tupynambalucas-dev-base:latest`; child `AGENTS.md` routers inherit from parent layers via `<context-hierarchy>`.

## Bounded Context Navigation (Layer 2 & Layer 3)

| Layer | Bounded Context | Context Router | Documentation | Responsibility |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Monorepo Root (`.` )** | [`AGENTS.md`](./AGENTS.md) | [`README.md`](./README.md) | Monorepo governance, Go module anchor, CI/CD pipelines, and cross-domain routing. |
| **2** | **WSL2 Distributions (`distros/`)** | [`distros/AGENTS.md`](./distros/AGENTS.md) | [`distros/README.md`](./distros/README.md) | Distribution-as-Code (`.wsl`) on Ubuntu 26.04 LTS, catalog manifest, and shared OOBE/systemd scripts. |
| **3** | **Base Workstation (`distros/base/`)** | [`distros/base/AGENTS.md`](./distros/base/AGENTS.md) | [`distros/base/README.md`](./distros/base/README.md) | `tupynambalucas-dev`: daily polyglot engineering rootfs with socket-activated Docker and `Dev`/`Admin` terminal profile. |
| **3** | **Cluster Engine (`distros/cluster/`)** | [`distros/cluster/AGENTS.md`](./distros/cluster/AGENTS.md) | [`distros/cluster/README.md`](./distros/cluster/README.md) | `tupynambalucas-dev-cluster`: dedicated `k3d` Kubernetes engine with kernel `sysctl` tuning and `Admin` terminal profile. |
| **2** | **Developer CLI Suite (`cli/`)** | [`cli/AGENTS.md`](./cli/AGENTS.md) | [`cli/README.md`](./cli/README.md) | Cobra CLI & GitHub CLI extension (`tl` / `gh tl`) and shared `cli/internal/*` adapters. |
| **3** | **Onboarding Domain (`cli/domains/onboard/`)** | [`cli/domains/onboard/AGENTS.md`](./cli/domains/onboard/AGENTS.md) | [`cli/domains/onboard/README.md`](./cli/domains/onboard/README.md) | `tl onboard` and `tl verify`: Ed25519 SSH key provisioning, conditional Git `includeIf`, and 7 readiness gates. |
| **3** | **Distro Lifecycle Domain (`cli/domains/distro/`)** | [`cli/domains/distro/AGENTS.md`](./cli/domains/distro/AGENTS.md) | [`cli/domains/distro/README.md`](./cli/domains/distro/README.md) | `tl distro list|status|install`: WSL2 catalog discovery, SHA-256 verification, and native `wsl.exe` installation. |
| **2** | **Windows Host Governance (`host/`)** | [`host/AGENTS.md`](./host/AGENTS.md) | [`host/README.md`](./host/README.md) | Zero-script `.reg` catalog registration, `%UserProfile%\.wslconfig` template, and Day-0 `install.ps1` readiness script. |

## Governance Standards

- **3-Layer Bounded Context Ceiling**: `AGENTS.md` and `README.md` files are strictly capped at Layer 3. Intermediate grouping folders (`cli/domains/`, `cli/cmd/`, `cli/internal/*`, `distros/catalog/`, `distros/shared/`, `host/*`) and planning containers (`.agents/plans/`) MUST NOT declare child `AGENTS.md` or `README.md` files.
- **Cryptographic Signatures**: All Git commits and release tags MUST be signed with SSH (`git commit -S -m "..."`).
- **Conventional Commits**: All commit messages must follow `<type>[optional (<scope>)][!]: <description>` (`<= 72` chars target).
- **Zero-Emoji Invariant**: Emojis are strictly forbidden across all code, terminal UI output, configuration files, PRs, and documentation.
- **Technical Language Policy**: All documentation, code comments, and CLI output MUST be authored strictly in `en-US`.

## Architectural Plans & Artifact Dual-Storage Standard

- **Storage Location**: Blueprints, analyses, and reports reside in `<target-repo>/.agents/plans/<artifact-slug>/` (or `<target-repo>/.agents/plans/<artifact-slug>.md`) within the respective repository for which the artifact is created. Creating a `plans/` directory at the root of any repository is strictly prohibited.
- **Dual-Storage Invariant**: Whenever an agent creates or updates an architectural plan, analysis, or report in `<appDataDir>/brain/<conversation-id>/`, an identical synchronized copy MUST ALWAYS be mirrored in `<target-repo>/.agents/plans/<artifact-slug>/` (or `<target-repo>/.agents/plans/<artifact-slug>.md`).
- **Ignore & Index Triad**: `.agents/plans/` is ignored in [`.gitignore`](./.gitignore), un-ignored in [`.ignore`](./.ignore) and [`.rgignore`](./.rgignore), and indexed in [`.vscode/settings.json`](./.vscode/settings.json) (`"search.useIgnoreFiles": false`).

## Required Skills

- **Atelier Plugin (`@tupynambalucas-dev/plugin-atelier`)**: `plan-architect`, `router-architect`, `skill-architect`, `rule-architect`.
- **Repository Governance Plugin (`@tupynambalucas-dev/plugin-repo`)**: `readme-architect`, `monorepo-architect`, `community-health-architect`, `license-architect`, `github-standards-architect`.
- **GitHub Flow Plugin (`@tupynambalucas-dev/plugin-github-flow`)**: `github-flow-operator`, `github-actions-operator`.
