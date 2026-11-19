# Developer Toolchain & CLI Subsystem (`tools/`)

Layer-2 Bounded Context organizing developer automation tools, CLI extensions, and GitHub CLI integrations for the `workstation` monorepo, following the architectural pattern of `platform/tools`.

---

## 1. Architecture Overview

The `tools/` workspace segregates developer CLI automation from core Linux distributions and host hypervisor governance. It provides a modular host for command-line extensions:

- **`tools/github/`**: Houses GitHub CLI extensions and automation toolchains.
- **`tools/tsconfig.json`**: Solution-style TypeScript project reference linking child toolchain projects.

---

## 2. Managed Packages & Extensions

| Package Path | Package Identity | Purpose |
| :--- | :--- | :--- |
| [`github/extensions/gh-tl/`](./github/extensions/gh-tl/README.md) | `@tupynambalucas-dev/workstation-gh-tl` | Self-contained Go extension (`gh tl` / `tl`) providing Day-0 onboarding, host readiness, and native WSL distribution lifecycle management. |

---

## 3. Development Commands

```bash
# Execute unit tests across all tools packages
pnpm --filter @tupynambalucas-dev/workstation-gh-tl test

# Compile CLI binaries
pnpm --filter @tupynambalucas-dev/workstation-gh-tl build
```

---

## 4. Navigation

- [Workstation Monorepo Root (`../README.md`)](../README.md)
- [GitHub Extensions Workspace (`./github/README.md`)](./github/README.md)
- [WSL2 Distributions Subsystem (`../distributions/README.md`)](../distributions/README.md)
- [Host Virtualization Governance (`../virtualization/README.md`)](../virtualization/README.md)
- [Documentation Hub (`../references/README.md`)](../references/README.md)
