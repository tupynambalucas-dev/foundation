<!-- portal-summary: Plataforma central Google Workspace & Cloud da organização: montagem de unidades Google Drive via Rclone (OAuth Desktop) e automação de planilhas 1NF/AppSheet e Google Docs via Service Account. -->
### Google Cloud & Workspace Organizational Platform (`tupynambalucas-org-workspace`)

`tupynambalucas-org-workspace` is the unified organizational Google Cloud identity (`tupynambalucas-dev-core`) for `tupynambalucas-dev`, consolidating interactive desktop filesystem synchronization (Rclone + WinFsp on Windows and WSL2) and automated Google Workspace / AppSheet orchestration (`agent-mesh` plugins `gwork` and `appsheet`).

#### Core Responsibilities
- **Virtual Drive Mounting & Backup (Rclone OAuth Desktop)**: Maps authorized Google Drive accounts as local Windows drives via WinFsp and executes encrypted incremental backups.
- **1NF Relational Workbook Synthesis**: Generates normalized Google Sheets databases with frozen headers and deterministic `UNIQUEID()` primary keys for Google AppSheet.
- **Technical Specification Publishing**: Converts Markdown architecture blueprints into formatted Google Docs inside designated Team Drive folders.

#### Custody & Security Architecture
- **OAuth Desktop Authentication**: Installed Desktop Application OAuth 2.0 flow (`http://localhost:53682/`, `http://127.0.0.1:53682/`) storing refresh tokens strictly inside local `rclone.conf` files.
- **Machine-to-Machine Service Account**: Dedicated `org-workspace@tupynambalucas-dev-core.iam.gserviceaccount.com` vaulted in Infisical Cloud (`GOOGLE_SERVICE_ACCOUNT_JSON`).
- **Compliance**: Adheres strictly to the Google API Services User Data Policy (Limited Use), with zero third-party sharing or AI model training.

> [!NOTE]
> Hosted under the single organizational GCP project `tupynambalucas-dev-core` with verified domain `tupynambalucas.dev` and canonical portal compliance pages on `https://apps.tupynambalucas.dev`.
