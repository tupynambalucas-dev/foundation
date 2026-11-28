# Identity Portal Edge API (`@tupynambalucas-dev/identity-portal-api`)

Cloudflare Workers and Workflows edge runtime powering `tupynambalucas-apps-portal` (`https://apps.tupynambalucas.dev`), serving static SPA assets (`../web/dist`), Zero Trust GitHub App Manifest Flow provisioning, live app status discovery, and autonomous 7-Gate PR approvals.

---

## 1. Overview

Encapsulates all server-side edge logic for `apps.tupynambalucas.dev` using native Web Crypto (`crypto.subtle`) and `fetch()` (zero heavy Node SDKs), staying strictly within Cloudflare Workers Free CPU limits (`< 10ms` CPU/step).

---

## 2. Edge Routes & Bindings

| Route | Auth Layer | Handler | Responsibility |
| :--- | :--- | :--- | :--- |
| `GET /api/health` | Public | `worker.ts` | Returns service health and `workflowsBound: true`. |
| `GET /api/apps/status` | Public (60s edge cache) | `github/apps-status.ts` | Queries live GitHub App IDs via ephemeral Guardian IAT for all 4 private org apps. |
| `GET /api/github/provision` | Cloudflare Access + JWKS | `github/provision.ts` | Signs CSRF `state` and submits authoritative `manifest.json` to GitHub Manifest Flow. |
| `GET /api/github/callback` | Cloudflare Access + HMAC `state` | `github/callback.ts` | Converts manifest `code`, auto-creates Infisical folders, upserts secrets (`dev`/`prod`), redirects to Install. |
| `POST /webhooks/github` | Constant-time HMAC-SHA256 | `github/webhooks.ts` | Verifies `X-Hub-Signature-256` and dispatches `PrGateEvaluatorWorkflow`. |

---

## 3. Directory Layout

```text
api/
├── src/
│   ├── github/                 # access.ts, apps-status.ts, callback.ts, gates.ts, jwt.ts, provision.ts, signature.ts, webhooks.ts, portal-api.test.ts
│   ├── infisical/              # client.ts (Universal Auth + auto-folder creation + secret upsert)
│   ├── notifications/          # magic-link.ts
│   ├── workflows/              # pr-gate-evaluator.ts (PrGateEvaluatorWorkflow)
│   ├── types.ts                # PortalEnv & PrGateParams
│   └── worker.ts               # Cloudflare Worker entrypoint
├── wrangler.jsonc              # Worker, Workflows, observability traces, assets -> ../web/dist
├── worker-configuration.d.ts   # Generated via wrangler types
├── package.json                # @tupynambalucas-dev/identity-portal-api
├── tsconfig.json
├── AGENTS.md                   # Layer-3 AI context router
└── README.md                   # Package documentation
```

---

## 4. Development Scripts

```bash
pnpm --filter @tupynambalucas-dev/identity-portal-api test
pnpm --filter @tupynambalucas-dev/identity-portal-api typecheck
pnpm --filter @tupynambalucas-dev/identity-portal-api cf-typegen
pnpm --filter @tupynambalucas-dev/identity-portal-api exec wrangler deploy --dry-run
```

---

## 5. Governance & Context

- [Identity Subsystem Documentation](../../README.md)
- [Identity Subsystem Context Router](../../AGENTS.md)
- [Package Context Router](./AGENTS.md)
- [License](../../../LICENSE): Apache License 2.0
