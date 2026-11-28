<context-hierarchy>
  <parent src="../AGENTS.md" type="global-rules" />
  <system-instruction>
    AGENT: You are operating in the Machine Identities & Portal bounded context (foundation/identity). If you have not read "../AGENTS.md" in this session, read it first before proceeding.
  </system-instruction>
</context-hierarchy>

# Machine Identities & Portal Bounded Context Agent Context Router

This document serves as the Layer-2 context router for `foundation/identity/`, governing the 4-Tier GitHub App declarative manifests, Google Cloud/Workspace identity specifications, corporate compliance pages, the Go Token Broker STS, and the Cloudflare Workers Identity Portal (`apps.tupynambalucas.dev`).

## Architectural Boundaries & Ubiquitous Language

- **4-Tier Machine Identity Matrix (`apps/github/`)**:
  - Tier-1 (`org-manager`): Executive organization governance (`tupynambalucas-org-manager`, Bot User ID `353527435`).
  - Tier-2A (`org-automation`): CI/CD delivery, releases, and package publishing (`tupynambalucas-org-automation`, Bot User ID `353557933`).
  - Tier-2B (`org-guardian`): Independent 7-Gate PR verification and security auditing (`tupynambalucas-org-guardian`, Bot User ID `362146655`).
  - Tier-3 (`developer-tools`): Public OAuth Device-Flow workstation CLI (`tupynambalucas-developer-tools`, Bot User ID `353560338`).
- **3-File App Anatomy (`apps/{github,gcloud}/<slug>/`)**: Every App declares `manifest.json` (Zod `UnifiedAppManifestSchema`), `description.md` (5-part GFM structure + `<!-- portal-summary: ... -->`), and `README.md` (Archetype D technical spec) with zero emojis.
- **Modular Edge Portal (`portal/{core,web,api}/`)**: Strict DDD/FSD/SOLID separation between shared contracts (`core/`), React SPA (`web/`), and Cloudflare Worker/Workflows runtime (`api/`). `portal/` is an intermediate grouping folder and MUST NOT declare an `AGENTS.md`.
- **Token Broker STS (`broker/`)**: Go daemon vending 60-minute down-scoped Installation Access Tokens with strict `No-Privilege-Escalation` boundaries.

## Navigation Table (Layer 3 Sovereign Packages & Assets)

| Layer | Structural Unit | Context Router | Documentation | Responsibility |
| :-: | :--- | :--- | :--- | :--- |
| **3** | **Go Token Broker (`broker/`)** | [`broker/AGENTS.md`](./broker/AGENTS.md) | [`broker/README.md`](./broker/README.md) | Go STS vending down-scoped 1h GitHub IATs with OIDC JWKS and 55m memory cache. |
| **3** | **Portal Core (`portal/core/`)** | [`portal/core/AGENTS.md`](./portal/core/AGENTS.md) | [`portal/core/README.md`](./portal/core/README.md) | Shared TypeScript contracts (`IAppRecord`, `IAppLiveStatus`, `PORTAL_API_ROUTES`). |
| **3** | **Portal Web (`portal/web/`)** | [`portal/web/AGENTS.md`](./portal/web/AGENTS.md) | [`portal/web/README.md`](./portal/web/README.md) | React 19 + Vite + FSD frontend SPA (`apps.tupynambalucas.dev`). |
| **3** | **Portal API (`portal/api/`)** | [`portal/api/AGENTS.md`](./portal/api/AGENTS.md) | [`portal/api/README.md`](./portal/api/README.md) | Cloudflare Worker, `PrGateEvaluatorWorkflow`, Zero Trust Manifest Flow, and `/api/apps/status`. |
| **Asset** | **App Manifests (`apps/`)** | Governed by this router | [`README.md`](./README.md) | Declarative GitHub App (`apps/github/*`) and Google Cloud (`apps/gcloud/org-workspace`) manifests + `description.md`. |

## Operational & Security Guardrails

- NEVER commit plaintext RSA private keys (`.pem`), webhook secrets, or Infisical credentials.
- NEVER include built-in `"installation"` / `"installation_repositories"` in `default_events` or removed `"team_discussions"` in `default_permissions` of GitHub App manifests.
- ALWAYS keep `identity/apps/github/**` in `.github/workflows/deploy-portal.yml` path triggers so manifest updates automatically redeploy the Worker.

## Required Skills

- **Identity Plugin (`@tupynambalucas-dev/plugin-identity`)**: `app-manifest-architect`, `identity-portal-architect`, `token-broker-operator`.
- **Cloudflare Plugin (`@tupynambalucas-dev/plugin-cloudflare`)**: `wrangler`, `workers-best-practices`, `cloudflare-one`.
- **Secrets Plugin (`@tupynambalucas-dev/plugin-secrets`)**: `infisical-vault-operator`.
