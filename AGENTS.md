# Foundation Bounded-Context Monorepo Agent Context Router

This document serves as the Layer-1 root context router for AI agents operating inside `tupynambalucas-dev/foundation`, the enterprise foundation monorepo hosting WSL2 custom distributions (`distributions/`), host virtualization governance (`virtualization/`), machine identities, Token Broker, and Cloudflare Identity Portal (`identity/`), developer CLI extensions (`extensions/`), developer environment governance (`environment/`), and Diataxis documentation (`references/`).

When operating within the `org` umbrella workspace, also inherit root organizational policies from [`../AGENTS.md`](../AGENTS.md).

## Architectural Boundaries & Ubiquitous Language

- **Repository Slug**: `tupynambalucas-dev/foundation`
- **Monorepo Workspace Orchestrator**: Root [`package.json`](./package.json), [`pnpm-workspace.yaml`](./pnpm-workspace.yaml), and [`turbo.json`](./turbo.json) driving unified task pipelines (`build`, `lint`, `typecheck`, `test`).
- **Clean Root Invariant**: Go build manifests (`go.mod`, `go.sum`) reside strictly inside [`extensions/gh-tl/`](./extensions/gh-tl/go.mod) and [`identity/broker/`](./identity/broker/go.mod).
- **Root CLI Invocations**: `tl <command>` (standalone) or `gh tl <command>` (GitHub CLI precompiled extension).
- **Engineering Principles**:
  1. **DDD & Feature-Sliced Design (FSD)**: Strict Layer-2 separation across `distributions/`, `virtualization/`, `identity/`, `extensions/`, `environment/`, and `references/`.
  2. **SOLID Principles**: Narrow role-segregated interfaces, dependency injection for deterministic testing, and open/closed extensibility.
  3. **Single Source of Truth (SSOT)**: Authoritative WSL catalog in `distributions/catalog/DistributionInfo.json` and declarative 4-Tier GitHub App manifests in `identity/apps/github/`.
  4. **Strict Catalog Dependencies**: All workspace packages consume dependencies strictly via pnpm catalogs defined in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml).

## Bounded Context Navigation (Layer 2 & Layer 3)

