<!-- portal-summary: Plano de Proteção, Auditoria e Governança (SoD). Avalia os 7 Quality Gates, assinaturas SSH, commits semânticos e confinamento de arquivos para aprovação formal de PRs. -->
### Autonomous PR Quality Gate & Security Compliance Guardian

`tupynambalucas-org-guardian` is the Tier-2B protection and verification identity for `tupynambalucas-dev`, independently evaluating all 7 Enterprise Quality Gates via Cloudflare Workflows (`apps.tupynambalucas.dev`) and auditing repository security alerts.

#### Core Responsibilities
- **7-Gate Autonomous PR Verification**: Evaluates CI checks, cryptographic SSH signatures, RBAC author allowlists, security alerts, Conventional Commits / Zero-Emoji invariants, Head SHA idempotency, and bot file confinement.
- **Independent PR Approvals**: Submits formal `APPROVE` reviews satisfying trunk branch protection without routine `--admin` overrides (strict Separation of Duties from Tier-2A `tupynambalucas-org-automation`).
- **Security Posture Auditing**: Read-only auditing of Dependabot vulnerability alerts and Secret Scanning alerts via `@tupynambalucas-dev/mcp-github-governance`.

#### Custody & Security Architecture
- **Authentication**: Server-to-Server RS256 App JWT minting single-repository downscoped Installation Access Tokens inside Cloudflare Workflows and the Go Token Broker.
- **Custody**: Strictly restricted to `security-managers` and `lead-architects`, isolated from code authoring and organization administration.
- **Vaulting**: Vaulted in Infisical Cloud (`/protection/`) and Cloudflare Worker Secrets (`tupynambalucas-apps-portal`).
- **Webhooks**: Active (`https://apps.tupynambalucas.dev/webhooks/github`), cryptographically verified via constant-time HMAC-SHA256 (`X-Hub-Signature-256`).

> [!NOTE]
> Formal PR approvals authored by this identity carry GitHub's cryptographic **Verified** badge under `@tupynambalucas-org-guardian[bot]`.
