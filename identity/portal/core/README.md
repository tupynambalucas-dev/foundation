# Identity Portal Core (`@tupynambalucas-dev/identity-portal-core`)

Zero-runtime-dependency TypeScript contract package shared across the Identity Portal frontend (`@tupynambalucas-dev/identity-portal-web`) and Cloudflare Workers edge backend (`@tupynambalucas-dev/identity-portal-api`).

---

## 1. Overview

Provides a single source of truth (SSOT) for application catalog models, live GitHub App provisioning status contracts, and canonical API route paths without coupling browser or Cloudflare Worker runtime dependencies.

---

## 2. Exported API Surface

| Export | Kind | Description |
| :--- | :--- | :--- |
| `IAppRecord`, `ProviderType`, `AppTier`, `AppStatus` | Types | Catalog metadata contract for GitHub Apps, Google Cloud OAuth, and Google Workspace identities. |
| `IAppLiveStatus`, `IAppsStatusResponse` | Types | Response contract for live provisioning discovery (`GET /api/apps/status`). |
| `PORTAL_API_ROUTES` | Constant | Canonical edge route paths (`/api/health`, `/api/apps/status`, `/api/github/provision`, `/api/github/callback`, `/webhooks/github`). |
| `GITHUB_APP_TIERS`, `GITHUB_ORG_SLUG` | Constants | Authoritative 4-Tier GitHub App slugs and organization identifier (`tupynambalucas-dev`). |

---

## 3. Directory Layout

```text
core/
├── src/
│   ├── apps.types.ts           # Domain & live-status TypeScript interfaces
│   ├── routes.ts               # Canonical API routes & 4-Tier GitHub App specs
│   └── index.ts                # Public barrel exports
├── package.json                # @tupynambalucas-dev/identity-portal-core
├── tsconfig.json               # Composite TypeScript library config
├── AGENTS.md                   # Layer-3 AI context router
└── README.md                   # Package documentation
```

---

## 4. Development Scripts

```bash
pnpm --filter @tupynambalucas-dev/identity-portal-core build
pnpm --filter @tupynambalucas-dev/identity-portal-core typecheck
```

---

## 5. Governance & Context

- [Identity Subsystem Documentation](../../README.md)
- [Identity Subsystem Context Router](../../AGENTS.md)
- [Package Context Router](./AGENTS.md)
- [License](../../../LICENSE): Apache License 2.0
