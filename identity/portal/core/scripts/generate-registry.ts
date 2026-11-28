import fs from 'node:fs';
import path from 'node:path';
import type { AppTier, IAppRecord, IPortalAppMetadata, ProviderType } from '../src/apps.types';
import type { IGitHubAppTierSpec } from '../src/routes';

interface GitHubManifestJson {
  name?: unknown;
  url?: unknown;
  description?: unknown;
  default_permissions?: Record<string, string>;
  default_events?: unknown[];
  [key: string]: unknown;
}

interface GCloudAppConfigJson {
  app_slug?: string;
  app_name?: string;
  provider?: string;
  client_type?: string;
  branding?: {
    homepage_url?: string;
  };
}

interface GCloudScopeEntry {
  scope: string;
}

interface DiscoveredEntry {
  order: number;
  slug: string;
  record: IAppRecord;
  githubTier?: IGitHubAppTierSpec;
  githubManifest?: Record<string, unknown>;
}

const FORBIDDEN_GITHUB_PERMISSIONS = new Set(['team_discussions']);
const FORBIDDEN_GITHUB_EVENTS = new Set(['installation', 'installation_repositories']);

const SCRIPT_DIR = import.meta.dirname;
const APPS_ROOT = path.resolve(SCRIPT_DIR, '../../../apps');
const OUTPUT_FILE = path.resolve(SCRIPT_DIR, '../src/registry.generated.ts');

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

function readOptionalPortalMetadata(appDir: string): IPortalAppMetadata {
  const portalPath = path.join(appDir, 'portal.json');
  if (!fs.existsSync(portalPath)) {
    return {};
  }
  return readJsonFile<IPortalAppMetadata>(portalPath);
}

