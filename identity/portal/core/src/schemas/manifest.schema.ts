import { z } from 'zod';
import { AppPageSpecSchema, AppTierSchema, ProviderTypeSchema } from './app.schema';

export const FORBIDDEN_GITHUB_PERMISSIONS = new Set(['team_discussions']);
export const FORBIDDEN_GITHUB_EVENTS = new Set(['installation', 'installation_repositories']);

export const AppScopeNamespaceSchema = z.enum(['org', 'saas', 'client', 'oss', 'dev']);
export type AppScopeNamespace = z.infer<typeof AppScopeNamespaceSchema>;

export const PortalMetadataSchema = z.object({
  order: z.number().int().nonnegative().optional(),
  tier: AppTierSchema.optional(),
  displayProvider: ProviderTypeSchema.optional(),
  displayName: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  secretPrefix: z.string().min(1).optional(),
  infisicalPath: z.string().startsWith('/').optional(),
  fallbackAppId: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  landingUrl: z.string().startsWith('/').optional(),
  botUserId: z.number().int().positive().optional(),
  canOpenAutomatedPrs: z.boolean().optional(),
  isPrApprover: z.boolean().optional(),
  page: AppPageSpecSchema.optional(),
});
export type IPortalAppMetadata = z.infer<typeof PortalMetadataSchema>;

export const GitHubManifestPayloadSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(34, 'GitHub App name must be at most 34 characters.')
      .refine((val) => !val.endsWith('-bot'), 'GitHub App name must not end with -bot.'),
    url: z.url(),
    hook_attributes: z
      .object({
        url: z.url(),
        active: z.boolean(),
      })
      .optional(),
    redirect_url: z.url().optional(),
    callback_urls: z.array(z.url()).optional(),
    public: z.boolean().optional(),
    default_permissions: z
      .record(z.string(), z.string())
      .refine(
        (perms) => !Object.keys(perms).some((p) => FORBIDDEN_GITHUB_PERMISSIONS.has(p)),
        'Manifest declares forbidden/sunset permission (team_discussions).'
      ),
    default_events: z
      .array(z.string())
      .refine(
        (events) => !events.some((e) => FORBIDDEN_GITHUB_EVENTS.has(e)),
        'Manifest declares built-in event rejected by GitHub Manifest Flow (installation/installation_repositories).'
      )
      .optional(),
    description: z.string().optional(),
  })
  .passthrough();
export type GitHubManifestPayload = z.infer<typeof GitHubManifestPayloadSchema>;

export const GCloudScopeEntrySchema = z.object({
  scope: z.string().min(1),
  description: z.string().min(1),
  required: z.boolean(),
});

export const GCloudManifestPayloadSchema = z.object({
  app_name: z.string().min(1),
  client_type: z.enum(['desktop', 'service-account', 'hybrid', 'web']),
  project_id: z.string().min(6).max(30),
  support_email: z.email(),
  enabled_apis: z.array(z.string().min(1)).optional(),
  identities: z
    .object({
      oauth_desktop: z
        .object({
          name: z.string().min(1),
          client_id: z.string().min(1).optional(),
          redirect_uris: z.array(z.string().min(1)),
        })
        .optional(),
      service_account: z
        .object({
          account_id: z.string().min(1),
          email: z.email(),
          consumers: z.array(z.string().min(1)).optional(),
        })
        .optional(),
    })
    .optional(),
  branding: z.object({
    homepage_url: z.url(),
    privacy_policy_url: z.url(),
    terms_of_service_url: z.url(),
    authorized_domains: z.array(z.string().min(1)).min(1),
  }),
  scopes: z.array(GCloudScopeEntrySchema).min(1),
});
export type GCloudManifestPayload = z.infer<typeof GCloudManifestPayloadSchema>;

export const GitHubAppManifestFileSchema = z.object({
  provider: z.literal('github'),
  scope: AppScopeNamespaceSchema,
  github: GitHubManifestPayloadSchema,
  portal: PortalMetadataSchema.default({}),
});

export const GCloudAppManifestFileSchema = z.object({
  provider: z.literal('gcloud'),
  scope: AppScopeNamespaceSchema,
  gcloud: GCloudManifestPayloadSchema,
  portal: PortalMetadataSchema.default({}),
});

export const UnifiedAppManifestSchema = z.discriminatedUnion('provider', [
  GitHubAppManifestFileSchema,
  GCloudAppManifestFileSchema,
]);
export type UnifiedAppManifest = z.infer<typeof UnifiedAppManifestSchema>;
