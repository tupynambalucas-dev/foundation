# Foundation Bounded-Context Monorepo Agent Context Router

This document serves as the Layer-1 root context router for AI agents operating inside `tupynambalucas-dev/foundation`, the enterprise foundation monorepo hosting WSL2 custom distributions (`distributions/`), developer toolchain & GitHub CLI extension suite (`tools/`), machine identities and Token Broker (`identity/`), and Windows host virtualization governance (`virtualization/`).

When operating within the `org-core` umbrella workspace, also inherit root organizational policies from [`../AGENTS.md`](../AGENTS.md).

## Architectural Boundaries & Core Principles

- **Repository Slug**: `tupynambalucas-dev/foundation`
- **Monorepo Workspace Orchestrator**: Root [`package.json`](./package.json), [`pnpm-workspace.yaml`](./pnpm-workspace.yaml), and [`turbo.json`](./turbo.json) driving unified task pipelines (`build`, `lint`, `typecheck`, `test`).
- **Clean Root Invariant**: Language-specific CLI build manifests (`go.mod`, `go.sum`) reside strictly inside [`tools/github/extensions/gh-tl/`](./tools/github/extensions/gh-tl/go.mod) and [`identity/broker/`](./identity/broker/go.mod).
- **Go Module Identity**: `github.com/tupynambalucas-dev/foundation/tools/github/extensions/gh-tl`.
- **Root CLI Invocations**: `tl <command>` (standalone) or `gh tl <command>` (GitHub CLI precompiled extension).
- **Engineering Principles**:
  1. **DDD & Feature-Sliced Design (FSD)**: Strict Layer-2 separation across `distributions/`, `tools/`, and `virtualization/`. Within `gh-tl`, dependencies flow unidirectionally downward (`cmd -> domains/* -> internal/*`).
  2. **SOLID Principles**: Narrow role-segregated interfaces in `contracts/`, dependency injection for deterministic testing, and open/closed extensibility.
  3. **Single Source of Truth (SSOT)**: Authoritative WSL catalog in `distributions/catalog/DistributionInfo.json` and centralized organizational constants in `tools/github/extensions/gh-tl/internal/config/config.go`.
  4. **Strict Catalog Dependencies**: All workspace packages consume dependencies strictly via pnpm catalogs defined in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml).

## Bounded Context Navigation (Layer 2 & Layer 3)

| Layer | Bounded Context | Context Router | Documentation | Responsibility |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Monorepo Root (`.` )** | [`AGENTS.md`](./AGENTS.md) | [`README.md`](./README.md) | Monorepo workspace orchestration (pnpm + Turbo), CI/CD pipelines, and cross-domain routing. |
| **2** | **WSL2 Distributions (`distributions/`)** | [`distributions/AGENTS.md`](./distributions/AGENTS.md) | [`distributions/README.md`](./distributions/README.md) | Distribution-as-Code (`.wsl`) on Ubuntu 26.04 LTS, catalog manifest, and shared OOBE/systemd scripts. |
| **3** | **Base Workstation (`distributions/base/`)** | [`distributions/base/AGENTS.md`](./distributions/base/AGENTS.md) | [`distributions/base/README.md`](./distributions/base/README.md) | `tupynambalucas-dev`: daily polyglot engineering rootfs with socket-activated Docker and `Dev`/`Admin` terminal profile. |
| **3** | **Cluster Engine (`distributions/cluster/`)** | [`distributions/cluster/AGENTS.md`](./distributions/cluster/AGENTS.md) | [`distributions/cluster/README.md`](./distributions/cluster/README.md) | `tupynambalucas-dev-cluster`: dedicated `k3d` Kubernetes engine with kernel `sysctl` tuning and `Admin` terminal profile. |
| **2** | **Developer Toolchain (`tools/`)** | [`tools/AGENTS.md`](./tools/AGENTS.md) | [`tools/README.md`](./tools/README.md) | Developer toolchain workspace and multi-extension orchestration. |
| **3** | **GitHub Extensions (`tools/github/`)** | [`tools/github/AGENTS.md`](./tools/github/AGENTS.md) | [`tools/github/README.md`](./tools/github/README.md) | GitHub CLI ecosystem and extension modules (`extensions/gh-tl/`). |
| **3** | **gh-tl Extension (`tools/github/extensions/gh-tl/`)** | [`tools/github/extensions/gh-tl/AGENTS.md`](./tools/github/extensions/gh-tl/AGENTS.md) | [`tools/github/extensions/gh-tl/README.md`](./tools/github/extensions/gh-tl/README.md) | Multi-platform Go CLI (`gh tl` / `tl`): cryptographic onboarding, host readiness, and WSL distribution lifecycle. |
| **2** | **Windows Virtualization (`virtualization/`)** | [`virtualization/AGENTS.md`](./virtualization/AGENTS.md) | [`virtualization/README.md`](./virtualization/README.md) | Zero-script `.reg` catalog registration, `%UserProfile%\.wslconfig` template, and hypervisor memory bounds. |
| **2** | **Machine Identities & Portal (`identity/`)** | [`identity/README.md`](./identity/README.md) | [`identity/README.md`](./identity/README.md) | Multi-provider identities (GitHub, Google Cloud), Token Broker vending daemon, compliance legal assets, and Cloudflare Workers portal (`apps.tupynambalucas.dev`). |
| **2** | **Documentation Hub (`references/`)** | [`references/AGENTS.md`](./references/AGENTS.md) | [`references/README.md`](./references/README.md) | Diataxis-structured technical documentation hub (tutorials, how-to-guides, technical reference, architecture explanation). |

