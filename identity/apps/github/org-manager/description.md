<!-- portal-summary: Gestão organizacional soberana, auditoria de segurança corporativa, RBAC, branch protection rulesets e sincronização de times. -->
### Sovereign Organizational Governance & Machine Identity Operator

`tupynambalucas-org-manager` is the Tier-1 executive machine identity for `tupynambalucas-dev`, providing automated organizational governance, team RBAC orchestration, ruleset administration, and package lifecycle management.

#### Core Responsibilities
- **RBAC & Team Administration**: Programmatic management of functional teams (`lead-architects`, `security-managers`, `infra-ops`, `core-engineers`) and organization role assignments.
- **Rulesets & Protection**: Enforcement of branch protection rulesets, release tag protection policies, and Break-Glass governance.
- **App & Identity Auditing**: Declarative drift detection across the 4-Tier GitHub App suite via `@tupynambalucas-dev/mcp-github-governance`.
- **Package Governance**: Administrative cleanup and visibility governance on GitHub Packages (`npm.pkg.github.com`).
- **Secrets & Token Governance**: Centralized management of organization secrets and variables.

#### Custody & Security Architecture
- **Authentication**: Headless Server-to-Server via 2048-bit RSA Private Key (`.pem`) minting 60-minute downscoped Installation Access Tokens via the Go Token Broker.
- **Custody**: Strictly restricted to the Organization Owner (`@tupynambalucas-dev`) and `lead-architects`.
- **Vaulting**: Vaulted in Infisical Cloud (`/governance/`) and scoped GitHub Organization Secrets (`.github`, `org`, `foundation`).
- **Webhooks**: Disabled (`Active: false`) for outbound-only on-demand governance operations.

> [!NOTE]
> Automated operations authored by this machine identity carry GitHub's official **Verified** badge under `@tupynambalucas-org-manager[bot]`.
