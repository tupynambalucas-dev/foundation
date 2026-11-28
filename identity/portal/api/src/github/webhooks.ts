import type { PortalEnv, PrGateParams } from '../types';
import { sendMagicLinkAlert } from '../notifications/magic-link';
import { buildWorkflowInstanceId, verifyGitHubWebhookSignature } from './signature';

const TRIGGER_PR_ACTIONS = new Set(['opened', 'synchronize', 'reopened', 'edited', 'ready_for_review']);
const ALLOWED_CHECK_CONCLUSIONS = new Set(['success', 'neutral', 'skipped']);

interface PullRequestWebhookPayload {
  action?: string;
  repository?: {
    name?: string;
    owner?: { login?: string };
  };
  pull_request?: {
    number?: number;
    draft?: boolean;
    title?: string;
    body?: string | null;
    head?: { sha?: string };
    user?: { login?: string };
  };
}

interface CheckWebhookPayload {
  action?: string;
  repository?: {
    name?: string;
    owner?: { login?: string };
  };
  check_suite?: {
    head_sha?: string;
    conclusion?: string | null;
    pull_requests?: Array<{ number?: number }>;
  };
  check_run?: {
    head_sha?: string;
    conclusion?: string | null;
    pull_requests?: Array<{ number?: number }>;
  };
}

interface InstallationWebhookPayload {
  action?: string;
  installation?: {
    id?: number;
    app_slug?: string;
  };
}

async function enqueuePrWorkflow(
  env: PortalEnv,
  params: PrGateParams
): Promise<{ status: number; body: Record<string, unknown> }> {
  const instanceId = buildWorkflowInstanceId(
    params.repo,
    params.pullNumber,
    params.headSha,
    params.deliveryId
  );

  try {
    const instance = await env.PR_GATE_WORKFLOW.create({
      id: instanceId,
      params,
    });
    return {
      status: 202,
      body: { accepted: true, instanceId: instance.id, repo: params.repo, pullNumber: params.pullNumber },
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes('(instance.already_exists)')) {
      return {
        status: 200,
        body: { accepted: true, duplicate: true, instanceId },
      };
    }
    throw err;
  }
}

/**
 * Handles POST /webhooks/github with strict constant-time HMAC-SHA256 verification.
 */
export async function handleGitHubWebhook(request: Request, env: PortalEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (!env.GITHUB_WEBHOOK_SECRET) {
    return Response.json({ error: 'GITHUB_WEBHOOK_SECRET is not configured.' }, { status: 500 });
  }

  const rawBody = await request.arrayBuffer();
  const signatureHeader = request.headers.get('X-Hub-Signature-256');
  const isValid = await verifyGitHubWebhookSignature(rawBody, signatureHeader, env.GITHUB_WEBHOOK_SECRET);

  if (!isValid) {
    return Response.json({ error: 'Invalid or missing X-Hub-Signature-256.' }, { status: 401 });
  }

  const eventType = request.headers.get('X-GitHub-Event') || 'unknown';
  const deliveryId = request.headers.get('X-GitHub-Delivery') || crypto.randomUUID();

  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (eventType === 'ping') {
    return Response.json({ ok: true, event: 'ping', deliveryId }, { status: 200 });
  }

  if (eventType === 'pull_request') {
    const prEvent = payload as PullRequestWebhookPayload;
    if (!prEvent.action || !TRIGGER_PR_ACTIONS.has(prEvent.action)) {
      return Response.json({ ignored: true, reason: `PR action '${prEvent.action || ''}' ignored.` }, { status: 200 });
    }
    const pr = prEvent.pull_request;
    const owner = prEvent.repository?.owner?.login;
    const repo = prEvent.repository?.name;
    if (!pr || pr.draft || !owner || !repo || !pr.number || !pr.head?.sha) {
      return Response.json({ ignored: true, reason: 'Draft PR or incomplete payload.' }, { status: 200 });
    }

    const result = await enqueuePrWorkflow(env, {
      owner,
      repo,
      pullNumber: pr.number,
      headSha: pr.head.sha,
      authorLogin: pr.user?.login || 'unknown',
      title: pr.title || '',
      body: pr.body || '',
      deliveryId,
    });
    return Response.json(result.body, { status: result.status });
  }

  if (eventType === 'check_suite' || eventType === 'check_run') {
    const checkEvent = payload as CheckWebhookPayload;
    const node = eventType === 'check_suite' ? checkEvent.check_suite : checkEvent.check_run;
    if (
      checkEvent.action !== 'completed' ||
      !node?.conclusion ||
      !ALLOWED_CHECK_CONCLUSIONS.has(node.conclusion)
    ) {
      return Response.json({ ignored: true, reason: 'Check not completed with passing conclusion.' }, { status: 200 });
    }
    return Response.json(
      {
        accepted: true,
        event: eventType,
        deliveryId,
        headSha: node.head_sha,
        pullRequests: (node.pull_requests || []).map((p) => p.number).filter(Boolean),
      },
      { status: 202 }
    );
  }

  if (eventType === 'installation' || eventType === 'installation_repositories') {
    const instEvent = payload as InstallationWebhookPayload;
    await sendMagicLinkAlert(env.ALERT_WEBHOOK_URL, {
      title: `GitHub App ${instEvent.installation?.app_slug || 'unknown'} (${instEvent.action || 'updated'})`,
      summary: `Installation ID ${instEvent.installation?.id || 'n/a'} triggered '${eventType}.${instEvent.action || ''}'.`,
      actionUrl: 'https://github.com/organizations/tupynambalucas-dev/settings/installations',
      event: eventType,
    });
    return Response.json({ accepted: true, event: eventType, deliveryId }, { status: 202 });
  }

  return Response.json({ ignored: true, event: eventType, deliveryId }, { status: 200 });
}