## Governance Standards

- **3-Layer Bounded Context Ceiling**: `AGENTS.md` and `README.md` files are strictly capped at Layer 3. Intermediate grouping folders (`tools/github/extensions/`, `distributions/catalog/`, `distributions/shared/`, `virtualization/*`) and planning containers (`.agents/plans/`) MUST NOT declare child `AGENTS.md` or `README.md` files.
- **Cryptographic Signatures**: All Git commits and release tags MUST be signed with SSH (`git commit -S -m "..."`).
- **Conventional Commits**: All commit messages must follow `<type>[optional (<scope>)][!]: <description>` (`<= 72` chars target).
- **Zero-Emoji Invariant**: Emojis are strictly forbidden across all code, terminal UI output, configuration files, PRs, and documentation.
- **Technical Language Policy**: All documentation, code comments, and CLI output MUST be authored strictly in `en-US`.

## Architectural Plans & Artifact Dual-Storage Standard

- **Storage Location**: Blueprints, analyses, and reports reside in `<target-repo>/.agents/plans/<artifact-slug>/` (or `<target-repo>/.agents/plans/<artifact-slug>.md`) within the respective repository for which the artifact is created. Creating a `plans/` directory at the root of any repository is strictly prohibited.
- **Dual-Storage Invariant**: Whenever an agent creates or updates an architectural plan, analysis, or report in `<appDataDir>/brain/<conversation-id>/`, an identical synchronized copy MUST ALWAYS be mirrored in `<target-repo>/.agents/plans/<artifact-slug>/` (or `<target-repo>/.agents/plans/<artifact-slug>.md`).
- **Ignore & Index Triad**: `.agents/plans/` is ignored in [`.gitignore`](./.gitignore), un-ignored in [`.ignore`](./.ignore) and [`.rgignore`](./.rgignore), and indexed in [`.vscode/settings.json`](./.vscode/settings.json) (`"search.useIgnoreFiles": false`).
- **Authoritative Plan Suites**:
  - [Modern Distribution & Universal CLI Architecture Suite](./.agents/plans/distro-distribution-and-cli-architecture/README.md): Master blueprint for cloud-native rootfs packaging, universal Go host readiness, and domain-driven bounded context refactoring.

## Required Skills

- **Atelier Plugin (`@tupynambalucas-dev/plugin-atelier`)**: `plan-architect`, `router-architect`, `skill-architect`, `rule-architect`.
- **Repository Governance Plugin (`@tupynambalucas-dev/plugin-repo`)**: `readme-architect`, `monorepo-architect`, `community-health-architect`, `license-architect`, `github-standards-architect`.
- **GitHub Flow Plugin (`@tupynambalucas-dev/plugin-github-flow`)**: `github-flow-operator`, `github-actions-operator`.
