import fs from 'node:fs';
import path from 'node:path';
import type { AppTier, IAppRecord, IGitHubAppTierSpec, ProviderType } from '../src/schemas/app.schema';
import {
  UnifiedAppManifestSchema,
  type GitHubManifestPayload,
} from '../src/schemas/manifest.schema';

interface DiscoveredEntry {
  order: number;
  slug: string;
  record: IAppRecord;
  githubTier?: IGitHubAppTierSpec;
  githubManifest?: GitHubManifestPayload;
}

const SCRIPT_DIR = import.meta.dirname;
const APPS_ROOT = path.resolve(SCRIPT_DIR, '../../../apps');
const OUTPUT_FILE = path.resolve(SCRIPT_DIR, '../src/registry.generated.ts');

const AUTHORIZED_HUMAN_USER_IDS = [53620332] as const;
const DEPENDABOT_USER_ID = 49699333;
const DEPENDABOT_LOGIN = 'dependabot[bot]';

function readJsonFile(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as unknown;
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

function parseDescriptionMarkdown(appDir: string): { summary?: string; body: string } {
  const descriptionPath = path.join(appDir, 'description.md');
  if (!fs.existsSync(descriptionPath)) {
    throw new Error(`[registry-codegen] Missing required description.md in ${appDir}.`);
  }
  const raw = fs.readFileSync(descriptionPath, 'utf8').replace(/\r\n/g, '\n');

  let summary: string | undefined;
  let body = raw;

  const commentMatch = raw.match(/^\s*<!--\s*portal-summary:\s*(.+?)\s*-->\s*\n?/i);
  if (commentMatch) {
    summary = commentMatch[1].trim();
    body = raw.slice(commentMatch[0].length);
  } else {
    const tagMatch = raw.match(/^\s*<summary>\s*([\s\S]*?)\s*<\/summary>\s*\n?/i);
    if (tagMatch) {
      summary = tagMatch[1].trim();
      body = raw.slice(tagMatch[0].length);
    }
  }

  return {
    summary,
    body: body.trim(),
  };
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

function discoverApps(): DiscoveredEntry[] {
  const entries: DiscoveredEntry[] = [];
  const seenSlugs = new Set<string>();

  for (const providerDir of ['github', 'gcloud'] as const) {
    const groupRoot = path.join(APPS_ROOT, providerDir);
    for (const slug of listSubdirectories(groupRoot)) {
      const appDir = path.join(groupRoot, slug);
      const manifestPath = path.join(appDir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        continue;
      }

      if (seenSlugs.has(slug)) {
        throw new Error(`[registry-codegen] Duplicate app slug detected: "${slug}".`);
      }
      seenSlugs.add(slug);

      const rawJson = readJsonFile(manifestPath);
      const parsed = UnifiedAppManifestSchema.parse(rawJson);
      if (parsed.provider !== providerDir) {
        throw new Error(
          `[registry-codegen] ${providerDir}/${slug}/manifest.json declares mismatched provider "${parsed.provider}".`
        );
      }

      const { summary: extractedSummary, body: cleanDescription } = parseDescriptionMarkdown(appDir);
      const portal = parsed.portal;
      const landingUrl = portal.landingUrl || `/apps/${slug}`;

      if (parsed.provider === 'github') {
        const gh = parsed.github;
        const scopes = Object.entries(gh.default_permissions)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([perm, level]) => `${perm}:${level}`);
        const events = gh.default_events || [];

        const secretPrefix = portal.secretPrefix || slugToSecretPrefix(slug);
        const infisicalPath = portal.infisicalPath || `/apps/${slug}`;
        const tier: AppTier = portal.tier || inferTierFromDescription(cleanDescription);
        const description = portal.summary || extractedSummary || inferSummaryFromMarkdown(cleanDescription);

        const pureGitHubManifest: GitHubManifestPayload = {
          ...gh,
          description: cleanDescription,
        };

        const record: IAppRecord = {
          id: `github-${slug}`,
          slug,
          name: portal.displayName || gh.name,
          provider: 'github',
          tier,
          description,
          appId: portal.fallbackAppId || 'Pending Provisioning',
          status: portal.fallbackAppId ? 'Ativo em Produção' : 'Pendente de Provisionamento',
          scopes,
          events,
          homepageUrl: gh.url,
          landingUrl,
          docsPath: `foundation/identity/apps/github/${slug}`,
          infisicalPath,
          ...(portal.page ? { page: portal.page } : {}),
        };

        entries.push({
          order: portal.order ?? 100,
          slug,
          record,
          githubTier: {
            slug,
            name: gh.name,
            secretPrefix,
            infisicalPath,
            ...(portal.botUserId ? { botUserId: portal.botUserId } : {}),
            ...(portal.canOpenAutomatedPrs ? { canOpenAutomatedPrs: portal.canOpenAutomatedPrs } : {}),
            ...(portal.isPrApprover ? { isPrApprover: portal.isPrApprover } : {}),
          },
          githubManifest: pureGitHubManifest,
        });
      } else {
        const gc = parsed.gcloud;
        const provider: ProviderType =
          portal.displayProvider || (gc.client_type === 'service-account' ? 'workspace' : 'gcloud');
        const tier: AppTier =
          portal.tier || (gc.client_type === 'service-account' ? 'Service Account' : 'Desktop App');
        const scopes = gc.scopes.map((entry) => entry.scope);
        const description = portal.summary || extractedSummary || inferSummaryFromMarkdown(cleanDescription);
        const clientId = portal.clientId || gc.identities?.oauth_desktop?.client_id || gc.identities?.service_account?.email;

        const record: IAppRecord = {
          id: `gcloud-${slug}`,
          slug,
          name: portal.displayName || gc.app_name,
          provider,
          tier,
          description,
          ...(clientId ? { clientId } : {}),
          status: 'Ativo em Produção',
          scopes,
          homepageUrl: gc.branding.homepage_url,
          landingUrl,
          docsPath: `foundation/identity/apps/gcloud/${slug}`,
          ...(portal.page ? { page: portal.page } : {}),
        };

        entries.push({
          order: portal.order ?? 200,
          slug,
          record,
        });
      }
    }
  }

  return entries;
}

function buildGeneratedSource(entries: DiscoveredEntry[]): string {
  const sorted = [...entries].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));

  const githubTiers: IGitHubAppTierSpec[] = [];
  const githubManifests: Record<string, GitHubManifestPayload> = {};
  const catalog: IAppRecord[] = [];
  const authorizedBotUserIds = new Set<number>([DEPENDABOT_USER_ID]);
  const authorizedBotLogins = new Set<string>([DEPENDABOT_LOGIN]);
  const guardianBotUserIds = new Set<number>();
  const guardianBotLogins = new Set<string>();

  for (const entry of sorted) {
    catalog.push(entry.record);
    if (entry.githubTier && entry.githubManifest) {
      githubTiers.push(entry.githubTier);
      githubManifests[entry.githubTier.slug] = entry.githubManifest;

      if (entry.githubTier.canOpenAutomatedPrs) {
        if (entry.githubTier.botUserId) {
          authorizedBotUserIds.add(entry.githubTier.botUserId);
        }
        authorizedBotLogins.add(`${entry.githubTier.name}[bot]`);
      }

      if (entry.githubTier.isPrApprover) {
        if (entry.githubTier.botUserId) {
          guardianBotUserIds.add(entry.githubTier.botUserId);
        }
        guardianBotLogins.add(`${entry.githubTier.name}[bot]`);
        guardianBotLogins.add(entry.githubTier.name);
      }
    }
  }

  return [
    '/* eslint-disable */',
    '// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY.',
    '// Generated by scripts/generate-registry.ts from foundation/identity/apps/{github,gcloud}/*',
    "import type { IAppRecord, IGitHubAppTierSpec } from './schemas/app.schema';",
    '',
    `export const GITHUB_APP_TIERS: readonly IGitHubAppTierSpec[] = ${JSON.stringify(githubTiers, null, 2)} as const;`,
    '',
    `export const GITHUB_MANIFESTS_BY_SLUG: Readonly<Record<string, Readonly<Record<string, unknown>>>> = ${JSON.stringify(githubManifests, null, 2)};`,
    '',
    `export const PORTAL_APPS_CATALOG: readonly IAppRecord[] = ${JSON.stringify(catalog, null, 2)} as const;`,
    '',
    `export const AUTHORIZED_HUMAN_USER_IDS: readonly number[] = ${JSON.stringify([...AUTHORIZED_HUMAN_USER_IDS])} as const;`,
    '',
    `export const AUTHORIZED_BOT_USER_IDS: readonly number[] = ${JSON.stringify([...authorizedBotUserIds])} as const;`,
    '',
    `export const AUTHORIZED_BOT_LOGINS: readonly string[] = ${JSON.stringify([...authorizedBotLogins])} as const;`,
    '',
    `export const GUARDIAN_BOT_USER_IDS: readonly number[] = ${JSON.stringify([...guardianBotUserIds])} as const;`,
    '',
    `export const GUARDIAN_BOT_LOGINS: readonly string[] = ${JSON.stringify([...guardianBotLogins])} as const;`,
    '',
  ].join('\n');
}

function main(): void {
  const entries = discoverApps();
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
