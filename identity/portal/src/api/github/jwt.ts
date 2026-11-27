const encoder = new TextEncoder();

function base64UrlEncode(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? encoder.encode(input) : input;
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const normalized = base64.replace(/\s+/g, '');
  const binary = atob(normalized);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodeDerLength(len: number): Uint8Array<ArrayBuffer> {
  if (len < 128) {
    return new Uint8Array(new ArrayBuffer(1)).fill(len);
  }
  const bytes: number[] = [];
  let temp = len;
  while (temp > 0) {
    bytes.unshift(temp & 0xff);
    temp >>= 8;
  }
  const out = new Uint8Array(new ArrayBuffer(bytes.length + 1));
  out[0] = 0x80 | bytes.length;
  out.set(bytes, 1);
  return out;
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const out = new Uint8Array(new ArrayBuffer(total));
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

/**
 * Wraps a PKCS#1 RSAPrivateKey DER buffer in a PKCS#8 PrivateKeyInfo DER structure
 * so native GitHub App PEMs import directly via Web Crypto crypto.subtle.importKey('pkcs8', ...).
 */
export function wrapPkcs1ToPkcs8(pkcs1Der: Uint8Array): Uint8Array<ArrayBuffer> {
  const version = new Uint8Array([0x02, 0x01, 0x00]);
  const rsaAlgorithmIdentifier = new Uint8Array([
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
  ]);
  const privateKeyOctet = concatBytes(
    new Uint8Array([0x04]),
    encodeDerLength(pkcs1Der.length),
    pkcs1Der
  );
  const body = concatBytes(version, rsaAlgorithmIdentifier, privateKeyOctet);
  return concatBytes(new Uint8Array([0x30]), encodeDerLength(body.length), body);
}

/**
 * Imports either a base64-encoded PEM (PKCS#1 or PKCS#8) or raw PEM string into Web Crypto RS256 key.
 */
async function importGitHubAppPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
  const decodedText = new TextDecoder().decode(decodeBase64ToBytes(privateKeyBase64));
  const isPkcs1 = decodedText.includes('BEGIN RSA PRIVATE KEY');
  const pemBody = decodedText
    .replace(/-----BEGIN [A-Z ]+-----/g, '')
    .replace(/-----END [A-Z ]+-----/g, '')
    .replace(/\s+/g, '');

  const rawDer = decodeBase64ToBytes(pemBody);
  const pkcs8Der = isPkcs1 ? wrapPkcs1ToPkcs8(rawDer) : rawDer;

  return crypto.subtle.importKey(
    'pkcs8',
    pkcs8Der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/**
 * Generates a short-lived RS256 GitHub App JWT (valid for 9 minutes).
 */
export async function signGitHubAppJwt(
  appId: string,
  privateKeyBase64: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iat: nowSeconds - 60,
      exp: nowSeconds + 9 * 60,
      iss: appId,
    })
  );
  const signingInput = `${header}.${payload}`;
  const key = await importGitHubAppPrivateKey(privateKeyBase64);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(signingInput));
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export const GITHUB_API_VERSION = '2026-03-10';

/**
 * Mints a repository-scoped GitHub App Installation Access Token (1h TTL).
 */
export async function mintInstallationToken(params: {
  appId: string;
  installationId: string;
  privateKeyBase64: string;
  repositories: string[];
}): Promise<string> {
  const jwt = await signGitHubAppJwt(params.appId, params.privateKeyBase64);
  const response = await fetch(
    `https://api.github.com/app/installations/${params.installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
        'User-Agent': 'tupynambalucas-apps-portal/1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repositories: params.repositories,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to mint installation token (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error('GitHub installation token response did not include a token.');
  }
  return data.token;
}
