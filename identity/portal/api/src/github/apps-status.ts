import {
  GITHUB_APP_TIERS,
  type IAppLiveStatus,
  type IAppsStatusResponse,
} from '@tupynambalucas-dev/identity-portal-core';
import type { PortalEnv } from '../types';
import { GITHUB_API_VERSION, mintInstallationToken } from './jwt';

const CACHE_TTL_SECONDS = 60;

interface PublicGitHubAppResponse {
  id?: number;
  html_url?: string;
}

/**
 * Queries GitHub's /apps/{slug} endpoint for a single tier.
 * Uses an ephemeral Guardian Installation Access Token when configured so private org apps
 * (public: false) return HTTP 200 with their live App ID instead of HTTP 404.
 */
async function probeGitHubApp(
  slug: string,
  name: string,
  checkedAt: string,
  authToken: string | null,
  fetcher: typeof fetch
): Promise<IAppLiveStatus> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      'User-Agent': 'tupynambalucas-apps-portal/1.0',
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const res = await fetcher(`https://api.github.com/apps/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers,
    });

    if (res.status === 200) {
      const data = (await res.json()) as PublicGitHubAppResponse;
      return {
        slug,
        name,
        provisioned: Boolean(data.id),
        appId: data.id ? String(data.id) : null,
        htmlUrl: data.html_url || null,
        checkedAt,
      };
    }

    if (res.status === 404) {
      return {
        slug,
        name,
        provisioned: false,
        appId: null,
        htmlUrl: null,
        checkedAt,
      };
    }
  } catch {
    // Fall through to unprovisioned fallback on transient error
  }

  return {
    slug,
    name,
    provisioned: false,
    appId: null,
    htmlUrl: null,
    checkedAt,
  };
}

/**
 * Handles GET /api/apps/status returning live provisioning status for all 4 organizational GitHub Apps.
 * Applies 60-second Cloudflare edge caching via caches.default.
 */
export async function handleAppsStatus(
  request: Request,
  env?: PortalEnv,
  fetcher: typeof fetch = fetch
): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const edgeCache = typeof caches !== 'undefined' ? (caches as unknown as { default?: Cache }).default : undefined;
  const cacheKey = new Request(request.url, { method: 'GET' });

  if (edgeCache) {
    const cached = await edgeCache.match(cacheKey);
    if (cached) {
      return cached;
    }
  }

  let authToken: string | null = null;
  if (
    env?.GUARDIAN_APP_ID &&
    env?.GUARDIAN_APP_INSTALLATION_ID &&
    env?.GUARDIAN_APP_PRIVATE_KEY_BASE64
  ) {
    try {
      authToken = await mintInstallationToken({
        appId: env.GUARDIAN_APP_ID,
        installationId: env.GUARDIAN_APP_INSTALLATION_ID,
        privateKeyBase64: env.GUARDIAN_APP_PRIVATE_KEY_BASE64,
        repositories: ['foundation'],
      });
    } catch {
      authToken = null;
    }
  }

  const checkedAt = new Date().toISOString();
  const apps = await Promise.all(
    GITHUB_APP_TIERS.map((tier) => probeGitHubApp(tier.slug, tier.name, checkedAt, authToken, fetcher))
  );

  const payload: IAppsStatusResponse = { checkedAt, apps };
  const response = new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}, s-maxage=${CACHE_TTL_SECONDS}`,
    },
  });

  if (edgeCache) {
    await edgeCache.put(cacheKey, response.clone());
  }

  return response;
}
