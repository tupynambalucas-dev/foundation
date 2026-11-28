import type { PortalEnv } from '../types';
import { upsertInfisicalSecrets } from '../infisical/client';
import { verifyCloudflareAccessJwt } from './access';
import { GITHUB_API_VERSION } from './jwt';
import { verifyPortalState } from './signature';

interface ManifestConversionResponse {
  id: number;
  slug: string;
  client_id: string;
  webhook_secret?: string;
  pem: string;
}

const TIER_SECRET_PATHS: Record<string, { prefix: string; path: string }> = {
  'org-manager': { prefix: 'ORG_MANAGER', path: '/governance' },
  automation: { prefix: 'AUTOMATION', path: '/delivery' },
  guardian: { prefix: 'GUARDIAN', path: '/protection' },
  'developer-tools': { prefix: 'DEVELOPER_TOOLS', path: '/workstation' },
};

function pemToBase64(pem: string): string {
  const bytes = new TextEncoder().encode(pem);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

/**
 * Handles GET /api/github/callback for serverless GitHub App Manifest Flow provisioning.
 * Validates Cloudflare Access JWT (when configured) and stateless HMAC CSRF state, converts the
 * manifest code via GitHub API, persists credentials directly to Infisical Cloud without logging
 * plaintext secrets, and redirects to the organization App installation page.
 */
export async function handleGitHubManifestCallback(
  request: Request,
  env: PortalEnv
): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (env.CF_ACCESS_TEAM_DOMAIN && env.CF_ACCESS_AUD) {
    const accessCheck = await verifyCloudflareAccessJwt(
      request.headers.get('Cf-Access-Jwt-Assertion'),
      env.CF_ACCESS_TEAM_DOMAIN,
      env.CF_ACCESS_AUD
    );
    if (!accessCheck.valid) {
      return Response.json({ error: accessCheck.reason || 'Access denied' }, { status: 403 });
    }
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const stateToken = url.searchParams.get('state');

  if (!code || !stateToken) {
    return Response.json({ error: 'Missing required code or state query parameter.' }, { status: 400 });
  }

  if (!env.PORTAL_STATE_SECRET) {
    return Response.json({ error: 'PORTAL_STATE_SECRET is not configured.' }, { status: 500 });
  }

  const statePayload = await verifyPortalState(stateToken, env.PORTAL_STATE_SECRET);
  if (!statePayload) {
    return Response.json({ error: 'Invalid or expired CSRF state token.' }, { status: 401 });
  }

  const tierSpec = TIER_SECRET_PATHS[statePayload.tier];
  if (!tierSpec) {
    return Response.json({ error: `Unsupported app tier: ${statePayload.tier}` }, { status: 400 });
  }

  const conversionRes = await fetch(
    `https://api.github.com/app-manifests/${encodeURIComponent(code)}/conversions`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
        'User-Agent': 'tupynambalucas-apps-portal/1.0',
      },
    }
  );

  if (!conversionRes.ok) {
    return Response.json(
      { error: `GitHub manifest conversion failed with HTTP ${conversionRes.status}.` },
      { status: 502 }
    );
  }

  const appData = (await conversionRes.json()) as ManifestConversionResponse;

  if (env.INFISICAL_CLIENT_ID && env.INFISICAL_CLIENT_SECRET && env.INFISICAL_PROJECT_ID) {
    const secretsToStore: Record<string, string> = {
      [`${tierSpec.prefix}_APP_ID`]: String(appData.id),
      [`${tierSpec.prefix}_APP_CLIENT_ID`]: appData.client_id,
      [`${tierSpec.prefix}_APP_PRIVATE_KEY_BASE64`]: pemToBase64(appData.pem),
    };
    if (appData.webhook_secret) {
      secretsToStore[`${tierSpec.prefix}_APP_WEBHOOK_SECRET`] = appData.webhook_secret;
    }

    for (const environment of ['dev', 'prod']) {
      await upsertInfisicalSecrets({
        apiUrl: env.INFISICAL_API_URL,
        clientId: env.INFISICAL_CLIENT_ID,
        clientSecret: env.INFISICAL_CLIENT_SECRET,
        projectId: env.INFISICAL_PROJECT_ID,
        environment,
        secretPath: tierSpec.path,
        secrets: secretsToStore,
      });
    }
  }

  const installUrl = `https://github.com/organizations/tupynambalucas-dev/settings/apps/${encodeURIComponent(appData.slug)}/installations`;
  return Response.redirect(installUrl, 302);
}
