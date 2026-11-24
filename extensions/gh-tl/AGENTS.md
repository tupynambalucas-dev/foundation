<context-hierarchy>
  <parent src="../AGENTS.md" type="bounded-context-rules" />
  <parent src="../../AGENTS.md" type="monorepo-root-rules" />
</context-hierarchy>

# Developer CLI & GitHub Extension Module Agent Context (`gh-tl`)

This document serves as the bounded context router for `foundation/extensions/gh-tl/`, governing the Go CLI application (`tl` standalone and `gh tl` GitHub CLI extension), its domain-agnostic internal adapters, and its pnpm workspace manifest (`@tupynambalucas-dev/workstation-gh-tl`).

## Unidirectional Feature-Sliced Architecture (DDD / FSD)

Dependencies inside `gh-tl/` flow strictly downward across three internal tiers:

1. **Entrypoint & Root Wiring (`cmd/`)**:
   - [`cmd/tl/main.go`](./cmd/tl/main.go): Binary entrypoint compiled by `go build ./cmd/tl` and `cli/gh-extension-precompile@v2`.
   - [`cmd/root.go`](./cmd/root.go): Root `cobra.Command` registrar combining all domain slices.
2. **Feature Domains (`domains/*`)**:
   - [`domains/onboard/`](./domains/onboard/): Identity onboarding (`tl onboard`) and 7 pre-flight readiness gates (`tl verify`).
   - [`domains/distro/`](./domains/distro/): WSL2 custom distribution catalog inspection and installation (`tl distro list|status|install`).
   - [`domains/host/`](./domains/host/): Windows host readiness governance (`tl host prepare|verify`).
3. **Shared Internal Infrastructure (`internal/*`)**:
   - `contracts`: Segregated SOLID interfaces (`GitConfigReader`, `GitConfigMutator`, `WSLDistroInspector`, `WSLDistroOperator`).
   - `config`: SSOT organizational constants (`DefaultOrg`, `DefaultEmail`, `DefaultCatalogURL`) and Git config generators.
   - `git`: Git CLI wrapper and semantic version parser.
   - `github`: Authenticated GitHub REST API v3 client (`go-gh/v2`).
   - `ssh`: Ed25519 keypair generator and `~/.ssh/allowed_signers` manager.
   - `wsl`: `wsl.exe` process adapter, UTF-16LE output cleaner, `DistributionInfo.json` parser, native Win32 Registry API, and `0x<SHA256>` verifier.
   - `ui`: Standardized terminal output formatters (strictly zero emojis).

## Architectural Guardrails

- **Strict Import Direction**:
  - Packages in `internal/*` MUST NEVER import `domains/*` or `cmd/*`.
  - Feature slices in `domains/*` MUST NEVER import sibling feature slices directly; shared abstractions belong in `internal/*`.
- **Testability (LSP / DIP)**: Domain commands must accept interfaces from `internal/contracts/` so unit tests (`*_test.go`) can execute deterministically without mutating the developer's host machine.
- **Turborepo Integration**: All tests and builds are orchestrated via package scripts (`pnpm test`, `pnpm build`).
