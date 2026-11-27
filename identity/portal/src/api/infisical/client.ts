export interface InfisicalUpsertParams {
  apiUrl?: string;
  clientId: string;
  clientSecret: string;
  projectId: string;
  environment: string;
  secretPath: string;
  secrets: Record<string, string>;
}

/**
 * Exchanges Infisical Universal Auth credentials for an ephemeral machine access token.
 */
async function loginUniversalAuth(
  apiUrl: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch(`${apiUrl}/api/v1/auth/universal-auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });

  if (!response.ok) {
    throw new Error(`Infisical Universal Auth failed with HTTP ${response.status}.`);
  }

  const data = (await response.json()) as { accessToken?: string };
  if (!data.accessToken) {
    throw new Error('Infisical Universal Auth response missing accessToken.');
  }
  return data.accessToken;
}

/**
 * Upserts secrets in Infisical Cloud (creates or updates each secret key without logging values).
 */
export async function upsertInfisicalSecrets(params: InfisicalUpsertParams): Promise<string[]> {
  const apiUrl = (params.apiUrl || 'https://app.infisical.com').replace(/\/+$/, '');
  const accessToken = await loginUniversalAuth(apiUrl, params.clientId, params.clientSecret);
  const upsertedKeys: string[] = [];

  for (const [secretKey, secretValue] of Object.entries(params.secrets)) {
    const baseBody = {
      workspaceId: params.projectId,
      environment: params.environment,
      secretPath: params.secretPath,
      secretValue,
      type: 'shared',
    };

    const createRes = await fetch(
      `${apiUrl}/api/v3/secrets/raw/${encodeURIComponent(secretKey)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(baseBody),
      }
    );

    if (createRes.ok) {
      upsertedKeys.push(secretKey);
      continue;
    }

    const updateRes = await fetch(
      `${apiUrl}/api/v3/secrets/raw/${encodeURIComponent(secretKey)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(baseBody),
      }
    );

    if (!updateRes.ok) {
      throw new Error(`Infisical upsert failed for key '${secretKey}' (HTTP ${updateRes.status}).`);
    }
    upsertedKeys.push(secretKey);
  }

  return upsertedKeys;
}
