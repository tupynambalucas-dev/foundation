# Developer Environment Governance (\`@tupynambalucas-dev/foundation-environment\`)

Governs universal developer workspace standards, formatting specifications, and multi-IDE configuration profiles across the organization.

---

## 1. Architecture Overview

The `environment` bounded context standardizes developer workspaces across machines and editors:
- **`standards/`**: Agnóstic editor rules (`.editorconfig`, character encodings, newline rules).
- **`ide/`**: Specialized tooling partitioned by editor (`vscode/`, `jetbrains/`, `neovim/`).

---

## 2. Subsystems & Navigation

Subsystems are organized into autonomous enterprise Bounded Contexts conforming to the Domain-Driven Monorepo standard:

| Subsystem / Workspace | Scope / Path | Documentation | Purpose |
| :--- | :--- | :--- | :--- |
| **Standards** | [`./standards/`](./standards/) | [`formatting-rules.md`](./standards/formatting-rules.md) | Universal whitespace, indentation, and newline standards. |
| **IDE Governance** | [`./ide/`](./ide/) | [`README.md`](./ide/README.md) | Centralized editor configurations and tooling. |
| **VS Code** | [`./ide/vscode/`](./ide/vscode/) | [`README.md`](./ide/vscode/README.md) | Enterprise profiles, extension compatibility matrices, and keybindings. |

---

## 3. Environment & Secret Governance

All workspace definitions strictly commit zero secrets or sensitive access tokens. Profile configurations consume public extension IDs and open specifications.

---

## 4. Getting Started

```bash
# Validate workspace configurations
pnpm lint
pnpm typecheck
```

---

## 5. Development & Pipeline Scripts

| Command | Purpose |
| :--- | :--- |
| `pnpm lint` | Execute ESLint across environment configuration assets. |
| `pnpm typecheck` | Assert TypeScript Project References and JSON schema compliance. |

---

## 6. Governance & Contributing Standards

- Commits must strictly follow Conventional Commits (`feat(environment): ...`).
- All Git commits and annotated tags must be cryptographically signed with SSH.
- Zero-Emoji Invariant strictly enforced.

---

## 7. License

Licensed under the Apache License, Version 2.0. See [LICENSE](../../LICENSE) for full details.
