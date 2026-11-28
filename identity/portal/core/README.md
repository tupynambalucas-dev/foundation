# Identity Portal Core (`@tupynambalucas-dev/identity-portal-core`)

Zero-runtime-dependency TypeScript contract and build-time registry package shared across the Identity Portal frontend (`@tupynambalucas-dev/identity-portal-web`) and Cloudflare Workers edge backend (`@tupynambalucas-dev/identity-portal-api`).

---

## 1. Overview

Provides a single source of truth (SSOT) for application catalog models, live GitHub App provisioning status contracts, canonical API route paths, and a deterministic build-time code generator (`scripts/generate-registry.ts`) that discovers all apps under `foundation/identity/apps/{github,gcloud}/` automatically.

---

## 2. Exported API Surface

| Export | Kind | Description |
| :--- | :--- | :--- |
| `IAppRecord`, `IPortalAppMetadata`, `ProviderType`, `AppTier`, `AppStatus` | Types | Catalog metadata and optional `portal.json` sidecar contracts for GitHub, Google Cloud OAuth, and Google Workspace identities. |
| `IAppLiveStatus`, `IAppsStatusResponse` | Types | Response contract for live provisioning discovery (`GET /api/apps/status`). |
| `PORTAL_API_ROUTES`, `GITHUB_ORG_SLUG` | Constants | Canonical edge route paths and organization identifier (`tupynambalucas-dev`). |
| `GITHUB_APP_TIERS` | Generated Constant | Auto-discovered GitHub App slugs, names, Infisical secret prefixes, and vault paths. |
| `GITHUB_MANIFESTS_BY_SLUG` | Generated Constant | Auto-discovered pure GitHub App `manifest.json` payloads for Zero Trust Manifest Flow provisioning. |
| `PORTAL_APPS_CATALOG` | Generated Constant | Complete catalog of GitHub and Google apps with real scopes derived from `manifest.json` and `scopes.json`. |

---

## 3. Directory Layout

```text
core/
├── scripts/
│   └── generate-registry.ts    # Build-time TypeScript codegen (executed via tsx)
├── src/
│   ├── apps.types.ts           # Domain, sidecar, and live-status TypeScript interfaces
│   ├── routes.ts               # Canonical API routes & GitHub tier contract
│   ├── registry.generated.ts   # Gitignored auto-generated registry module
│   └── index.ts                # Public barrel exports
├── package.json                # @tupynambalucas-dev/identity-portal-core
├── tsconfig.json               # Composite TypeScript library config
├── tsconfig.scripts.json       # Isolated strict typecheck config for scripts/
├── turbo.json                  # Package-level Turborepo config ($TURBO_ROOT$/identity/apps/**)
├── AGENTS.md                   # Layer-3 AI context router
└── README.md                   # Package documentation
```

---

## 4. Development Scripts

```bash
pnpm --filter @tupynambalucas-dev/identity-portal-core generate
pnpm --filter @tupynambalucas-dev/identity-portal-core build
pnpm --filter @tupynambalucas-dev/identity-portal-core typecheck
```

---

## 5. Governance & Context

- [Identity Subsystem Documentation](../../README.md)
- [Identity Subsystem Context Router](../../AGENTS.md)
- [Package Context Router](./AGENTS.md)
- [License](../../../LICENSE): Apache License 2.0
