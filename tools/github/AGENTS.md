<context-hierarchy>
  <parent-context path="../AGENTS.md" description="Layer 2: Tools Subsystem Agent Context Router" />
</context-hierarchy>

# GitHub CLI Ecosystem & Extensions Agent Context (`tools/github/`)

This document serves as the Layer-3 bounded context router for `workstation/tools/github/`, governing GitHub CLI integrations, extension packages, and automation modules.

## Managed Extensions

| Extension | Module Path | Package Name | Documentation | Binary Identity |
| :--- | :--- | :--- | :--- | :--- |
| **`gh-tl`** | [`extensions/gh-tl/`](./extensions/gh-tl/AGENTS.md) | `@tupynambalucas-dev/workstation-gh-tl` | [`extensions/gh-tl/README.md`](./extensions/gh-tl/README.md) | `gh tl` / `tl` |

## Extension Guidelines

1. Each extension is fully autonomous under `extensions/gh-<slug>/` containing its own `go.mod`, `go.sum`, `package.json`, and `tsconfig.json`.
2. Binary entrypoints reside in `cmd/tl/main.go` (or `cmd/<slug>/main.go`) to comply with GitHub CLI precompile conventions.
3. Tests must maintain 100% pass rate via `go test -v ./...`.
