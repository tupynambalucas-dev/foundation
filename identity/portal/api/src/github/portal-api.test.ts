import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { PortalEnv, PrGateParams } from '../types';
import { handleAppsStatus } from './apps-status';
import { handleGitHubManifestCallback } from './callback';
import { handleGitHubManifestProvision } from './provision';
import {
  evaluateBotFileConfinement,
  evaluateRbacGate,
  evaluateSemanticGate,
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
  it('enforces Gate 3 RBAC allowlist and blocks external contractors', () => {
    assert.equal(evaluateRbacGate('tupynambalucas').passed, true);
    assert.equal(evaluateRbacGate('tupynambalucas-automation[bot]').passed, true);
    assert.equal(evaluateRbacGate('external-contractor').passed, false);
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
    assert.equal(
      evaluateBotFileConfinement('tupynambalucas-automation[bot]', [
        'CHANGELOG.md',
        'package.json',
        '.release-please-manifest.json',
      ]).passed,
      true
    );
    assert.equal(
      evaluateBotFileConfinement('tupynambalucas-automation[bot]', [
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
      new Request('https://apps.tupynambalucas.dev/api/github/provision?tier=guardian'),
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
      new Request('https://apps.tupynambalucas.dev/api/github/provision?tier=guardian'),
      envNoAccess
    );
    assert.equal(okRes.status, 200);
    assert.match(okRes.headers.get('Content-Type') || '', /text\/html/);
    const html = await okRes.text();
    assert.match(html, /https:\/\/github\.com\/organizations\/tupynambalucas-dev\/settings\/apps\/new\?state=/);
    assert.match(html, /tupynambalucas-guardian/);
    assert.match(html, /https:\/\/apps\.tupynambalucas\.dev\/api\/github\/callback/);
  });

  it('returns live provisioned and pending states from GET /api/apps/status', async () => {
    const mockFetch: typeof fetch = async (input) => {
      const url = String(input);
      if (url.endsWith('/tupynambalucas-guardian')) {
        return new Response(JSON.stringify({ id: 5959745, html_url: 'https://github.com/apps/tupynambalucas-guardian' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.endsWith('/tupynambalucas-automation')) {
        return new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 });
      }
      return new Response(JSON.stringify({ id: 5648756, html_url: 'https://github.com/apps/tupynambalucas-org-manager' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const res = await handleAppsStatus(
      new Request('https://apps.tupynambalucas.dev/api/apps/status'),
      mockFetch
    );
    assert.equal(res.status, 200);
    assert.match(res.headers.get('Cache-Control') || '', /max-age=60/);
    const data = (await res.json()) as { apps: Array<{ slug: string; provisioned: boolean; appId: string | null }> };
    const guardian = data.apps.find((a) => a.slug === 'guardian');
    const automation = data.apps.find((a) => a.slug === 'automation');
    assert.equal(guardian?.provisioned, true);
    assert.equal(guardian?.appId, '5959745');
    assert.equal(automation?.provisioned, false);
    assert.equal(automation?.appId, null);
  });
});
