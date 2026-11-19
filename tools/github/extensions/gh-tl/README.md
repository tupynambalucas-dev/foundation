# Developer CLI & GitHub Extension Module (`gh-tl`)

Layer-3 Bounded Context housing the multi-platform Go CLI suite (`tl` / `gh tl`) for developer onboarding, cryptographic readiness verification, and WSL2 distribution lifecycle management.

---

## Architecture & Dependency Flow

`gh-tl` implements **Feature-Sliced Design (FSD)** and **SOLID** interface segregation:

```text
tools/github/extensions/gh-tl/
├── go.mod & go.sum
├── package.json
├── tsconfig.json
├── cmd/
│   ├── tl/main.go              # Binary entrypoint (go build ./cmd/tl)
│   └── root.go                 # Root Cobra command registrar
├── domains/
│   ├── onboard/                # Domain: 'tl onboard' & 'tl verify'
│   ├── distro/                 # Domain: 'tl distro list|status|install'
│   └── host/                   # Domain: 'tl host prepare|verify'
└── internal/
    ├── contracts/              # Segregated SOLID interfaces (ISP/LSP/DIP)
    ├── config/                 # SSOT constants & conditional Git config templates
    ├── git/                    # Git CLI execution & semver parsing
    ├── github/                 # GitHub REST client via go-gh/v2
    ├── ssh/                    # Ed25519 key generation & allowed_signers
    ├── ui/                     # ANSI terminal formatting (Zero-Emoji compliant)
    └── wsl/                    # wsl.exe wrapper, manifest parser, Win32 registry & SHA-256 verifier
```

---

## Domain Navigation

| Domain Package | Documentation | Agent Router | Commands Provided |
| :--- | :--- | :--- | :--- |
| [`domains/onboard/`](./domains/onboard/README.md) | [`README.md`](./domains/onboard/README.md) | [`AGENTS.md`](./domains/onboard/AGENTS.md) | `tl onboard`, `tl verify` |
| [`domains/distro/`](./domains/distro/README.md) | [`README.md`](./domains/distro/README.md) | [`AGENTS.md`](./domains/distro/AGENTS.md) | `tl distro list`, `tl distro status`, `tl distro install` |
| [`domains/host/`](./domains/host/README.md) | [`README.md`](./domains/host/README.md) | [`AGENTS.md`](./domains/host/AGENTS.md) | `tl host prepare`, `tl host verify` |

---

## Internal Infrastructure Packages (`internal/`)

| Package | Import Path | Responsibility |
| :--- | :--- | :--- |
| `contracts` | `github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/contracts` | Role-segregated interfaces (`GitConfigReader`, `GitConfigMutator`, `WSLDistroInspector`, `WSLDistroOperator`). |
| `config` | `github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/config` | SSOT constants (`DefaultOrg`, `DefaultEmail`, `DefaultCatalogURL`) and `~/.gitconfig-tupynambalucas-dev` writer. |
| `git` | `github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/git` | `git` version parsing (`>= 2.36.0`) and global configuration inspection/mutation. |
| `github` | `github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/github` | Idempotent SSH authentication (`user/keys`) and signing key (`user/ssh_signing_keys`) registration. |
| `ssh` | `github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/ssh` | Ed25519 keypair provisioning (`0700`/`0600`) and `~/.ssh/allowed_signers` synchronization. |
| `wsl` | `github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/wsl` | `DistributionInfo.json` parsing, Win32 registry manipulation, `0x<SHA256>` verification, and `wsl.exe` invocation. |
| `ui` | `github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/ui` | Terminal headers and `PASS` / `FAIL` / `WARN` / `INFO` gate output helpers. |

---

## Navigation

- [GitHub CLI Workspace Root (`../../README.md`)](../../README.md)
- [Tools Subsystem Root (`../../../README.md`)](../../../README.md)
- [Workstation Monorepo Root (`../../../../README.md`)](../../../../README.md)
