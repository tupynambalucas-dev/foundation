<context-hierarchy>
  <parent src="../../../AGENTS.md" type="global-rules" />
  <parent src="../../AGENTS.md" type="bounded-context-rules" />
  <system-instruction>
    AGENT: You are operating in @tupynambalucas-dev/identity-portal-api (foundation/identity/portal/api). If you have not read "../../../AGENTS.md" and "../../AGENTS.md" in this session, read them first before proceeding.
  </system-instruction>
</context-hierarchy>

# Identity Portal API Agent Context Router (`@tupynambalucas-dev/identity-portal-api`)

This document serves as the Layer-3 context router for `@tupynambalucas-dev/identity-portal-api`, the Cloudflare Workers + Workflows edge runtime powering `tupynambalucas-apps-portal` (`https://apps.tupynambalucas.dev`).

## Architectural Boundaries & Ubiquitous Language

- **Cloudflare Worker Entrypoint (`src/worker.ts`)**: Routes `/api/health`, `/api/apps/status`, `/api/github/provision`, `/api/github/callback`, `/webhooks/github`, and falls back to Static Assets (`../web/dist`).
- **Durable PR Approval (`src/workflows/pr-gate-evaluator.ts`)**: `PrGateEvaluatorWorkflow` evaluates all 7 Enterprise Quality Gates and submits formal `APPROVED` reviews as `@tupynambalucas-guardian[bot]`.
- **Zero Trust Manifest Flow (`src/github/provision.ts`, `src/github/callback.ts`)**: Protected by Cloudflare Access (`/api/github/*`), validates `Cf-Access-Jwt-Assertion` via JWKS + stateless HMAC `state`, auto-creates Infisical folders (`src/infisical/client.ts`), and upserts credentials directly into Infisical Cloud (`dev` and `prod`).
- **Live Status Discovery (`src/github/apps-status.ts`)**: Authenticates via ephemeral Guardian IAT (cached 60s via `caches.default`) to report live provisioning status for private org GitHub Apps.

## Operational & Security Guardrails

- ALWAYS run `pnpm --filter @tupynambalucas-dev/identity-portal-api cf-typegen` (`wrangler types`) whenever bindings change in `wrangler.jsonc`.
- NEVER return tokens or private keys from `step.do()` in Cloudflare Workflows; sanitize Workflow Instance IDs to `^[a-zA-Z0-9_][a-zA-Z0-9-_]*$` (max 100 chars) for dotfile repos (`.github`, `.github-private`).
- NEVER add React/Vite browser dependencies to `portal/api/`.

## Required Skills

- **Identity Plugin (`@tupynambalucas-dev/plugin-identity`)**: `identity-portal-architect`, `app-manifest-architect`.
- **Cloudflare Plugin (`@tupynambalucas-dev/plugin-cloudflare`)**: `wrangler`, `workers-best-practices`, `cloudflare-one`.
