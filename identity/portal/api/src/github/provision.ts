import {
  GITHUB_MANIFESTS_BY_SLUG,
  GITHUB_ORG_SLUG,
} from '@tupynambalucas-dev/identity-portal-core';
import type { PortalEnv } from '../types';
import { verifyCloudflareAccessJwt } from './access';
import { signPortalState } from './signature';

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Handles GET /api/github/provision?tier=<tier> for serverless GitHub App Manifest Flow initiation.
 * Protected by Cloudflare Access Zero Trust (/api/github/*) and stateless HMAC CSRF state.
 * Renders an auto-submitting HTML form posting the authoritative manifest JSON to GitHub.
 */
export async function handleGitHubManifestProvision(
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
  const tier = (url.searchParams.get('tier') || '').trim();
  const manifest = GITHUB_MANIFESTS_BY_SLUG[tier];

  if (!manifest) {
    return Response.json(
      {
        error: `Unsupported or missing app tier '${tier}'. Allowed: ${Object.keys(GITHUB_MANIFESTS_BY_SLUG).join(', ')}.`,
      },
      { status: 400 }
    );
  }

  if (!env.PORTAL_STATE_SECRET) {
    return Response.json({ error: 'PORTAL_STATE_SECRET is not configured.' }, { status: 500 });
  }

  const stateToken = await signPortalState(tier, env.PORTAL_STATE_SECRET);
  const targetUrl = `https://github.com/organizations/${GITHUB_ORG_SLUG}/settings/apps/new?state=${encodeURIComponent(stateToken)}`;
  const manifestJson = escapeHtmlAttr(JSON.stringify(manifest));
  const appName = escapeHtmlAttr(String(manifest.name || tier));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Provision ${appName} | tupynambalucas.dev</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 2rem; max-width: 480px; text-align: center; }
    button { background: #2563eb; color: #fff; border: 0; border-radius: 8px; padding: 0.75rem 1.25rem; font-size: 0.95rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>GitHub App Manifest Flow</h2>
    <p>Redirecting to GitHub to provision <strong>${appName}</strong> in organization <code>${GITHUB_ORG_SLUG}</code>.</p>
    <form id="manifest-form" method="post" action="${escapeHtmlAttr(targetUrl)}">
      <input type="hidden" name="manifest" value="${manifestJson}" />
      <button type="submit">Continue to GitHub</button>
    </form>
  </div>
  <script>document.getElementById('manifest-form').submit();</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
