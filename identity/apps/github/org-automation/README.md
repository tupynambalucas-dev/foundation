# Organizational CI/CD Delivery Identity (`tupynambalucas-org-automation`)

Tier-2A headless execution and release automation GitHub App (`App ID: 5650100`, `Bot User ID: 353557933`) driving continuous integration, Release Please manifests, and GitHub Packages publishing across `tupynambalucas-dev`.

---

## 1. Overview

`org-automation` operates as the delivery plane identity in the 4-Tier Separation of Duties architecture. It is strictly isolated from organization administration (`org-manager`) and Pull Request approval (`org-guardian`).

---

## 2. Identity & Vault Specification

| Property | Value |
| :--- | :--- |
| **Provider / Scope** | `github` / `org` |
| **GitHub App Name** | `tupynambalucas-org-automation` |
| **App ID / Bot User ID** | `5650100` / `353557933` |
| **Infisical Vault Path** | `/delivery` (`AUTOMATION_*`) |
| **Portal Detail Page** | `https://apps.tupynambalucas.dev/apps/org-automation` |

---

## 3. Directory Layout

```text
org-automation/
├── manifest.json       # Unified Zod-validated GitHub App + portal manifest
├── description.md      # Canonical GFM App description + portal-summary marker
└── README.md           # Technical identity specification
```

---

## 4. Governance & Context

- [Identity Subsystem Documentation](../../README.md)
- [Identity Subsystem Context Router](../../AGENTS.md)
- [Canonical App Description](./description.md)
- [License](../../../../LICENSE): Apache License 2.0
