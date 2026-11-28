<!-- portal-summary: Automação local de desenvolvimento, extensões CLI (gh tl), agentes autônomos (Antigravity) e sincronização de branches de trabalho. -->
### Interactive Developer Tooling & Workstation Self-Service Identity

`tupynambalucas-developer-tools` is the Tier-3 developer enablement identity for `tupynambalucas-dev`, providing secure, passwordless OAuth Device-Flow authentication for developer workstations, internal CLI extensions (`gh-tl`), IDE tools, and local engineering workflows without static access tokens.

#### Core Responsibilities
- **OAuth Device-Flow Integration**: Authenticates engineers via `https://github.com/login/device` with auto-expiring 8-hour User Access Tokens (UAT) and automatic refresh rotation.
- **Zero Static Personal Access Tokens**: Eliminates high-risk classic and fine-grained PATs from developer workstations.
- **Workstation Verification & Onboarding**: Powers `gh tl onboard` and `gh tl verify` to validate local Git configuration, SSH commit signing keys, and repository remotes.
- **Interactive Developer Workflows**: Enables human-attributed Git branching, PR authoring, code review comments, and issue triage from terminal and IDE interfaces.

#### Custody & Security Architecture
- **Authentication**: Public OAuth Device-Flow client with zero server-side RSA private key (`.pem`) generated or distributed; CLI clients embed only the public `Client ID`.
- **Intersection of Rights**: Operates strictly within the intersection of the App permissions and the individual developer's team RBAC (`Effective Rights = App Scopes ∩ Team RBAC`).
- **Isolation & Custody**: Holds zero organization-level administrative scopes and cannot alter security rulesets, teams, or autonomous PR approvals; co-managed by `lead-architects` and `core-engineers` with instant per-workstation revocation.
- **Webhooks**: Disabled (`Active: false`) for interactive user-to-server workflows.

> [!NOTE]
> Commits and pull request reviews created through this identity are attributed to the individual developer's verified human username with `programmatic_access_type: GitHub App user-to-server token`.
