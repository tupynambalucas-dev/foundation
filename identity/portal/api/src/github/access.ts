interface JwkKey {
  kid?: string;
  kty: string;
  n?: string;
  e?: string;
  alg?: string;
}

interface AccessJwtPayload {
  aud?: string[] | string;
  email?: string;
  exp?: number;
  nbf?: number;
  iss?: string;
}

function base64UrlToUint8Array(input: string): Uint8Array<ArrayBuffer> {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Defense-in-depth verification of Cf-Access-Jwt-Assertion header against Cloudflare Access JWKS.
 * Required because Workers with Static Assets do not expose ctx.access.
 */
export async function verifyCloudflareAccessJwt(
  jwtHeader: string | null,
  teamDomain: string,
  expectedAud: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): Promise<{ valid: boolean; email?: string; reason?: string }> {
  if (!jwtHeader) {
    return { valid: false, reason: 'Missing Cf-Access-Jwt-Assertion header.' };
  }

  const parts = jwtHeader.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'Malformed Cloudflare Access JWT.' };
  }

  const [headerB64, payloadB64, sigB64] = parts;
  let header: { kid?: string; alg?: string };
  let payload: AccessJwtPayload;
  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(headerB64))) as {
      kid?: string;
      alg?: string;
    };
    payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(payloadB64))) as AccessJwtPayload;
  } catch {
    return { valid: false, reason: 'Unable to decode Cloudflare Access JWT.' };
  }

  if (typeof payload.exp === 'number' && nowSeconds > payload.exp) {
    return { valid: false, reason: 'Cloudflare Access JWT has expired.' };
  }
  if (typeof payload.nbf === 'number' && nowSeconds < payload.nbf) {
    return { valid: false, reason: 'Cloudflare Access JWT is not active yet.' };
  }

  const audList = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
  if (!audList.includes(expectedAud)) {
    return { valid: false, reason: 'Cloudflare Access JWT audience mismatch.' };
  }

  const certsUrl = `https://${teamDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/cdn-cgi/access/certs`;
  const certsRes = await fetch(certsUrl);
  if (!certsRes.ok) {
    return { valid: false, reason: `Failed to fetch Access JWKS (HTTP ${certsRes.status}).` };
  }

  const jwks = (await certsRes.json()) as { keys?: JwkKey[] };
  const matchingKey = (jwks.keys || []).find((k) => !header.kid || k.kid === header.kid);
  if (!matchingKey) {
    return { valid: false, reason: 'No matching JWK found for Cloudflare Access JWT kid.' };
  }

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    matchingKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const validSig = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    base64UrlToUint8Array(sigB64),
    new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  );

  if (!validSig) {
    return { valid: false, reason: 'Invalid Cloudflare Access JWT cryptographic signature.' };
  }

  return { valid: true, email: payload.email };
}
