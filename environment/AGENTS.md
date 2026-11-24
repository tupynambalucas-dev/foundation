<context-hierarchy>
  <parent src="../AGENTS.md" type="monorepo-root-rules" />
  <system-instruction>
    AGENT: You are operating within the Developer Environment Bounded Context (foundation/environment). This subsystem governs universal editor standards, formatting specifications, and IDE workspace profile declarations.
  </system-instruction>
</context-hierarchy>

# Developer Environment Bounded Context Agent Context Router

This document serves as the Layer-2 Bounded Context context router for `foundation/environment/`.

## Architectural Boundaries & Ubiquitous Language

- **Domain Scope**: Developer workspace configuration, formatting standards, and IDE profiling.
- **Universal Standards (`standards/`)**: Agnóstic standards including `.editorconfig` and markdown styling.
- **IDE Subdomain (`ide/`)**: Platform-specific implementations (`vscode/`, `jetbrains/`, `neovim/`).

## Subsystem Navigation

| Structural Unit | Context Router | Documentation | Responsibility |
| :--- | :--- | :--- | :--- |
| **Standards (`standards/`)** | - | [`standards/formatting-rules.md`](./standards/formatting-rules.md) | Universal whitespace and encoding rules. |
| **IDE Governance (`ide/`)** | [`ide/AGENTS.md`](./ide/AGENTS.md) | [`ide/README.md`](./ide/README.md) | Subdomain managing editor configurations. |
| **VS Code (`ide/vscode/`)** | [`ide/vscode/AGENTS.md`](./ide/vscode/AGENTS.md) | [`ide/vscode/README.md`](./ide/vscode/README.md) | Official enterprise VS Code profiles and matrices. |

## Governance Invariants

- **Zero-Emoji Policy**: Emojis are strictly forbidden across all settings and documentation.
- **No Layer 4+ Routers**: Child folders under `vscode/` (`shared/`, `profiles/`, `matrix/`, `keybindings/`) must not contain `AGENTS.md` files.
