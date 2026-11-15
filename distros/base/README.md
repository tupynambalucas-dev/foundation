# Base Developer Workstation Distribution (`tupynambalucas-dev`)

Layer-3 WSL2 Distribution-as-Code package producing `tupynambalucas-dev.wsl` on **Ubuntu 26.04 LTS**, engineered for daily polyglot development across `org-core`, `agent-mesh`, `docs`, `workstation`, and `platform`.

---

## Pre-Installed Toolchain Matrix

| Component | Version / Configuration | Purpose |
| :--- | :--- | :--- |
| **Base OS** | Ubuntu 26.04 LTS (`en_US.UTF-8`) | Long-Term Support Linux userland with `systemd=true` |
| **Node.js & pnpm** | Node.js `v22.x` LTS + `pnpm` `12.6.0` (Corepack) | TypeScript monorepos, Docusaurus v3, and MCP plugins |
| **Go Runtime** | Go `1.27.3` | `workstation` CLI development and Go microservices |
| **Mani CLI** | `v0.30.0` | Multi-repository orchestration across `org-core` |
| **GitHub CLI (`gh`)** | Latest official apt release | PR workflows, Actions inspection, and `gh tl` extensions |
| **Infisical CLI** | Latest official apt release | Zero-plaintext secret injection (`infisical run -- ...`) |
| **Docker Engine** | `docker-ce` + `buildx` + `compose` (`docker.socket`) | Socket-activated on-demand container builds (0 MB idle RAM) |

---

## First-Boot OOBE & Windows Terminal Profile

On first launch (`wsl --install tupynambalucas-dev`), `/etc/wsl-distribution.conf` executes `/etc/oobe.sh` and registers `/usr/lib/wsl/terminal-profile.json`:
- **Default User**: `tupy` (`uid=1000`, `gid=1000`, passwordless `sudo`, default shell `/bin/zsh`).
- **Host Credential Bridge**: Automatically imports `*ed25519*`, `config`, `known_hosts`, and `allowed_signers` from `%USERPROFILE%\.ssh` with strict `0700`/`0600` permissions, and rewrites path references inside `~/.gitconfig` and `~/.gitconfig-tupynambalucas-dev`.
- **Windows Terminal Profile**: Pairs the `Dev` icon (`tupynambalucas-dev.ico`) and `tabTitle: "tupynambalucas.dev"` with the shared `monygang.png` wallpaper (`backgroundImageOpacity: 0.35`), `Vintage` color scheme, `Ubuntu Mono` (`12pt medium`), and a cyan vintage cursor (`#00E5FF`).

---

## Local Build & Verification

```bash
mkdir -p output
docker buildx build -f distros/base/Dockerfile -t tupynambalucas-dev-base:latest --load .
docker buildx build -f distros/base/Dockerfile --target rootfs --output type=tar,dest=output/tupynambalucas-dev.tar .
gzip -9 -f output/tupynambalucas-dev.tar
mv output/tupynambalucas-dev.tar.gz output/tupynambalucas-dev.wsl
```

---

## Navigation

- [WSL2 Distributions Subsystem (`../README.md`)](../README.md)
- [Cluster Kubernetes Distribution (`../cluster/README.md`)](../cluster/README.md)
- [Workstation Monorepo Root (`../../README.md`)](../../README.md)
