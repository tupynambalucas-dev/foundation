<context-hierarchy>
  <parent-context path="../../AGENTS.md" description="Layer 1: Workstation Monorepo Root Agent Context Router" />
  <parent-context path="../AGENTS.md" description="Layer 2: WSL2 Distribution-as-Code Subsystem Agent Context" />
</context-hierarchy>

# Base Developer Workstation Distribution Agent Context (`distributions/base/`)

This document serves as the Layer-3 bounded context router for `workstation/distributions/base/`, governing the `tupynambalucas-dev` Ubuntu 26.04 LTS daily developer workstation distribution.

## Package Assets

- [`Dockerfile`](./Dockerfile): Multi-stage Ubuntu 26.04 LTS rootfs builder (`FROM scratch AS rootfs`).
- [`etc/wsl.conf`](./etc/wsl.conf): Enables `systemd=true`, `hostname=tupynambalucas-dev`, and Windows interop.
- [`etc/wsl-distribution.conf`](./etc/wsl-distribution.conf): Configures OOBE (`/etc/oobe.sh`, `defaultUid = 1000`, `defaultName = tupynambalucas-dev`), Start Menu icon (`/usr/lib/wsl/tupynambalucas-dev.ico`), and Windows Terminal fragment (`/usr/lib/wsl/terminal-profile.json`).
- [`etc/oobe.sh`](./etc/oobe.sh): Invokes `provision_developer_account "tupy" "1000" "1000"` from `/usr/lib/wsl/oobe-common.sh`.
- [`assets/tupynambalucas-dev.ico`](./assets/tupynambalucas-dev.ico): Distribution icon sourced from the developer's `Dev` profile (`g_tupydev.ico`).
- [`assets/terminal-profile.json`](./assets/terminal-profile.json): Strict RFC 8259 JSON Windows Terminal fragment combining `Vintage` scheme, `Ubuntu Mono` (`size: 12`, `weight: "medium"`), `"backgroundImage": "monygang.png"` (`opacity: 0.35`), cyan vintage cursor (`#00E5FF`), and `elevate: false`.

## Package Guardrails

1. **Socket-Activated Docker (`docker.socket`)**: In `distributions/base/Dockerfile`, `docker.service` MUST remain disabled at boot (`systemctl disable docker.service && systemctl enable docker.socket`) so daily coding sessions consume zero idle container daemon memory until a `docker` CLI command is invoked.
2. **Base Image Inheritance Contract**: `distributions/cluster/Dockerfile` extends `tupynambalucas-dev-base:latest`. Any core OS package or shared asset removed from `distributions/base/Dockerfile` impacts `distributions/cluster` downstream.
