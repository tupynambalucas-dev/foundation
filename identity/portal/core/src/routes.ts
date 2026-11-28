export type { IGitHubAppTierSpec } from './schemas/app.schema';

export const GITHUB_ORG_SLUG = 'tupynambalucas-dev';

export const PORTAL_API_ROUTES = {
  health: '/api/health',
  appsStatus: '/api/apps/status',
  githubProvision: '/api/github/provision',
  githubCallback: '/api/github/callback',
  githubWebhook: '/webhooks/github',
} as const;
