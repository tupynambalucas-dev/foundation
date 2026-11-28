# Google Cloud & Workspace Organizational Platform (`tupynambalucas-org-workspace`)

Unified organizational Google Cloud identity (`tupynambalucas-dev-core`) consolidating OAuth Desktop Client synchronization (Rclone + WinFsp) and Machine-to-Machine Google Workspace / AppSheet automation (`agent-mesh` plugins `gwork` and `appsheet`).

---

## 1. Overview

`org-workspace` centralizes all internal Google Workspace API integrations (`drive.googleapis.com`, `sheets.googleapis.com`, `docs.googleapis.com`) under a single GCP project (`tupynambalucas-dev-core`) and a single Google Auth Platform branding configuration (`tupynambalucas.dev`).

---

## 2. Authentication Surfaces

| Surface | Type | Consumer | Storage / Custody |
| :--- | :--- | :--- | :--- |
| **OAuth Desktop Client** | Installed App (`614272183592-...`) | Rclone (Windows & WSL2), local CLIs | Local workstation `rclone.conf` (zero remote token retention) |
| **Service Account** | `org-workspace@tupynambalucas-dev-core.iam.gserviceaccount.com` | `agent-mesh/gwork`, `agent-mesh/appsheet` | Infisical Cloud (`GOOGLE_SERVICE_ACCOUNT_JSON`) |

---

## 3. Directory Layout

```text
org-workspace/
├── manifest.json       # Unified Zod-validated Google Cloud + portal manifest
├── description.md      # Canonical GFM App description + portal-summary marker
└── README.md           # Technical identity specification
```

---

## 4. Governance & Context

- [Identity Subsystem Documentation](../../README.md)
- [Identity Subsystem Context Router](../../AGENTS.md)
- [Canonical App Description](./description.md)
- [License](../../../../LICENSE): Apache License 2.0
