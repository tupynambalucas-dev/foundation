<context-hierarchy>
  <parent-context path="../../../AGENTS.md" description="Layer 1: Workstation Monorepo Root Agent Context Router" />
  <parent-context path="../../AGENTS.md" description="Layer 2: Developer CLI & GitHub Extension Subsystem Agent Context" />
</context-hierarchy>

# WSL2 Distribution Lifecycle Domain Agent Context (`cli/domains/distro/`)

This document serves as the Layer-3 bounded context router for `workstation/cli/domains/distro/`, governing CLI commands that inspect, verify, and install corporate WSL2 custom distributions (`tl distro list|status|install`).

## Package Scope

- **Go Package**: `github.com/tupynambalucas-dev/workstation/cli/domains/distro`
- **Primary Files**:
  - [`distro.go`](./distro.go): Implements `NewDistroCmd` (`list`, `status`, and `install` subcommands) accepting `contracts.WSLDistroOperator`.
  - [`distro_test.go`](./distro_test.go): Unit tests using in-memory `mockWSLOperator`.
  - [`README.md`](./README.md): Command reference and usage examples.

## Domain Guardrails

1. **Interface Segregation & Dependency Injection**: `newListCmd` and `newStatusCmd` depend exclusively on the read-only `contracts.WSLDistroInspector` interface, while `newInstallCmd` consumes `contracts.WSLDistroOperator`.
2. **Cryptographic Verification**: When `--from-file` is combined with `--sha256`, `tl distro install` MUST verify the file's SHA-256 digest before invoking `wsl.exe --install --from-file`.
