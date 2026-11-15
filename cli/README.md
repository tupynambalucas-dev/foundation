# Developer CLI & GitHub Extension Subsystem (`cli/`)

Layer-2 Bounded Context housing the multi-platform Go CLI suite (`tl` / `gh tl` / `gh workstation`) for developer onboarding, cryptographic readiness verification, and WSL2 distribution lifecycle management.

---

## Architecture & Dependency Flow

`cli/` implements **Feature-Sliced Design (FSD)** and **SOLID** interface segregation:

```text
cli/
├── cmd/
│   ├── tl/main.go              # Binary entrypoint (go build ./cli/cmd/tl)
│   └── root.go                 # Root Cobra command registrar
├── domains/
│   ├── onboard/                # Layer 3 Domain: 'tl onboard' & 'tl verify'
│   └── distro/                 # Layer 3 Domain: 'tl distro list|status|install'
└── internal/
    ├── contracts/              # Segregated SOLID interfaces (ISP/LSP/DIP)
    ├── config/                 # SSOT constants & conditional Git config templates
    ├── git/                    # Git CLI execution & semver parsing
    ├── github/                 # GitHub REST client via go-gh/v2
    ├── ssh/                    # Ed25519 key generation & allowed_signers
    ├── ui/                     # ANSI terminal formatting (Zero-Emoji compliant)
    └── wsl/                    # wsl.exe wrapper, manifest parser & SHA-256 verifier
```

---

## Domain Navigation

| Layer | Domain Package | Documentation | Agent Router | Commands Provided |
| :-: | :--- | :--- | :--- | :--- |
| **3** | [`cli/domains/onboard/`](./domains/onboard/README.md) | [`README.md`](./domains/onboard/README.md) | [`AGENTS.md`](./domains/onboard/AGENTS.md) | `tl onboard`, `tl verify` |
| **3** | [`cli/domains/distro/`](./domains/distro/README.md) | [`README.md`](./domains/distro/README.md) | [`AGENTS.md`](./domains/distro/AGENTS.md) | `tl distro list`, `tl distro status`, `tl distro install` |

---

## Internal Infrastructure Packages (`cli/internal/`)

| Package | Import Path | Responsibility |
| :--- | :--- | :--- |
| `contracts` | `github.com/tupynambalucas-dev/workstation/cli/internal/contracts` | Role-segregated interfaces (`GitConfigReader`, `GitConfigMutator`, `WSLDistroInspector`, `WSLDistroOperator`). |
| `config` | `github.com/tupynambalucas-dev/workstation/cli/internal/config` | SSOT constants (`DefaultOrg`, `DefaultEmail`, `DefaultCatalogURL`) and `~/.gitconfig-tupynambalucas-dev` writer. |
| `git` | `github.com/tupynambalucas-dev/workstation/cli/internal/git` | `git` version parsing (`>= 2.36.0`) and global configuration inspection/mutation. |
| `github` | `github.com/tupynambalucas-dev/workstation/cli/internal/github` | Idempotent SSH authentication (`user/keys`) and signing key (`user/ssh_signing_keys`) registration. |
| `ssh` | `github.com/tupynambalucas-dev/workstation/cli/internal/ssh` | Ed25519 keypair provisioning (`0700`/`0600`) and `~/.ssh/allowed_signers` synchronization. |
| `wsl` | `github.com/tupynambalucas-dev/workstation/cli/internal/wsl` | `DistributionInfo.json` parsing, `0x<SHA256>` verification, and `wsl.exe` invocation. |
| `ui` | `github.com/tupynambalucas-dev/workstation/cli/internal/ui` | Terminal headers and `PASS` / `FAIL` / `WARN` / `INFO` gate output helpers. |

---

## Navigation

- [Workstation Monorepo Root (`../README.md`)](../README.md)
- [Onboarding Domain (`./domains/onboard/README.md`)](./domains/onboard/README.md)
- [Distro Domain (`./domains/distro/README.md`)](./domains/distro/README.md)
