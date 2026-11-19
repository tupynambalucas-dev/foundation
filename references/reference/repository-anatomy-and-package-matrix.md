# Repository Anatomy and Package Matrix

Technical breakdown of workspace configurations, TypeScript project references, pnpm catalogs, and Turborepo task pipelines across `tupynambalucas-dev/workstation`.

---

## 1. Monorepo Directory Anatomy

```text
workstation/
├── .github/                      # CI/CD workflows, CODEOWNERS, issue templates
│   └── workflows/
│       ├── ci.yml                # Turborepo lint/typecheck, Go tests, ShellCheck
│       └── release.yml           # Precompile Go extension, Docker Buildx rootfs
├── .vscode/                      # Multi-root IDE settings
├── distributions/                # Bounded Context: WSL2 Distributions
│   ├── base/                     # Ubuntu 26.04 LTS Developer Workstation
│   ├── cluster/                  # Ubuntu 26.04 LTS Kubernetes Node
│   ├── catalog/                  # DistributionInfo.json SSOT manifest
│   ├── shared/                   # Systemd unit masks and shared OOBE scripts
│   ├── package.json              # @tupynambalucas-dev/workstation-distributions
│   └── tsconfig.json             # Package-level TypeScript config
├── tools/                        # Bounded Context: Developer Toolchain & CLIs
│   ├── github/
│   │   └── extensions/
│   │       └── gh-tl/            # Sovereign Package: Go CLI & GitHub Extension
│   │           ├── cmd/          # Cobra command wiring & binary entrypoint
│   │           ├── domains/      # distro, host, onboard feature slices
│   │           ├── internal/     # contracts, config, git, github, ssh, wsl
│   │           ├── go.mod        # Go 1.22+ module declaration
│   │           ├── package.json  # @tupynambalucas-dev/workstation-gh-tl
│   │           └── tsconfig.json # Package-level TypeScript config
│   ├── package.json              # Solution reference
│   └── tsconfig.json
├── virtualization/               # Bounded Context: Host Governance & Hypervisor
│   ├── config/                   # .wslconfig.example baseline template
│   ├── registry/                 # .reg files and local manifest overrides
│   ├── scripts/                  # Legacy install.ps1 (deprecated) and psm1 helpers
│   ├── package.json              # @tupynambalucas-dev/workstation-virtualization
│   └── tsconfig.json             # Package-level TypeScript config
├── references/                   # Bounded Context: Diátaxis Documentation Hub
│   ├── tutorials/                # Learning-oriented guides
│   ├── how-to-guides/            # Problem-oriented runbooks
│   ├── reference/                # Information-oriented technical specs
│   └── explanation/              # Understanding-oriented architecture rationale
├── package.json                  # Root monorepo manifest (pnpm@12.6.0)
├── pnpm-workspace.yaml           # Catalog definitions and workspace members
├── turbo.json                    # Turborepo task pipelines
├── tsconfig.base.json            # Strict TypeScript compiler baseline
├── tsconfig.json                 # Solution-style root project reference
├── eslint.config.js              # Flat ESLint configuration
└── AGENTS.md                     # Layer-1 Root Agent Context Router
```

---

## 2. Workspace Package Matrix

| Workspace Directory | Package Name | Version | Role | Key Technologies |
| :--- | :--- | :---: | :--- | :--- |
| `/` (Root) | `@tupynambalucas-dev/workstation` | `1.0.0` | Monorepo orchestrator | pnpm, Turborepo, TypeScript, ESLint |
| `distributions/` | `@tupynambalucas-dev/workstation-distributions` | `1.0.0` | WSL2 distro packaging | Dockerfile, Bash, systemd, OOBE |
| `tools/github/extensions/gh-tl/` | `@tupynambalucas-dev/workstation-gh-tl` | `1.0.0` | Developer CLI suite | Go 1.22+, Cobra, Win32 API, go-gh |
| `virtualization/` | `@tupynambalucas-dev/workstation-virtualization` | `1.0.0` | Hypervisor governance | PowerShell, Win32 Registry, .wslconfig |

---

## 3. Strict pnpm Dependency Catalogs

Dependencies are centrally governed in `pnpm-workspace.yaml` using pnpm catalogs, preventing version drift:

### Catalog: `tooling-stack`
- `@eslint/js`: `10.0.1`
- `@typescript-eslint/eslint-plugin`: `8.70.1`
- `eslint`: `10.11.0`
- `eslint-config-prettier`: `10.1.8`
- `eslint-plugin-prettier`: `5.5.7`
- `prettier`: `3.9.9`
- `typescript-eslint`: `8.70.1`

### Default Catalog (`catalog:`)
- `@types/node`: `26.6.6`
- `rimraf`: `6.1.4`
- `tsx`: `4.23.15`
- `turbo`: `2.11.5`
- `typescript`: `6.0.3`

---

## 4. Turborepo Task Pipelines (`turbo.json`)

| Task | Dependencies | Outputs | Cache Behavior | Description |
| :--- | :--- | :--- | :---: | :--- |
| `build` | `^build` | `dist/**` | Cached | Compiles packages and Go CLI binaries. |
| `lint` | - | None | Cached | Runs flat ESLint across all TypeScript packages. |
| `typecheck` | `^build` | None | Cached | Executes `tsc --noEmit` via TypeScript Project References. |
| `test` | `build` | None | Cached | Executes unit test suites. |
| `clean` | - | `dist/**` | Not Cached | Deletes build artifacts and temporary files. |

---

## Related References

- [CLI Command Specification](./cli-command-specification.md)
- [Workstation Architecture and DDD Topology](../explanation/workstation-architecture-and-ddd-topology.md)
