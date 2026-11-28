# WSL2 Distribution-as-Code Subsystem (`distributions/`)

Layer-2 Bounded Context defining declarative, reproducible WSL2 Linux distributions (`.wsl` Modern Distributions on Ubuntu 26.04 LTS) built with Docker Buildx (`FROM scratch AS rootfs`) and distributed via GitHub Releases and the native Windows `ModernDistributions` catalog.

---

## Distribution Matrix

| Distribution Name | Layer-3 Package | Base OS | Docker Engine Mode | Primary Workload | Windows Terminal Visual Profile |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`tupynambalucas-dev`** | [`distributions/base/`](./base/README.md) | Ubuntu 26.04 LTS | `docker.socket` (On-demand, 0 MB idle RAM) | Polyglot software engineering (`node` 22, `pnpm` 12, `go` 1.27, `gh`, `mani`, `infisical`) | `Vintage` + `monygang.png` (`0.35` opacity), `g_tupydev.ico`, cyan vintage cursor (`#00E5FF`), `elevate: false` |
| **`tupynambalucas-dev-cluster`** | [`distributions/cluster/`](./cluster/README.md) | Extends `tupynambalucas-dev` | `docker.service` + `containerd.service` (Always active) | Dual `k3d` Kubernetes clusters (`k3d-hub` & `k3d-corporate`), `kubectl`, `helm`, `skaffold`, `kubeseal` | Exact `Admin` profile: `Vintage` + `monygang.png` (`0.45` opacity), `g_brxplayer.ico`, magenta vintage cursor (`#FE00FF`), `elevate: true` |

---

## Subsystem Directory Layout

```text
distributions/
├── package.json                        # Workspace package manifest
├── tsconfig.json                       # TypeScript project reference
├── src/
│   └── index.ts                        # Distribution exports & typing
├── catalog/
│   └── DistributionInfo.json           # Authoritative Microsoft WSL ModernDistributions manifest
├── shared/
│   ├── assets/
│   │   └── monygang.png                # Shared Windows Terminal background wallpaper
│   ├── oobe-common.sh                  # Shared OOBE user/SSH/Git & Terminal media provisioning
│   └── systemd-mask.sh                 # Mandatory WSL systemd unit masking script
├── base/                               # Layer 3: tupynambalucas-dev
│   ├── README.md
│   └── AGENTS.md
└── cluster/                            # Layer 3: tupynambalucas-dev-cluster
    ├── README.md
    └── AGENTS.md
```

---

## Building `.wsl` Archives in CI / Cloud

```bash
mkdir -p output

# 1. Build and export the base developer workstation (.wsl)
docker buildx build -f distributions/base/Dockerfile -t tupynambalucas-dev-base:latest --load .
docker buildx build -f distributions/base/Dockerfile --target rootfs --output type=tar,dest=output/tupynambalucas-dev.tar .
gzip -9 -f output/tupynambalucas-dev.tar
mv output/tupynambalucas-dev.tar.gz output/tupynambalucas-dev.wsl

# 2. Build and export the Kubernetes cluster engine (.wsl) extending the base image
docker buildx build -f distributions/cluster/Dockerfile \
  --build-arg BASE_IMAGE=tupynambalucas-dev-base:latest \
  --target rootfs \
  --output type=tar,dest=output/tupynambalucas-dev-cluster.tar .
gzip -9 -f output/tupynambalucas-dev-cluster.tar
mv output/tupynambalucas-dev-cluster.tar.gz output/tupynambalucas-dev-cluster.wsl
```

---

## Navigation

- [Workstation Monorepo Root (`../README.md`)](../README.md)
- [Base Developer Distribution (`./base/README.md`)](./base/README.md)
- [Cluster Kubernetes Distribution (`./cluster/README.md`)](./cluster/README.md)
- [Developer Toolchain & CLI (`../extensions/README.md`)](../extensions/README.md)
- [Host Virtualization Governance (`../virtualization/README.md`)](../virtualization/README.md)
- [Documentation Hub (`../references/README.md`)](../references/README.md)
