#!/usr/bin/env bash
set -euo pipefail

# Source shared enterprise OOBE provisioning logic
# shellcheck source=/dev/null
source /usr/lib/wsl/oobe-common.sh

provision_developer_account "tupy" "1000" "1000"

# Ensure kubeconfig directory is initialized with strict permissions
mkdir -p /home/tupy/.kube
chown -R tupy:tupy /home/tupy/.kube
chmod 0700 /home/tupy/.kube
