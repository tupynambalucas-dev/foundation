#!/usr/bin/env bash
set -euo pipefail

# Mask systemd units documented by Microsoft Learn as conflicting with WSL2 drivers:
# Source: https://learn.microsoft.com/en-us/windows/wsl/build-custom-distro#systemd-recommendations
CONFLICTING_UNITS=(
  "systemd-resolved.service"
  "systemd-networkd.service"
  "NetworkManager.service"
  "systemd-tmpfiles-setup.service"
  "systemd-tmpfiles-clean.service"
  "systemd-tmpfiles-clean.timer"
  "systemd-tmpfiles-setup-dev-early.service"
  "systemd-tmpfiles-setup-dev.service"
  "tmp.mount"
  "ssh.service"
)

for unit in "${CONFLICTING_UNITS[@]}"; do
  ln -sf /dev/null "/etc/systemd/system/${unit}"
  mkdir -p /etc/systemd/user
  ln -sf /dev/null "/etc/systemd/user/${unit}"
done

# Ensure rootfs hygiene invariants required by WSL 2.4.4+
rm -f /etc/resolv.conf
# shellcheck disable=SC2115
rm -rf /boot/* /var/lib/apt/lists/* /tmp/* /var/tmp/*
