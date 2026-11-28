# Identity Portal Web SPA (`@tupynambalucas-dev/identity-portal-web`)

React 19, Vite, and Tailwind CSS v4 Single-Page Application structured with Feature-Sliced Design (FSD) serving the institutional identity catalog, OAuth compliance pages, and Zero Trust provisioning triggers on `https://apps.tupynambalucas.dev`.

---

## 1. Overview

Provides the public brand-verification frontend for `tupynambalucas-dev` while dynamically hydrating live GitHub App provisioning state from `GET /api/apps/status`. Compiled static assets in `dist/` are served by `@tupynambalucas-dev/identity-portal-api` via Cloudflare Workers Static Assets.

---

## 2. Capabilities & Views

| Route | Feature View | Description |
| :--- | :--- | :--- |
| `/` | `AppCatalogView` + `AppCard` | Filterable catalog of GitHub Apps, Google Cloud OAuth, and Workspace identities hydrated via `useLiveAppStatus`. |
| `/privacy` | `PrivacyView` | Canonical Corporate Privacy Policy (LGPD/GDPR & Google API Limited Use). |
| `/terms` | `TermsView` | Canonical Terms of Service. |
| `/rclone` | `RcloneView` | Google OAuth brand-verification landing page for Rclone Desktop Client. |
| `/workspace` | `WorkspaceView` | Google Workspace & AppSheet automation compliance page. |

---

## 3. Directory Layout

```text
web/
├── public/
│   ├── _headers                # Edge security headers for static assets
│   └── robots.txt
├── src/
│   ├── domains/                # apps/ (apps.data.ts, hooks/useLiveAppStatus.ts), compliance/
│   ├── features/               # app-catalog/, legal-portal/, rclone-portal/, workspace-portal/, not-found/
│   ├── shared/                 # router/useRouter.tsx, ui/ (Badge, Footer, Header, Icons)
│   ├── App.tsx
│   ├── main.tsx
│   └── main.css
├── index.html
├── vite.config.ts
├── package.json                # @tupynambalucas-dev/identity-portal-web
├── tsconfig.json
├── AGENTS.md                   # Layer-3 AI context router
└── README.md                   # Package documentation
```

---

## 4. Development Scripts

```bash
pnpm --filter @tupynambalucas-dev/identity-portal-web dev
pnpm --filter @tupynambalucas-dev/identity-portal-web build
pnpm --filter @tupynambalucas-dev/identity-portal-web typecheck
```

---

## 5. Governance & Context

- [Identity Subsystem Documentation](../../README.md)
- [Identity Subsystem Context Router](../../AGENTS.md)
- [Package Context Router](./AGENTS.md)
- [License](../../../LICENSE): Apache License 2.0