function listSubdirectories(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function inferSummaryFromMarkdown(description: string): string {
  const lines = description
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('>') && !line.startsWith('-'));
  const firstParagraph = lines[0] || description.trim();
  return firstParagraph.replace(/[`*_]/g, '').trim();
}

function inferTierFromDescription(description: string): AppTier {
  const match = description.match(/Tier[- ]?([123])/i);
  if (match?.[1] === '1') return 'Tier 1';
  if (match?.[1] === '3') return 'Tier 3';
  return 'Tier 2';
}

function slugToSecretPrefix(slug: string): string {
  return slug
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function validateGitHubManifest(slug: string, manifest: GitHubManifestJson): void {
  if (typeof manifest.name !== 'string' || manifest.name.trim().length === 0) {
    throw new Error(`[registry-codegen] github/${slug}/manifest.json is missing a valid "name" string.`);
  }
  if (typeof manifest.url !== 'string' || manifest.url.trim().length === 0) {
    throw new Error(`[registry-codegen] github/${slug}/manifest.json is missing a valid "url" string.`);
  }
  if (manifest.default_permissions && typeof manifest.default_permissions === 'object') {
    for (const perm of Object.keys(manifest.default_permissions)) {
      if (FORBIDDEN_GITHUB_PERMISSIONS.has(perm)) {
        throw new Error(
          `[registry-codegen] github/${slug}/manifest.json declares forbidden/sunset permission "${perm}".`
        );
      }
    }
  }
  if (Array.isArray(manifest.default_events)) {
    for (const eventName of manifest.default_events) {
      if (typeof eventName === 'string' && FORBIDDEN_GITHUB_EVENTS.has(eventName)) {
        throw new Error(
          `[registry-codegen] github/${slug}/manifest.json declares built-in event "${eventName}" rejected by GitHub Manifest Flow.`
        );
      }
    }
  }
}

function discoverGitHubApps(): DiscoveredEntry[] {
  const githubRoot = path.join(APPS_ROOT, 'github');
  const slugs = listSubdirectories(githubRoot);
  const seenSlugs = new Set<string>();
  const entries: DiscoveredEntry[] = [];

  for (const slug of slugs) {
    const appDir = path.join(githubRoot, slug);
    const manifestPath = path.join(appDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      continue;
    }

    if (seenSlugs.has(slug)) {
      throw new Error(`[registry-codegen] Duplicate GitHub App slug detected: "${slug}".`);
    }
    seenSlugs.add(slug);

    const manifest = readJsonFile<GitHubManifestJson>(manifestPath);
    validateGitHubManifest(slug, manifest);

    const portal = readOptionalPortalMetadata(appDir);
    const name = String(manifest.name);
    const homepageUrl = String(manifest.url);
    const rawDescription = typeof manifest.description === 'string' ? manifest.description : '';

    const scopes = Object.entries(manifest.default_permissions || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([perm, level]) => `${perm}:${level}`);

    const secretPrefix = portal.secretPrefix || slugToSecretPrefix(slug);
    const infisicalPath = portal.infisicalPath || `/apps/${slug}`;
    const tier: AppTier = portal.tier || inferTierFromDescription(rawDescription);
    const description = portal.summary || inferSummaryFromMarkdown(rawDescription);

    const record: IAppRecord = {
      id: `github-${slug}`,
      slug,
      name: portal.displayName || name,
      provider: 'github',
      tier,
      description,
      appId: portal.fallbackAppId || 'Pending Provisioning',
      status: portal.fallbackAppId ? 'Ativo em Produção' : 'Pendente de Provisionamento',
      scopes,
      homepageUrl,
      docsPath: `foundation/identity/apps/github/${slug}`,
    };

    entries.push({
      order: portal.order ?? 100,
      slug,
      record,
      githubTier: {
        slug,
        name,
        secretPrefix,
        infisicalPath,
      },
      githubManifest: manifest,
    });
  }

  return entries;
}

function discoverGCloudApps(): DiscoveredEntry[] {
  const gcloudRoot = path.join(APPS_ROOT, 'gcloud');
  const slugs = listSubdirectories(gcloudRoot);
  const entries: DiscoveredEntry[] = [];

  for (const slug of slugs) {
    const appDir = path.join(gcloudRoot, slug);
    const configPath = path.join(appDir, 'app-config.json');
    if (!fs.existsSync(configPath)) {
      continue;
    }

    const config = readJsonFile<GCloudAppConfigJson>(configPath);
    const scopesPath = path.join(appDir, 'scopes.json');
    const scopesJson = fs.existsSync(scopesPath) ? readJsonFile<GCloudScopeEntry[]>(scopesPath) : [];
    const portal = readOptionalPortalMetadata(appDir);

    const provider: ProviderType =
      portal.provider || (config.client_type === 'service-account' ? 'workspace' : 'gcloud');
    const tier: AppTier =
      portal.tier || (config.client_type === 'service-account' ? 'Service Account' : 'Desktop App');
    const homepageUrl = config.branding?.homepage_url || 'https://apps.tupynambalucas.dev';
    const scopes = scopesJson.map((entry) => entry.scope);

    const record: IAppRecord = {
      id: `gcloud-${slug}`,
      slug,
      name: portal.displayName || config.app_name || slug,
      provider,
      tier,
      description: portal.summary || `${config.app_name || slug} (${provider}).`,
      ...(portal.clientId ? { clientId: portal.clientId } : {}),
      status: 'Ativo em Produção',
      scopes,
      homepageUrl,
      ...(portal.landingUrl ? { landingUrl: portal.landingUrl } : {}),
      docsPath: `foundation/identity/apps/gcloud/${slug}`,
    };

    entries.push({
      order: portal.order ?? 200,
      slug,
      record,
    });
  }

  return entries;
}

function buildGeneratedSource(entries: DiscoveredEntry[]): string {
  const sorted = [...entries].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));

  const githubTiers: IGitHubAppTierSpec[] = [];
  const githubManifests: Record<string, Record<string, unknown>> = {};
  const catalog: IAppRecord[] = [];

  for (const entry of sorted) {
    catalog.push(entry.record);
    if (entry.githubTier && entry.githubManifest) {
      githubTiers.push(entry.githubTier);
      githubManifests[entry.githubTier.slug] = entry.githubManifest;
    }
  }

  return [
    '/* eslint-disable */',
    '// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY.',
    '// Generated by scripts/generate-registry.ts from foundation/identity/apps/{github,gcloud}/*',
    "import type { IAppRecord } from './apps.types';",
    "import type { IGitHubAppTierSpec } from './routes';",
    '',
    `export const GITHUB_APP_TIERS: readonly IGitHubAppTierSpec[] = ${JSON.stringify(githubTiers, null, 2)} as const;`,
    '',
    `export const GITHUB_MANIFESTS_BY_SLUG: Readonly<Record<string, Readonly<Record<string, unknown>>>> = ${JSON.stringify(githubManifests, null, 2)};`,
    '',
    `export const PORTAL_APPS_CATALOG: readonly IAppRecord[] = ${JSON.stringify(catalog, null, 2)} as const;`,
    '',
  ].join('\n');
}

function main(): void {
  const entries = [...discoverGitHubApps(), ...discoverGCloudApps()];
  if (entries.length === 0) {
    throw new Error(`[registry-codegen] No app manifests discovered under ${APPS_ROOT}.`);
  }

  const nextContent = buildGeneratedSource(entries);
  const currentContent = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, 'utf8') : null;

  if (currentContent !== nextContent) {
    fs.writeFileSync(OUTPUT_FILE, nextContent, 'utf8');
  }

  const githubCount = entries.filter((e) => Boolean(e.githubTier)).length;
  const gcloudCount = entries.length - githubCount;
  console.log(
    `[registry-codegen] Synchronized ${entries.length} apps (${githubCount} github, ${gcloudCount} gcloud) -> ${path.relative(process.cwd(), OUTPUT_FILE)}`
  );
}

main();
