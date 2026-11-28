import {
  GITHUB_APP_TIERS,
  type IAppLiveStatus,
  type IAppsStatusResponse,
} from '@tupynambalucas-dev/identity-portal-core';
import { GITHUB_API_VERSION } from './jwt';

const CACHE_TTL_SECONDS = 60;

interface PublicGitHubAppResponse {
  id?: number;
  html_url?: string;
}

/**
 * Queries GitHub's public /apps/{slug} endpoint for a single tier.
 * Returns provisioned=true with live App ID on HTTP 200, or provisioned=false on HTTP 404.
 */
async function probePublicGitHubApp(
  slug: string,
  name: string,
  checkedAt: string,
  fetcher: typeof fetch
): Promise<IAppLiveStatus> {
  try {
    const res = await fetcher(`https://api.github.com/apps/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
        'User-Agent': 'tupynambalucas-apps-portal/1.0',
      },
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
    // Fall through to unknown/unprovisioned fallback on transient error
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
 * Applies 60-second Cloudflare edge caching via caches.default to protect GitHub's public API rate limit.
 */
export async function handleAppsStatus(
  request: Request,
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

  const checkedAt = new Date().toISOString();
  const apps = await Promise.all(
    GITHUB_APP_TIERS.map((tier) => probePublicGitHubApp(tier.slug, tier.name, checkedAt, fetcher))
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
