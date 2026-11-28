<context-hierarchy>
  <parent src="../../../AGENTS.md" type="global-rules" />
  <parent src="../../AGENTS.md" type="bounded-context-rules" />
  <system-instruction>
    AGENT: You are operating in @tupynambalucas-dev/identity-portal-core (foundation/identity/portal/core). If you have not read "../../../AGENTS.md" and "../../AGENTS.md" in this session, read them first before proceeding.
  </system-instruction>
</context-hierarchy>

# Identity Portal Core Agent Context Router (`@tupynambalucas-dev/identity-portal-core`)

This document serves as the Layer-3 context router for `@tupynambalucas-dev/identity-portal-core`, the zero-runtime-dependency TypeScript contract library shared between `identity/portal/web` and `identity/portal/api`.

## Architectural Boundaries & Ubiquitous Language

- **Shared Contracts Only**: Houses domain interfaces (`IAppRecord`, `IAppLiveStatus`, `IAppsStatusResponse`, `ProviderType`, `AppTier`, `AppStatus`) and canonical route/tier constants (`PORTAL_API_ROUTES`, `GITHUB_APP_TIERS`).
- **Composite Project Reference**: Declares `"composite": true` so both `portal/web` and `portal/api` consume compiled `.d.ts` declarations deterministically via TypeScript Solution Builder (`tsc -b`).

## Operational & Security Guardrails

- MUST NOT import React, DOM/browser globals, Node filesystem APIs, or `@cloudflare/workers-types`.
- MUST keep all route paths synchronized with `portal/api/src/worker.ts` and `portal/web/src/domains/apps/hooks/useLiveAppStatus.ts`.

## Required Skills

- **Identity Plugin (`@tupynambalucas-dev/plugin-identity`)**: `identity-portal-architect`, `app-manifest-architect`.
