<context-hierarchy>
  <parent-context path="../AGENTS.md" description="Layer 1: Workstation Monorepo Root Agent Context Router" />
</context-hierarchy>

# WSL2 Distribution-as-Code Subsystem Agent Context (`distributions/`)

This document serves as the Layer-2 bounded context router for `workstation/distributions/`, governing declarative Docker Buildx rootfs images, the authoritative Microsoft WSL `ModernDistributions` catalog (`DistributionInfo.json`), OOBE provisioning scripts, Windows Terminal JSON fragment templates, and workspace package orchestration.

## Subsystem Architecture & Layer-3 Packages

| Layer | Package | Context Router | Documentation | Artifact Produced |
| :-: | :--- | :--- | :--- | :--- |
| **3** | [`distributions/base/`](./base/AGENTS.md) | [`base/AGENTS.md`](./base/AGENTS.md) | [`base/README.md`](./base/README.md) | `tupynambalucas-dev.wsl` (Ubuntu 26.04 LTS Daily Developer Workstation) |
| **3** | [`distributions/cluster/`](./cluster/AGENTS.md) | [`cluster/AGENTS.md`](./cluster/AGENTS.md) | [`cluster/README.md`](./cluster/README.md) | `tupynambalucas-dev-cluster.wsl` (Ubuntu 26.04 LTS Kubernetes `k3d` Engine) |

Shared assets governed directly by this Layer-2 router (no child `AGENTS.md` or `README.md` permitted):
- [`distributions/package.json`](./package.json): Workspace package manifest (`@tupynambalucas-dev/workstation-distributions`).
- [`distributions/catalog/DistributionInfo.json`](./catalog/DistributionInfo.json): Single Source of Truth (SSOT) manifest consumed by `wsl.exe --install`, `gh tl distro`, and `.github/workflows/release.yml`.
- [`distributions/shared/oobe-common.sh`](./shared/oobe-common.sh): Shared first-boot user creation (`tupy`, `uid=1000`), Windows `~/.ssh` and `~/.gitconfig*` bridge, and Windows Terminal `$FRAGMENT_ROOT/monygang.png` media staging.
- [`distributions/shared/systemd-mask.sh`](./shared/systemd-mask.sh): Masks conflicting systemd units required by Microsoft WSL 2.4.4+ / 3.0+.
- [`distributions/shared/assets/monygang.png`](./shared/assets/monygang.png): Shared Windows Terminal background wallpaper extracted from the developer's `Admin` profile.

## Mandatory WSL 2.4.4+ / 3.0+ Rootfs & Terminal Invariants

1. **Configuration Permissions**: `/etc/wsl.conf` and `/etc/wsl-distribution.conf` MUST be owned by `root:root` with `0644` permissions; `/etc/oobe.sh` and `/usr/lib/wsl/oobe-common.sh` MUST have `0755` permissions.
2. **Rootfs Hygiene**: Never include `/etc/resolv.conf`, `/boot/*` kernels, or `/etc/shadow` password hashes inside exported `.wsl` archives.
3. **Systemd Conflict Masking**: Always execute `/tmp/systemd-mask.sh` during image build to mask `systemd-resolved.service`, `systemd-networkd.service`, `NetworkManager.service`, `systemd-tmpfiles-*`, `tmp.mount`, and `ssh.service`.
4. **Strict RFC 8259 JSON in `terminal-profile.json`**: Because `LxssUserSession.cpp::_CreateTerminalProfile` parses `ProfileTemplate` with `nlohmann::json::parse(..., ignore_comments = false)`, comments (`//`) are strictly forbidden in `assets/terminal-profile.json`.
5. **WSL Issue `#13323` Guardrail**: Never set `"startingDirectory"` inside `terminal-profile.json`; WSL automatically injects `--cd ~` into `"commandline"`.
