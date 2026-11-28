import { z } from 'zod';

export const ProviderTypeSchema = z.enum(['github', 'gcloud', 'workspace']);
export type ProviderType = z.infer<typeof ProviderTypeSchema>;

export const AppTierSchema = z.enum([
  'Tier 1',
  'Tier 2',
  'Tier 3',
  'Desktop App',
  'Service Account',
]);
export type AppTier = z.infer<typeof AppTierSchema>;

export const AppStatusSchema = z.enum([
  'Ativo em Produção',
  'Homologado',
  'Em Avaliação',
  'Pendente de Provisionamento',
]);
export type AppStatus = z.infer<typeof AppStatusSchema>;

export const AppPageHighlightSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});
export type IAppPageHighlight = z.infer<typeof AppPageHighlightSchema>;

export const AppPageSpecSchema = z.object({
  subtitle: z.string().min(1).optional(),
  identityType: z.string().min(1).optional(),
  highlights: z.array(AppPageHighlightSchema).optional(),
  externalDocsUrl: z.url().optional(),
  externalDocsLabel: z.string().min(1).optional(),
});
export type IAppPageSpec = z.infer<typeof AppPageSpecSchema>;

export const AppRecordSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  provider: ProviderTypeSchema,
  tier: AppTierSchema,
  description: z.string().min(1),
  appId: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  status: AppStatusSchema,
  scopes: z.array(z.string()),
  events: z.array(z.string()).optional(),
  homepageUrl: z.url(),
  landingUrl: z.string().min(1),
  docsPath: z.string().min(1),
  infisicalPath: z.string().min(1).optional(),
  page: AppPageSpecSchema.optional(),
});
export type IAppRecord = z.infer<typeof AppRecordSchema>;

export const AppLiveStatusSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  provisioned: z.boolean(),
  appId: z.string().nullable(),
  htmlUrl: z.string().nullable(),
  checkedAt: z.string().min(1),
});
export type IAppLiveStatus = z.infer<typeof AppLiveStatusSchema>;

export const AppsStatusResponseSchema = z.object({
  checkedAt: z.string().min(1),
  apps: z.array(AppLiveStatusSchema),
});
export type IAppsStatusResponse = z.infer<typeof AppsStatusResponseSchema>;

export const GitHubAppTierSpecSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  secretPrefix: z.string().min(1),
  infisicalPath: z.string().min(1),
  botUserId: z.number().int().positive().optional(),
  canOpenAutomatedPrs: z.boolean().optional(),
  isPrApprover: z.boolean().optional(),
});
export type IGitHubAppTierSpec = z.infer<typeof GitHubAppTierSpecSchema>;
