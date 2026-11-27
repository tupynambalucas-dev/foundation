#!/usr/bin/env bash
set -euo pipefail

# Local Loopback Daemon Runner for the GitHub App Token Broker.
# Binds strictly to 127.0.0.1 (never 0.0.0.0 on developer workstations) and resolves
# credentials via Infisical CLI when available or parent .env fallback.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BROKER_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
export BIND_ADDR="${BIND_ADDR:-127.0.0.1:8080}"
export POLICIES_PATH="${POLICIES_PATH:-${BROKER_DIR}/config/policies.yaml}"

cd "${BROKER_DIR}"

if command -v infisical >/dev/null 2>&1 && [[ -n "${INFISICAL_PROJECT_ID:-}" ]]; then
  echo "[start-broker] Launching GitHub App Token Broker on ${BIND_ADDR} via Infisical (env=dev)..."
  exec infisical run --env=dev -- go run ./cmd/broker
fi

# Fallback: load nearest .env without printing secret values
for env_candidate in "${BROKER_DIR}/.env" "${BROKER_DIR}/../../../.env" "${BROKER_DIR}/../../../../.env"; do
  if [[ -f "${env_candidate}" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "${env_candidate}"
    set +a
    break
  fi
done

echo "[start-broker] Launching GitHub App Token Broker on ${BIND_ADDR}..."
exec go run ./cmd/broker
