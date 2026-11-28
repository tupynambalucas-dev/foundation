import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AUTHORIZED_BOT_LOGINS,
  AUTHORIZED_BOT_USER_IDS,
  GITHUB_APP_TIERS,
  GITHUB_MANIFESTS_BY_SLUG,
  GUARDIAN_BOT_USER_IDS,
  PORTAL_APPS_CATALOG,
} from '@tupynambalucas-dev/identity-portal-core';
import type { PortalEnv, PrGateParams } from '../types';
import { handleAppsStatus } from './apps-status';
import { handleGitHubManifestCallback } from './callback';
import { handleGitHubManifestProvision } from './provision';
import {
  evaluateBotFileConfinement,
  evaluateRbacGate,
  evaluateSemanticGate,
  isBotAuthor,
} from './gates';
import {
  buildWorkflowInstanceId,
  signPortalState,
  verifyGitHubWebhookSignature,
  verifyPortalState,
} from './signature';
import { handleGitHubWebhook } from './webhooks';

async function computeHmacHeader(body: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256=${hex}`;
}

function createMockEnv(overrides: Partial<PortalEnv> = {}): PortalEnv {
  return {
    ASSETS: {
      fetch: async () => new Response('ok'),
    } as unknown as Fetcher,
    PR_GATE_WORKFLOW: {
      create: async (opts?: { id?: string; params?: PrGateParams }) => ({
        id: opts?.id || 'mock-id',
      }),
    } as unknown as Workflow<PrGateParams>,
    GITHUB_WEBHOOK_SECRET: 'test-webhook-secret-32-bytes-minimum',
    PORTAL_STATE_SECRET: 'test-portal-state-secret-32-bytes',
    ...overrides,
  };
}

describe('Cloudflare Portal Signature & Workflow Instance ID', () => {
  it('accepts valid HMAC-SHA256 webhook signature and rejects tampered/missing signatures', async () => {
    const secret = 'super-secret-hmac-key';
    const body = JSON.stringify({ zen: 'enterprise-determinism' });
    const raw = new TextEncoder().encode(body).buffer;
    const validSig = await computeHmacHeader(body, secret);

    assert.equal(await verifyGitHubWebhookSignature(raw, validSig, secret), true);
    assert.equal(await verifyGitHubWebhookSignature(raw, 'sha256=deadbeef', secret), false);
    assert.equal(await verifyGitHubWebhookSignature(raw, null, secret), false);
    assert.equal(
      await verifyGitHubWebhookSignature(new TextEncoder().encode('tampered').buffer, validSig, secret),
      false
    );
  });

  it('sanitizes dotfiles (.github, .github-private) to comply with Cloudflare Workflows ID regex', () => {
    const regex = /^[a-zA-Z0-9_][a-zA-Z0-9-_]*$/;
    const id1 = buildWorkflowInstanceId('.github', 42, 'abcdef1234567890', 'deliv-123456789');
    const id2 = buildWorkflowInstanceId('.github-private', 7, '1234567890abcdef', 'deliv-987654321');
    const longId = buildWorkflowInstanceId('a'.repeat(120), 999, 'abcdef123456', 'deliv-123456');

    assert.match(id1, regex);
    assert.match(id2, regex);
    assert.match(longId, regex);
    assert.ok(id1.length <= 100);
    assert.ok(id2.length <= 100);
    assert.ok(longId.length <= 100);
    assert.ok(!id1.includes('.'));
    assert.ok(!id2.includes('.'));
  });

  it('signs, verifies, and expires stateless CSRF portal state tokens', async () => {
    const secret = 'csrf-state-secret';
    const now = 1_800_000_000_000;
    const token = await signPortalState('guardian', secret, 600, now);

    const ok = await verifyPortalState(token, secret, now + 30_000);
    assert.equal(ok?.tier, 'guardian');

    const expired = await verifyPortalState(token, secret, now + 700_000);
    assert.equal(expired, null);

    const tampered = await verifyPortalState(`${token}x`, secret, now + 30_000);
    assert.equal(tampered, null);
  });
});

describe('7-Gate Pure Quality Evaluators', () => {
  it('enforces Gate 3 RBAC allowlist by immutable ID and SSOT login, blocking external contractors', () => {
    const automationBotLogin = AUTHORIZED_BOT_LOGINS.find((l) => l !== 'dependabot[bot]')!;
    assert.equal(evaluateRbacGate('tupynambalucas', 53620332).passed, true);
    assert.equal(evaluateRbacGate(automationBotLogin).passed, true);
    assert.equal(evaluateRbacGate('any-renamed-future-name[bot]', 353557933).passed, true);
    assert.equal(isBotAuthor('any-renamed-future-name', 'Bot', 353557933), true);
    assert.equal(evaluateRbacGate('external-contractor', 99999999).passed, false);
  });

  it('enforces Gate 5 Conventional Commits and Zero-Emoji invariant', () => {
    assert.equal(
      evaluateSemanticGate('feat(portal): add workflows webhook', 'Clean description', ['feat(portal): init']).passed,
      true
    );
    assert.equal(
      evaluateSemanticGate('Update stuff without prefix', 'Clean description', []).passed,
      false
    );
    assert.equal(
      evaluateSemanticGate(`feat(portal): launch \u{1F680}`, 'Clean', []).passed,
      false
    );
    assert.equal(
      evaluateSemanticGate('feat(portal): clean title', 'Clean', [`fix: patch \u{1F41B}`]).passed,
      false
    );
  });

  it('enforces Gate 7 bot file confinement allowlist', () => {
    const automationBotLogin = AUTHORIZED_BOT_LOGINS.find((l) => l !== 'dependabot[bot]')!;
    assert.equal(
      evaluateBotFileConfinement(automationBotLogin, [
        'CHANGELOG.md',
        'package.json',
        '.release-please-manifest.json',
      ]).passed,
      true
    );
    assert.equal(
      evaluateBotFileConfinement(automationBotLogin, [
        'CHANGELOG.md',
        'src/worker.ts',
      ]).passed,
      false
    );
    assert.equal(
      evaluateBotFileConfinement('tupynambalucas', ['src/worker.ts']).passed,
      true
    );
  });
});

describe('HTTP Handlers (Webhooks & Manifest Callback)', () => {
  it('rejects unsigned POST /webhooks/github with HTTP 401 and accepts signed pull_request with HTTP 202', async () => {
    const env = createMockEnv();
    const unsignedReq = new Request('https://apps.tupynambalucas.dev/webhooks/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zen: 'probe' }),
    });
    const unsignedRes = await handleGitHubWebhook(unsignedReq, env);
    assert.equal(unsignedRes.status, 401);

    const prBody = JSON.stringify({
      action: 'opened',
      repository: { name: '.github', owner: { login: 'tupynambalucas-dev' } },
      pull_request: {
        number: 15,
        draft: false,
        title: 'chore(governance): update ruleset docs',
        body: 'Clean PR body',
        head: { sha: 'abcdef1234567890abcdef1234567890abcdef12' },
        user: { login: 'tupynambalucas' },
      },
    });
    const sig = await computeHmacHeader(prBody, env.GITHUB_WEBHOOK_SECRET!);
    const signedReq = new Request('https://apps.tupynambalucas.dev/webhooks/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': sig,
        'X-GitHub-Event': 'pull_request',
        'X-GitHub-Delivery': '11111111-2222-3333-4444-555555555555',
      },
      body: prBody,
    });
    const signedRes = await handleGitHubWebhook(signedReq, env);
    assert.equal(signedRes.status, 202);
    const json = (await signedRes.json()) as { accepted: boolean; instanceId: string };
    assert.equal(json.accepted, true);
    assert.match(json.instanceId, /^pr__github_15_/);
  });

  it('handles duplicate Workflow instance IDs idempotently with HTTP 200', async () => {
    const env = createMockEnv({
      PR_GATE_WORKFLOW: {
        create: async () => {
          throw new Error('Workflow creation failed (instance.already_exists)');
        },
      } as unknown as Workflow<PrGateParams>,
    });

    const prBody = JSON.stringify({
      action: 'synchronize',
      repository: { name: 'foundation', owner: { login: 'tupynambalucas-dev' } },
      pull_request: {
        number: 30,
        draft: false,
        title: 'feat(portal): add workflows',
        body: '',
        head: { sha: '1234567890abcdef1234567890abcdef12345678' },
        user: { login: 'tupynambalucas' },
      },
    });
    const sig = await computeHmacHeader(prBody, env.GITHUB_WEBHOOK_SECRET!);
    const req = new Request('https://apps.tupynambalucas.dev/webhooks/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': sig,
        'X-GitHub-Event': 'pull_request',
        'X-GitHub-Delivery': 'dup-delivery-1',
      },
      body: prBody,
    });
    const res = await handleGitHubWebhook(req, env);
    assert.equal(res.status, 200);
    const json = (await res.json()) as { duplicate: boolean };
    assert.equal(json.duplicate, true);
  });

  it('enforces Cloudflare Access header and CSRF state in GET /api/github/callback', async () => {
    const envWithAccess = createMockEnv({
      CF_ACCESS_TEAM_DOMAIN: 'tupynambalucas.cloudflareaccess.com',
      CF_ACCESS_AUD: 'test-aud-tag',
    });
    const noAccessRes = await handleGitHubManifestCallback(
      new Request('https://apps.tupynambalucas.dev/api/github/callback?code=abc&state=xyz'),
      envWithAccess
    );
    assert.equal(noAccessRes.status, 403);

    const envNoAccess = createMockEnv();
    const badStateRes = await handleGitHubManifestCallback(
      new Request('https://apps.tupynambalucas.dev/api/github/callback?code=abc&state=invalid'),
      envNoAccess
    );
    assert.equal(badStateRes.status, 401);
  });

  it('enforces Cloudflare Access and renders auto-submit manifest form in GET /api/github/provision', async () => {
    const envWithAccess = createMockEnv({
      CF_ACCESS_TEAM_DOMAIN: 'tupynambalucas.cloudflareaccess.com',
      CF_ACCESS_AUD: 'test-aud-tag',
    });
    const noAccessRes = await handleGitHubManifestProvision(
      new Request('https://apps.tupynambalucas.dev/api/github/provision?tier=org-guardian'),
      envWithAccess
    );
    assert.equal(noAccessRes.status, 403);

    const envNoAccess = createMockEnv();
    const invalidTierRes = await handleGitHubManifestProvision(
      new Request('https://apps.tupynambalucas.dev/api/github/provision?tier=unknown'),
      envNoAccess
    );
    assert.equal(invalidTierRes.status, 400);

    const okRes = await handleGitHubManifestProvision(
      new Request('https://apps.tupynambalucas.dev/api/github/provision?tier=org-guardian'),
      envNoAccess
    );
    assert.equal(okRes.status, 200);
    assert.match(okRes.headers.get('Content-Type') || '', /text\/html/);
    const html = await okRes.text();
    assert.match(html, /https:\/\/github\.com\/organizations\/tupynambalucas-dev\/settings\/apps\/new\?state=/);
    assert.match(html, /tupynambalucas-org-guardian/);
    assert.match(html, /https:\/\/apps\.tupynambalucas\.dev\/api\/github\/callback/);
  });

  it('returns live provisioned and pending states from GET /api/apps/status', async () => {
    const mockFetch: typeof fetch = async (input) => {
      const url = String(input);
      if (url.endsWith('/tupynambalucas-org-guardian')) {
        return new Response(JSON.stringify({ id: 5959745, html_url: 'https://github.com/apps/tupynambalucas-org-guardian' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.endsWith('/tupynambalucas-org-automation')) {
        return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ id: 5648756, html_url: 'https://github.com/apps/tupynambalucas-org-manager' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const res = await handleAppsStatus(
      new Request('https://apps.tupynambalucas.dev/api/apps/status'),
      undefined,
      mockFetch
    );
    assert.equal(res.status, 200);
    assert.match(res.headers.get('Cache-Control') || '', /max-age=60/);
    const data = (await res.json()) as { apps: Array<{ slug: string; provisioned: boolean; appId: string | null }> };
    const guardian = data.apps.find((a) => a.slug === 'org-guardian');
    const automation = data.apps.find((a) => a.slug === 'org-automation');
    assert.equal(guardian?.provisioned, true);
    assert.equal(guardian?.appId, '5959745');
    assert.equal(automation?.provisioned, false);
    assert.equal(automation?.appId, null);
  });

  it('auto-discovers all GitHub and Google apps with accurate manifest scopes, immutable IDs, and pure GitHub projection', () => {
    assert.equal(GITHUB_APP_TIERS.length, 4);
    assert.equal(Object.keys(GITHUB_MANIFESTS_BY_SLUG).length, GITHUB_APP_TIERS.length);
    assert.ok(AUTHORIZED_BOT_USER_IDS.includes(353557933));
    assert.ok(GUARDIAN_BOT_USER_IDS.includes(362146655));

    const guardianTier = GITHUB_APP_TIERS.find((t) => t.slug === 'org-guardian');
    assert.equal(guardianTier?.name, 'tupynambalucas-org-guardian');
    assert.equal(guardianTier?.secretPrefix, 'GUARDIAN');
    assert.equal(guardianTier?.infisicalPath, '/protection');
    assert.equal(guardianTier?.botUserId, 362146655);

    const guardianCatalog = PORTAL_APPS_CATALOG.find((a) => a.slug === 'org-guardian');
    assert.equal(guardianCatalog?.landingUrl, '/apps/org-guardian');
    assert.ok(guardianCatalog?.scopes.includes('contents:write'));
    assert.ok(!guardianCatalog?.scopes.includes('contents:read'));

    const gcloudApps = PORTAL_APPS_CATALOG.filter((a) => a.provider !== 'github');
    assert.equal(gcloudApps.length, 1);
    assert.equal(gcloudApps[0]?.slug, 'org-workspace');
    assert.equal(gcloudApps[0]?.landingUrl, '/apps/org-workspace');
    assert.ok(gcloudApps[0]?.scopes.includes('https://www.googleapis.com/auth/drive'));
    assert.ok(gcloudApps[0]?.scopes.includes('https://www.googleapis.com/auth/spreadsheets'));

    for (const manifest of Object.values(GITHUB_MANIFESTS_BY_SLUG)) {
      assert.equal('portal' in manifest, false);
      assert.equal('provider' in manifest, false);
      assert.equal(typeof manifest.description, 'string');
      assert.ok(String(manifest.description).includes('###'));
      const perms = (manifest.default_permissions || {}) as Record<string, string>;
      const events = (manifest.default_events || []) as string[];
      assert.equal('team_discussions' in perms, false);
      assert.equal(events.includes('installation'), false);
      assert.equal(events.includes('installation_repositories'), false);
    }
  });
});
