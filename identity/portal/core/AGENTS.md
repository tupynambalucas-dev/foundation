<context-hierarchy>
  <parent src="../../../AGENTS.md" type="global-rules" />
  <parent src="../../AGENTS.md" type="bounded-context-rules" />
  <system-instruction>
    AGENT: You are operating in @tupynambalucas-dev/identity-portal-core (foundation/identity/portal/core). If you have not read "../../../AGENTS.md" and "../../AGENTS.md" in this session, read them first before proceeding.
  </system-instruction>
</context-hierarchy>

# Identity Portal Core Agent Context Router (`@tupynambalucas-dev/identity-portal-core`)

This document serves as the Layer-3 context router for `@tupynambalucas-dev/identity-portal-core`, the zero-runtime-dependency TypeScript contract and build-time auto-discovery registry library shared between `identity/portal/web` and `identity/portal/api`.

## Architectural Boundaries & Ubiquitous Language

- **Shared Contracts & Generated Registry**: Houses domain interfaces (`IAppRecord`, `IPortalAppMetadata`, `IAppLiveStatus`, `IAppsStatusResponse`, `ProviderType`, `AppTier`, `AppStatus`), canonical route constants (`PORTAL_API_ROUTES`), and the build-time generated registry (`GITHUB_APP_TIERS`, `GITHUB_MANIFESTS_BY_SLUG`, `PORTAL_APPS_CATALOG`).
- **Build-Time Codegen**: `scripts/generate-registry.ts` (executed via `tsx`) scans `foundation/identity/apps/{github,gcloud}/*`, enforces manifest invariants (rejecting sunset `team_discussions` and built-in `installation*` events), and writes `src/registry.generated.ts` (gitignored).
- **Composite Project Reference & Turborepo Inputs**: Declares `"composite": true` for TypeScript Solution Builder (`tsc -b`) and `turbo.json` with `$TURBO_ROOT$/identity/apps/**/*.json` so cache invalidates deterministically when any manifest or `portal.json` changes.

## Operational & Security Guardrails

- Runtime source files under `src/` MUST NOT import React, DOM/browser globals, Node filesystem APIs, or `@cloudflare/workers-types` (Node APIs are strictly confined to `scripts/`).
- NEVER edit `src/registry.generated.ts` manually; always modify the authoritative manifests or optional `portal.json` under `foundation/identity/apps/`.
- MUST keep all route paths synchronized with `portal/api/src/worker.ts` and `portal/web/src/domains/apps/hooks/useLiveAppStatus.ts`.

## Required Skills

- **Identity Plugin (`@tupynambalucas-dev/plugin-identity`)**: `identity-portal-architect`, `app-manifest-architect`.
