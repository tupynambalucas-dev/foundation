<context-hierarchy>
  <parent-context path="../../../AGENTS.md" description="Layer 1: Workstation Monorepo Root Agent Context Router" />
  <parent-context path="../../AGENTS.md" description="Layer 2: Developer CLI & GitHub Extension Subsystem Agent Context" />
</context-hierarchy>

# Onboarding & Readiness Verification Domain Agent Context (`cli/domains/onboard/`)

This document serves as the Layer-3 bounded context router for `workstation/cli/domains/onboard/`, governing developer identity provisioning (`tl onboard`) and non-destructive readiness gate verification (`tl verify`).

## Package Scope

- **Go Package**: `github.com/tupynambalucas-dev/workstation/cli/domains/onboard`
- **Primary Files**:
  - [`onboard.go`](./onboard.go): Implements `NewOnboardCmd()` and `RunSetup()`.
  - [`verify.go`](./verify.go): Implements `NewVerifyCmd()` and `RunVerify()`.
  - [`onboard_test.go`](./onboard_test.go): Unit tests for command flags and SSOT defaults.
  - [`README.md`](./README.md): Complete specification of flags, conditional Git `includeIf` templates, and the 7 pre-flight readiness gates.

## Domain Guardrails

1. **Read-Only `verify` Invariant**: `RunVerify()` (`tl verify` / `tl onboard --verify`) MUST remain strictly non-destructive. It must never write files, generate SSH keys, or mutate Git configuration.
2. **Idempotent Key Registration**: `RunSetup()` must gracefully handle HTTP `422 Unprocessable Entity` when the developer's Ed25519 key is already registered on GitHub (`user/keys` and `user/ssh_signing_keys`).
3. **Conditional Identity Isolation**: Never overwrite the developer's global `user.email` in `~/.gitconfig`; always bind corporate identity (`contato@tupynambalucas.dev`) inside `~/.gitconfig-tupynambalucas-dev` via `includeIf.hasconfig:remote.*.url`.