| Layer | Bounded Context / Package | Context Router | Documentation | Responsibility |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Monorepo Root (`.`)** | [`AGENTS.md`](./AGENTS.md) | [`README.md`](./README.md) | Monorepo workspace orchestration (pnpm + Turbo), CI/CD pipelines, and cross-domain routing. |
| **2** | **WSL2 Distributions (`distributions/`)** | [`distributions/AGENTS.md`](./distributions/AGENTS.md) | [`distributions/README.md`](./distributions/README.md) | Distribution-as-Code (`.wsl`) on Ubuntu 26.04 LTS, catalog manifest, and shared OOBE/systemd scripts. |
| **3** | `distributions/base/` | [`distributions/base/AGENTS.md`](./distributions/base/AGENTS.md) | [`distributions/base/README.md`](./distributions/base/README.md) | `tupynambalucas-dev`: daily polyglot engineering rootfs with socket-activated Docker. |
| **3** | `distributions/cluster/` | [`distributions/cluster/AGENTS.md`](./distributions/cluster/AGENTS.md) | [`distributions/cluster/README.md`](./distributions/cluster/README.md) | `tupynambalucas-dev-cluster`: dedicated `k3d` Kubernetes engine with kernel `sysctl` tuning. |
| **2** | **Windows Virtualization (`virtualization/`)** | [`virtualization/AGENTS.md`](./virtualization/AGENTS.md) | [`virtualization/README.md`](./virtualization/README.md) | Zero-script `.reg` catalog registration, `.wslconfig` template, and hypervisor memory bounds. |
| **2** | **Machine Identities & Portal (`identity/`)** | [`identity/AGENTS.md`](./identity/AGENTS.md) | [`identity/README.md`](./identity/README.md) | 4-Tier GitHub Apps manifests, Go Token Broker, compliance pages, and `apps.tupynambalucas.dev`. |
| **3** | `identity/broker/` | [`identity/broker/AGENTS.md`](./identity/broker/AGENTS.md) | [`identity/broker/README.md`](./identity/broker/README.md) | Go Security Token Service (STS) minting down-scoped 1h Installation Access Tokens. |
| **3** | `identity/portal/core/` | [`identity/portal/core/AGENTS.md`](./identity/portal/core/AGENTS.md) | [`identity/portal/core/README.md`](./identity/portal/core/README.md) | Shared TypeScript domain contracts, live app status types, and canonical route constants. |
| **3** | `identity/portal/web/` | [`identity/portal/web/AGENTS.md`](./identity/portal/web/AGENTS.md) | [`identity/portal/web/README.md`](./identity/portal/web/README.md) | React 19 + Vite + FSD frontend SPA hydrated dynamically via `GET /api/apps/status`. |
| **3** | `identity/portal/api/` | [`identity/portal/api/AGENTS.md`](./identity/portal/api/AGENTS.md) | [`identity/portal/api/README.md`](./identity/portal/api/README.md) | Cloudflare Worker + `PrGateEvaluatorWorkflow` + Zero Trust Manifest Flow + Infisical callback. |
| **2** | **Developer CLI Extensions (`extensions/`)** | [`extensions/AGENTS.md`](./extensions/AGENTS.md) | [`extensions/README.md`](./extensions/README.md) | Sovereign developer CLI extensions and workflow accelerators. |
| **3** | `extensions/gh-tl/` | [`extensions/gh-tl/AGENTS.md`](./extensions/gh-tl/AGENTS.md) | [`extensions/gh-tl/README.md`](./extensions/gh-tl/README.md) | Multi-platform Go CLI (`gh tl` / `tl`): cryptographic onboarding, host readiness, and WSL lifecycle. |
| **2** | **Developer Environment (`environment/`)** | [`environment/AGENTS.md`](./environment/AGENTS.md) | [`environment/README.md`](./environment/README.md) | Universal editor standards, formatting specifications, and IDE configuration profiles. |
| **3** | `environment/ide/vscode/` | [`environment/ide/vscode/AGENTS.md`](./environment/ide/vscode/AGENTS.md) | [`environment/ide/vscode/README.md`](./environment/ide/vscode/README.md) | Enterprise VS Code profiles, extension compatibility matrices, and keybindings. |
| **2** | **Documentation Hub (`references/`)** | [`references/AGENTS.md`](./references/AGENTS.md) | [`references/README.md`](./references/README.md) | Diataxis-structured technical documentation hub (`tutorials/`, `how-to-guides/`, `reference/`, `explanation/`). |

## Operational & Security Guardrails

- **3-Layer Bounded Context Ceiling**: `AGENTS.md` routers are strictly capped at Layer 3. Intermediate grouping directories (`identity/portal/`, `identity/apps/`, `environment/ide/`, `distributions/catalog/`, `distributions/shared/`, `references/*`) and `.agents/plans/` MUST NOT declare `AGENTS.md` files.
- **Cryptographic Signatures**: All Git commits and annotated tags MUST be signed with SSH (`git commit -S -m "..."`).
- **Conventional Commits**: All commit messages MUST follow `<type>[optional (<scope>)][!]: <description>` (`<= 72` chars target).
- **Zero-Emoji & Language Policy**: Zero emojis everywhere; code, configs, commits, and repository docs strictly in `en-US`; `.agents/plans/` suites strictly in `pt-BR`.

## Architectural Plans & Dual-Storage Matrix

- **3-Folder Lifecycle Taxonomy**: Plans reside strictly inside `.agents/plans/{pending,completed,superseded}/<plan-slug>/` in `pt-BR`, mirrored identically in `<appDataDir>/brain/<conversation-id>/<plan-slug>/`.
- **Ignore & Index Triad**: `.agents/plans/` is ignored in [`.gitignore`](./.gitignore) and un-ignored in [`.ignore`](./.ignore) and [`.rgignore`](./.rgignore).

## Required Skills

- **Atelier (`@tupynambalucas-dev/plugin-atelier`)**: `plan-architect`, `router-architect`, `skill-architect`, `rule-architect`.
- **Identity (`@tupynambalucas-dev/plugin-identity`)**: `app-manifest-architect`, `identity-portal-architect`, `token-broker-operator`.
- **Cloudflare (`@tupynambalucas-dev/plugin-cloudflare`)**: `wrangler`, `workers-best-practices`, `cloudflare-one`.
- **GitHub (`@tupynambalucas-dev/plugin-github-*`)**: `readme-architect`, `monorepo-architect`, `github-flow-operator`, `github-actions-operator`.
