# Machine Identities, Token Broker & Cloudflare Portal (`@tupynambalucas-dev/foundation/identity`)

This bounded context consolidates sovereign machine identity governance, automated token vending, legal compliance policies, and public edge deployment across the `tupynambalucas-dev` organization.

## Subsystems

- **`compliance/`**: Corporate privacy policies and terms of service satisfying Google OAuth Brand Verification and API Services User Data Policy.
- **`apps/github/`**: Declarative manifests for the 3-Tier GitHub Apps architecture (`org-manager`, `ci-bot`, `developer-tools`).
- **`apps/gcloud/`**: Google Cloud OAuth and Service Account specifications (`drive-rclone`, `workspace-automation`).
- **`portal/`**: Cloudflare Workers with Static Assets serverless application serving `https://apps.tupynambalucas.dev`.
- **`broker/`**: Token Broker vending machine daemon issuing short-lived, least-privilege GitHub installation tokens.
