import { handleGitHubManifestCallback } from './api/github/callback';
import { handleGitHubWebhook } from './api/github/webhooks';
import type { PortalEnv } from './api/types';

export { PrGateEvaluatorWorkflow } from './api/workflows/pr-gate-evaluator';

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

    if (url.pathname === '/api/health') {
      return applySecurityHeaders(
        Response.json({
          status: 'ok',
          service: 'tupynambalucas-apps-portal',
          workflowsBound: Boolean(env.PR_GATE_WORKFLOW),
        })
      );
    }

    if (url.pathname === '/webhooks/github') {
      const res = await handleGitHubWebhook(request, env);
      return applySecurityHeaders(res);
    }

    if (url.pathname === '/api/github/callback') {
      const res = await handleGitHubManifestCallback(request, env);
      return applySecurityHeaders(res);
    }

    // Fallback to static SPA assets (public/_headers applies on direct edge hits)
    const assetResponse = await env.ASSETS.fetch(request);
    return applySecurityHeaders(assetResponse);
  },
};
