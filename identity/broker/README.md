# Go Token Broker STS (`foundation/identity/broker`)

High-performance Go Security Token Service (STS) that confines 2048-bit RSA GitHub App private keys in memory and vends ephemeral, repository- and permission-downscoped 60-minute Installation Access Tokens (IATs) governed by declarative YAML policies.

---

## 1. Overview

`foundation/identity/broker` eliminates static private key sprawl across CI/CD repositories and local developer MCP servers:
- Supports all 3 server-to-server tiers: `org-manager` (Tier-1), `automation` (Tier-2A), and `guardian` (Tier-2B) with strict `No-Privilege-Escalation`.
- Authenticates GitHub Actions callers via RS256 OIDC JWKS (`https://token.actions.githubusercontent.com/.well-known/jwks`) and local Agent Mesh MCP servers via constant-time `TOKEN_BROKER_API_KEY` + `X-Caller-ID`.
- Caches minted IATs in memory for 55 minutes (`sync.RWMutex`) and enforces `X-GitHub-Api-Version: 2026-03-10`.

---

## 2. Endpoints & Capabilities

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/healthz` | `GET` | Public | Liveness probe returning HTTP 200. |
| `/v1/token` | `POST` | OIDC JWT or `TOKEN_BROKER_API_KEY` + `X-Caller-ID` | Validates policy in `config/policies.yaml` and returns a down-scoped 1h GitHub IAT. |

---

## 3. Directory Layout

```text
broker/
├── cmd/broker/
│   ├── main.go                 # HTTP server, RS256 JWT signer, JWKS verifier, 55m cache
│   └── main_test.go            # Unit tests covering policy enforcement and No-Privilege-Escalation
├── config/
│   └── policies.yaml           # Declarative subject -> tier/repository/permission policies
├── scripts/
│   └── start-broker.sh         # Local loopback launcher (127.0.0.1:8080)
├── Dockerfile                  # Multi-stage distroless container build
├── go.mod & go.sum             # Standalone Go module manifest
├── AGENTS.md                   # Layer-3 AI context router
└── README.md                   # Package documentation
```

---

## 4. Configuration & Usage

Required environment variables (loaded from Infisical or `.env`):
- `ORG_MANAGER_APP_ID`, `ORG_MANAGER_APP_INSTALLATION_ID`, `ORG_MANAGER_APP_PRIVATE_KEY_BASE64`
- `AUTOMATION_APP_ID`, `AUTOMATION_APP_INSTALLATION_ID`, `AUTOMATION_APP_PRIVATE_KEY_BASE64`
- `GUARDIAN_APP_ID`, `GUARDIAN_APP_INSTALLATION_ID`, `GUARDIAN_APP_PRIVATE_KEY_BASE64`
- `TOKEN_BROKER_API_KEY` (for local MCP callers), `BIND_ADDR` (default `127.0.0.1:8080`), `POLICIES_PATH` (default `config/policies.yaml`)

---

## 5. Development Scripts

```bash
cd identity/broker
go vet ./...
go test -v ./...
bash scripts/start-broker.sh
```

---

## 6. Governance & Context

- [Identity Subsystem Documentation](../README.md)
- [Identity Subsystem Context Router](../AGENTS.md)
- [Broker Context Router](./AGENTS.md)
- [License](../../LICENSE): Apache License 2.0
