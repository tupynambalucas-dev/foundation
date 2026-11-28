<!-- portal-summary: Plano de Execução e Entrega de CI/CD, execução de testes herméticos, empacotamento de containers e abertura automatizada de PRs de release. -->
### Autonomous CI/CD Delivery & Release Automation Identity

`tupynambalucas-org-automation` is the Tier-2A headless execution and delivery identity for `tupynambalucas-dev`, driving continuous integration, automated releases, package publishing, and build attestations across all sovereign repositories.

#### Core Responsibilities
- **Release Orchestration**: Managing Release Please Manifest Mode and `git-cliff` pull requests, version tags, and Docusaurus-formatted changelogs.
- **Package Publishing**: Automated publishing of workspace packages to GitHub Packages (`npm.pkg.github.com`) with Sigstore/SLSA provenance attestations.
- **Continuous Integration**: Publishing check runs, commit statuses, and automated build/test annotations via `@tupynambalucas-dev/mcp-github-delivery`.
- **Binary Releases**: Compiling, tagging, and distributing multi-platform release binaries for `gh-tl`.
- **Documentation Localization**: Synchronizing Crowdin translation pull requests and previews for `docs`.

#### Custody & Security Architecture
- **Authentication**: Server-to-Server downscoped Installation Access Tokens (IAT) minted on demand via the Go Token Broker and ephemeral GitHub Actions runners.
- **Separation of Duties**: Strictly isolated from organization administration, ruleset modification, and Pull Request approval (delegated to Tier-2B `tupynambalucas-org-guardian`).
- **Custody**: Co-managed by `lead-architects` and `infra-ops`.
- **Webhooks**: Disabled (`Active: false`) for outbound-only execution workflows.

> [!NOTE]
> Routine CI/CD commits and release tags authored by this identity carry GitHub's cryptographic **Verified** badge under `@tupynambalucas-org-automation[bot]`.
