const encoder = new TextEncoder();

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    return null;
  }
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(input: string): Uint8Array<ArrayBuffer> | null {
  try {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage
  );
}

/**
 * Constant-time verification of GitHub X-Hub-Signature-256 using Web Crypto HMAC-SHA256.
 */
export async function verifyGitHubWebhookSignature(
  rawBody: ArrayBuffer,
  signatureHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!signatureHeader || !secret || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  const sigBytes = hexToBytes(signatureHeader.slice('sha256='.length));
  if (!sigBytes || sigBytes.length !== 32) {
    return false;
  }
  const key = await importHmacKey(secret, ['verify']);
  return crypto.subtle.verify('HMAC', key, sigBytes, rawBody);
}

/**
 * Builds a deterministic Workflow instance ID compliant with Cloudflare Workflows limits:
 * max 100 chars, matching ^[a-zA-Z0-9_][a-zA-Z0-9-_]*$ (sanitizing dotfiles like .github).
 */
export function buildWorkflowInstanceId(
  repo: string,
  pullNumber: number,
  headSha: string,
  deliveryId: string
): string {
  const safeRepo = repo.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeSha = headSha.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const safeDelivery = deliveryId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 12);
  return `pr_${safeRepo}_${pullNumber}_${safeSha}_${safeDelivery}`.slice(0, 100);
}

export interface PortalStatePayload {
  tier: string;
  exp: number;
  nonce: string;
}

/**
 * Signs a stateless CSRF state token for the GitHub App Manifest Flow (10-minute default TTL).
 */
export async function signPortalState(
  tier: string,
  secret: string,
  ttlSeconds = 600,
  nowMs = Date.now()
): Promise<string> {
  const payload: PortalStatePayload = {
    tier,
    exp: Math.floor(nowMs / 1000) + ttlSeconds,
    nonce: crypto.randomUUID(),
  };
  const payloadB64 = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await importHmacKey(secret, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  return `${payloadB64}.${bytesToBase64Url(new Uint8Array(sig))}`;
}

/**
 * Verifies a stateless HMAC-SHA256 CSRF state token and its expiration timestamp.
 */
export async function verifyPortalState(
  stateToken: string | null,
  secret: string,
  nowMs = Date.now()
): Promise<PortalStatePayload | null> {
  if (!stateToken || !secret) {
    return null;
  }
  const parts = stateToken.split('.');
  if (parts.length !== 2) {
    return null;
  }
  const [payloadB64, sigB64] = parts;
  const sigBytes = base64UrlToBytes(sigB64);
  const payloadBytes = base64UrlToBytes(payloadB64);
  if (!sigBytes || !payloadBytes) {
    return null;
  }
  const key = await importHmacKey(secret, ['verify']);
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payloadB64));
  if (!valid) {
    return null;
  }
  try {
    const parsed = JSON.parse(new TextDecoder().decode(payloadBytes)) as PortalStatePayload;
    if (typeof parsed.tier !== 'string' || typeof parsed.exp !== 'number') {
      return null;
    }
    if (Math.floor(nowMs / 1000) > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
