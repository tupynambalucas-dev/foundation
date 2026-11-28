import { PORTAL_API_ROUTES } from '@tupynambalucas-dev/identity-portal-core';
import { handleAppsStatus } from './github/apps-status';
import { handleGitHubManifestCallback } from './github/callback';
import { handleGitHubManifestProvision } from './github/provision';
import { handleGitHubWebhook } from './github/webhooks';
import type { PortalEnv } from './types';

export { PrGateEvaluatorWorkflow } from './workflows/pr-gate-evaluator';

function applySecurityHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  newHeaders.set('Permissions-Policy', 'interest-cohort=()');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: PortalEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === PORTAL_API_ROUTES.health) {
      return applySecurityHeaders(
        Response.json({
          status: 'ok',
          service: 'tupynambalucas-apps-portal',
          workflowsBound: Boolean(env.PR_GATE_WORKFLOW),
        })
      );
    }

    if (url.pathname === PORTAL_API_ROUTES.appsStatus) {
      const res = await handleAppsStatus(request, env);
      return applySecurityHeaders(res);
    }

    if (url.pathname === PORTAL_API_ROUTES.githubWebhook) {
      const res = await handleGitHubWebhook(request, env);
      return applySecurityHeaders(res);
    }

    if (url.pathname === PORTAL_API_ROUTES.githubProvision) {
      const res = await handleGitHubManifestProvision(request, env);
      return applySecurityHeaders(res);
    }

    if (url.pathname === PORTAL_API_ROUTES.githubCallback) {
      const res = await handleGitHubManifestCallback(request, env);
      return applySecurityHeaders(res);
    }

    // Fallback to static SPA assets built by identity/portal/web (../web/dist)
    const assetResponse = await env.ASSETS.fetch(request);
    return applySecurityHeaders(assetResponse);
  },
};
