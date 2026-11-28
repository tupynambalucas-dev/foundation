# Organizational PR Quality Gate Guardian (`tupynambalucas-org-guardian`)

Tier-2B protection and verification GitHub App (`App ID: 5959745`, `Bot User ID: 362146655`) evaluating all 7 Enterprise Quality Gates via Cloudflare Workflows (`apps.tupynambalucas.dev`).

---

## 1. Overview

`org-guardian` provides independent, cryptographic Pull Request approvals satisfying trunk branch protection without routine `--admin` overrides, enforcing strict Separation of Duties from `org-automation` and `org-manager`.

---

## 2. Identity & Vault Specification

| Property | Value |
| :--- | :--- |
| **Provider / Scope** | `github` / `org` |
| **GitHub App Name** | `tupynambalucas-org-guardian` |
| **App ID / Bot User ID** | `5959745` / `362146655` |
| **Infisical Vault Path** | `/protection` (`GUARDIAN_*`) |
| **Webhook Endpoint** | `https://apps.tupynambalucas.dev/webhooks/github` (`active: true`) |
| **Portal Detail Page** | `https://apps.tupynambalucas.dev/apps/org-guardian` |

---

## 3. Directory Layout

```text
org-guardian/
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
