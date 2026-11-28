# Machine Identities, Token Broker & Identity Portal (`foundation/identity`)

Sovereign Layer-2 bounded context consolidating 4-Tier GitHub App declarative manifests, Google Cloud/Workspace identity specifications, corporate compliance policies, the Go Token Broker STS, and the modular Cloudflare Workers Identity Portal (`apps.tupynambalucas.dev`).

---

## 1. Overview

`foundation/identity/` provides the authoritative control plane for machine-to-machine authentication and automated Pull Request governance across `tupynambalucas-dev`:
- **Zero-Disk-PEM Provisioning**: GitHub Apps are provisioned via Zero Trust Manifest Flow (`https://apps.tupynambalucas.dev/api/github/provision`), converting RSA keys to Base64 in memory and upserting directly into Infisical Cloud (`/governance`, `/delivery`, `/protection`, `/workstation`).
- **Autonomous 7-Gate PR Approval**: `tupynambalucas-guardian` evaluates Pull Requests durably via Cloudflare Workflows (`PrGateEvaluatorWorkflow`), eliminating routine `--admin` branch bypasses.
- **Down-Scoped Token Vending**: `identity/broker/` issues 60-minute repository- and permission-scoped GitHub Installation Access Tokens governed by `config/policies.yaml`.

---

## 2. Subsystems & Packages Catalog

| Layer | Package / Directory | Package Name | Documentation | Agent Context | Responsibility |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **3** | [`broker/`](./broker/) | Go Module | [`broker/README.md`](./broker/README.md) | [`broker/AGENTS.md`](./broker/AGENTS.md) | Go Security Token Service (STS) for ephemeral GitHub App IATs. |
| **3** | [`portal/core/`](./portal/core/) | `@tupynambalucas-dev/identity-portal-core` | [`portal/core/README.md`](./portal/core/README.md) | [`portal/core/AGENTS.md`](./portal/core/AGENTS.md) | Shared TypeScript contracts, live app status types, and route constants. |
| **3** | [`portal/web/`](./portal/web/) | `@tupynambalucas-dev/identity-portal-web` | [`portal/web/README.md`](./portal/web/README.md) | [`portal/web/AGENTS.md`](./portal/web/AGENTS.md) | React 19 + Vite + Tailwind FSD SPA with live `/api/apps/status` hydration. |
| **3** | [`portal/api/`](./portal/api/) | `@tupynambalucas-dev/identity-portal-api` | [`portal/api/README.md`](./portal/api/README.md) | [`portal/api/AGENTS.md`](./portal/api/AGENTS.md) | Cloudflare Worker, Workflows, Zero Trust Manifest Flow, and Infisical callback. |
| **Asset** | `apps/github/` | Declarative Manifests | — | Governed by [`AGENTS.md`](./AGENTS.md) | 4-Tier GitHub App manifests (`org-manager`, `automation`, `guardian`, `developer-tools`). |
| **Asset** | `apps/gcloud/` | Identity Specs | — | Governed by [`AGENTS.md`](./AGENTS.md) | Google Cloud OAuth and Service Account specifications (`drive-rclone`, `workspace-automation`). |
| **Asset** | [`compliance/`](./compliance/) | Legal Assets | [`compliance/README.md`](./compliance/README.md) | Governed by [`AGENTS.md`](./AGENTS.md) | Privacy Policy and Terms of Service for OAuth brand verification. |

---

## 3. Directory Layout

```text
identity/
├── apps/
│   ├── github/                 # org-manager/, automation/, guardian/, developer-tools/ (manifest.json)
│   └── gcloud/                 # drive-rclone/, workspace-automation/
├── broker/                     # Go Token Broker STS (go.mod, cmd/broker/, config/policies.yaml)
├── compliance/                 # privacy-policy.html, terms-of-service.html
├── portal/
│   ├── core/                   # Shared TS contracts (@tupynambalucas-dev/identity-portal-core)
│   ├── web/                    # React SPA (@tupynambalucas-dev/identity-portal-web)
│   └── api/                    # Cloudflare Worker + Workflows (@tupynambalucas-dev/identity-portal-api)
├── AGENTS.md                   # Layer-2 bounded context router
└── README.md                   # Subsystem documentation
```

---

## 4. Development & Verification Commands

```bash
# Build portal shared core and web SPA
pnpm --filter @tupynambalucas-dev/identity-portal-core build
pnpm --filter @tupynambalucas-dev/identity-portal-web build

# Test and typecheck Cloudflare Worker API
pnpm --filter @tupynambalucas-dev/identity-portal-api test
pnpm --filter @tupynambalucas-dev/identity-portal-api typecheck

# Test Go Token Broker
cd identity/broker && go vet ./... && go test -v ./...
```

---

## 5. Governance & Context

- [Foundation Root Documentation](../README.md)
- [Foundation Root Context Router](../AGENTS.md)
- [Identity Bounded Context Router](./AGENTS.md)
- [License](../LICENSE): Apache License 2.0
