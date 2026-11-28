export const GITHUB_ORG_SLUG = 'tupynambalucas-dev';

export const PORTAL_API_ROUTES = {
  health: '/api/health',
  appsStatus: '/api/apps/status',
  githubProvision: '/api/github/provision',
  githubCallback: '/api/github/callback',
  githubWebhook: '/webhooks/github',
} as const;

export interface IGitHubAppTierSpec {
  slug: 'org-manager' | 'automation' | 'guardian' | 'developer-tools';
  name: string;
}

export const GITHUB_APP_TIERS: readonly IGitHubAppTierSpec[] = [
  { slug: 'org-manager', name: 'tupynambalucas-org-manager' },
  { slug: 'automation', name: 'tupynambalucas-automation' },
  { slug: 'guardian', name: 'tupynambalucas-guardian' },
  { slug: 'developer-tools', name: 'tupynambalucas-developer-tools' },
] as const;
