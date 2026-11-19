# GitHub CLI Ecosystem & Extensions (`tools/github/`)

Layer-3 Bounded Context providing GitHub CLI extensions and developer automation for the `workstation` monorepo.

---

## 1. Overview

This workspace groups official and sovereign GitHub CLI extensions published by `tupynambalucas-dev`:

- **`extensions/gh-tl/`**: The primary developer onboarding and WSL distribution orchestrator.

---

## 2. Directory Structure

```text
tools/github/
├── README.md
├── AGENTS.md
└── extensions/
    └── gh-tl/                          # Standalone Go module & pnpm workspace package
        ├── go.mod & go.sum
        ├── package.json
        ├── tsconfig.json
        ├── cmd/
        ├── domains/
        └── internal/
```

---

## 3. Navigation

- [Tools Subsystem Root (`../README.md`)](../README.md)
- [gh-tl Extension Documentation (`./extensions/gh-tl/README.md`)](./extensions/gh-tl/README.md)
- [Workstation Monorepo Root (`../../README.md`)](../../README.md)
