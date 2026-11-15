<context-hierarchy>
  <parent-context path="../../AGENTS.md" description="Layer 1: Workstation Monorepo Root Agent Context Router" />
  <parent-context path="../AGENTS.md" description="Layer 2: WSL2 Distribution-as-Code Subsystem Agent Context" />
</context-hierarchy>

# Cluster Kubernetes Engine Distribution Agent Context (`distros/cluster/`)

This document serves as the Layer-3 bounded context router for `workstation/distros/cluster/`, governing the `tupynambalucas-dev-cluster` Ubuntu 26.04 LTS distribution dedicated to running local `k3d` Kubernetes topologies (`k3d-hub` and `k3d-corporate`).

## Package Assets

- [`Dockerfile`](./Dockerfile): Extends `tupynambalucas-dev-base:latest` (`Inherited Configuration`) with `kubectl`, `k3d`, `helm`, `skaffold`, `kubeseal`, and active `docker.service` + `containerd.service`.
- [`etc/sysctl.d/99-kubernetes.conf`](./etc/sysctl.d/99-kubernetes.conf): Kernel limits required for multi-node `k3d` clusters (`fs.inotify.max_user_watches=1048576`, `vm.max_map_count=262144`, `net.ipv4.ip_forward=1`).
- [`etc/wsl.conf`](./etc/wsl.conf): Configures `systemd=true` and `hostname=tupynambalucas-cluster`.
- [`etc/wsl-distribution.conf`](./etc/wsl-distribution.conf): Configures `defaultName = tupynambalucas-dev-cluster`, `/usr/lib/wsl/tupynambalucas-dev-cluster.ico`, and `/usr/lib/wsl/terminal-profile.json`.
- [`assets/tupynambalucas-dev-cluster.ico`](./assets/tupynambalucas-dev-cluster.ico): Distribution icon sourced from the developer's `Admin` profile (`g_brxplayer.ico`).
- [`assets/terminal-profile.json`](./assets/terminal-profile.json): Reuses the exact `Admin` Windows Terminal profile (`Vintage` scheme, `monygang.png` at `0.45` opacity, `Ubuntu Mono` `12pt medium`, neon magenta cursor `#FE00FF`, selection `#80555D`, `elevate: true`).

## Package Guardrails

1. **Always-On Container Daemons**: Unlike `distros/base`, `distros/cluster/Dockerfile` explicitly enables `docker.service` and `containerd.service` so `k3d` nodes and local registries recover automatically on distribution boot.
2. **Kernel Tuning Preservation**: Never lower the `inotify` or `vm.max_map_count` values in `etc/sysctl.d/99-kubernetes.conf`; they are required for `k3d-hub` (ArgoCD, Infisical, Harbor) and `k3d-corporate` pods to run simultaneously without `Too many open files` errors.
