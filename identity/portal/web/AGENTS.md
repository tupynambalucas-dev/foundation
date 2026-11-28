<context-hierarchy>
  <parent src="../../../AGENTS.md" type="global-rules" />
  <parent src="../../AGENTS.md" type="bounded-context-rules" />
  <system-instruction>
    AGENT: You are operating in @tupynambalucas-dev/identity-portal-web (foundation/identity/portal/web). If you have not read "../../../AGENTS.md" and "../../AGENTS.md" in this session, read them first before proceeding.
  </system-instruction>
</context-hierarchy>

# Identity Portal Web SPA Agent Context Router (`@tupynambalucas-dev/identity-portal-web`)

This document serves as the Layer-3 context router for `@tupynambalucas-dev/identity-portal-web`, the React 19 + Vite + Tailwind CSS v4 Feature-Sliced Design (FSD) frontend served as static assets on `https://apps.tupynambalucas.dev`.

## Architectural Boundaries & Ubiquitous Language

- **Pure FSD Frontend (`src/`)**: Strictly partitioned into `domains/` (global state & data hooks), `features/` (interactive views), and `shared/` (domain-agnostic UI & router).
- **Unidirectional FSD Imports**: `features/` -> `domains/` -> `shared/` (plus `@tupynambalucas-dev/identity-portal-core`). Never import from `portal/api/`.
- **Live Status Hydration (`useLiveAppStatus`)**: Hydrates `APPS_DATA` from `GET /api/apps/status`, automatically switching unprovisioned/deleted GitHub Apps to `Pendente de Provisionamento` with a Zero Trust `/api/github/provision?tier=<slug>` action link.
- **Static Assets Output**: Builds to `dist/`, consumed by `../api/wrangler.jsonc` (`assets.directory: "../web/dist"`), with edge security headers in `public/_headers`.

## Operational & Security Guardrails

- MUST NOT add Cloudflare Worker handlers, `@cloudflare/workers-types`, `wrangler`, or secret credentials to `portal/web/`.
- MUST keep `/` and `/privacy`, `/terms`, `/rclone`, `/workspace` publicly renderable for Google OAuth and GitHub App compliance auditors.

## Required Skills

- **Identity Plugin (`@tupynambalucas-dev/plugin-identity`)**: `identity-portal-architect`.
- **Web Guidance (`modern-web-guidance`)**: Activate before UI/CSS/layout modifications.
