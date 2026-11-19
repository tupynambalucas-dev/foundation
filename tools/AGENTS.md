<context-hierarchy>
  <parent-context path="../AGENTS.md" description="Layer 1: Workstation Monorepo Root Agent Context Router" />
</context-hierarchy>

# Developer Toolchain & CLI Subsystem Agent Context (`tools/`)

This document serves as the Layer-2 bounded context router for `workstation/tools/`, governing the developer toolchain workspace, CLI automation, and GitHub extensions modeled after the `platform/tools` architecture.

## Subsystem Architecture & Layer-3 Packages

| Layer | Package | Context Router | Documentation | Primary Responsibility |
| :-: | :--- | :--- | :--- | :--- |
| **3** | [`tools/github/`](./github/AGENTS.md) | [`github/AGENTS.md`](./github/AGENTS.md) | [`github/README.md`](./github/README.md) | GitHub CLI ecosystem and precompiled extension modules (`extensions/gh-tl/`). |

## Subsystem Governance Rules

1. **Encapsulated Toolchains**: CLI extension modules house their own language-specific manifests (`go.mod`, `go.sum`) inside their respective extension package (`tools/github/extensions/<name>/`). The root monorepo contains strictly zero CLI manifests.
2. **Turborepo Integration**: Toolchain packages declare a `package.json` manifest exposing `build`, `lint`, `typecheck`, and `test` scripts connected into Turborepo's unified pipeline.
3. **Multi-Extension Scalability**: New extensions must be structured under `tools/github/extensions/gh-<slug>/`.
