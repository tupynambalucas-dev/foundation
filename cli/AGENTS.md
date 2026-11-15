<context-hierarchy>
  <parent-context path="../AGENTS.md" description="Layer 1: Workstation Monorepo Root Agent Context Router" />
</context-hierarchy>

# Developer CLI & GitHub Extension Subsystem Agent Context (`cli/`)

This document serves as the Layer-2 bounded context router for `workstation/cli/`, governing the Go CLI application (`tl` standalone and `gh tl` / `gh workstation` GitHub CLI extensions) and its domain-agnostic internal adapters.

## Unidirectional Feature-Sliced Architecture (DDD / FSD)

Dependencies inside `cli/` flow strictly downward across three internal tiers:

1. **Entrypoint & Root Wiring (`cli/cmd/`)**:
   - [`cli/cmd/tl/main.go`](./cmd/tl/main.go): Binary entrypoint compiled by `go build ./cli/cmd/tl` and `cli/gh-extension-precompile@v2`.
   - [`cli/cmd/root.go`](./cmd/root.go): Root `cobra.Command` registrar combining all domain slices.
2. **Feature Domains (`cli/domains/*`) — Layer 3**:
   - [`cli/domains/onboard/`](./domains/onboard/AGENTS.md): Identity onboarding (`tl onboard`) and 7 pre-flight readiness gates (`tl verify`).
   - [`cli/domains/distro/`](./domains/distro/AGENTS.md): WSL2 custom distribution catalog inspection and installation (`tl distro list|status|install`).
3. **Shared Internal Infrastructure (`cli/internal/*`)**:
   - `contracts`: Segregated SOLID interfaces (`GitConfigReader`, `GitConfigMutator`, `WSLDistroInspector`, `WSLDistroOperator`).
   - `config`: SSOT organizational constants (`DefaultOrg`, `DefaultEmail`, `DefaultCatalogURL`) and Git config generators.
   - `git`: Git CLI wrapper and semantic version parser.
   - `github`: Authenticated GitHub REST API v3 client (`go-gh/v2`).
   - `ssh`: Ed25519 keypair generator and `~/.ssh/allowed_signers` manager.
   - `wsl`: `wsl.exe` process adapter, UTF-16LE output cleaner, `DistributionInfo.json` parser, and `0x<SHA256>` verifier.
   - `ui`: Standardized terminal output formatters (strictly zero emojis).

## Architectural Guardrails

- **Strict Import Direction**:
  - Packages in `cli/internal/*` MUST NEVER import `cli/domains/*` or `cli/cmd/*`.
  - Feature slices in `cli/domains/*` MUST NEVER import sibling feature slices directly; shared abstractions belong in `cli/internal/*`.
- **3-Layer Ceiling**: Do NOT create `AGENTS.md` or `README.md` inside `cli/cmd/`, `cli/domains/` (the intermediate folder), or `cli/internal/*`. Only Layer-3 domain folders (`cli/domains/<domain>/`) declare their own `AGENTS.md` and `README.md`.
- **Testability (LSP / DIP)**: Domain commands must accept interfaces from `cli/internal/contracts/` so unit tests (`*_test.go`) can execute deterministically without mutating the developer's host machine.
