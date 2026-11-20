export type ProviderType = 'github' | 'gcloud' | 'workspace';

export type AppTier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Desktop App' | 'Service Account';

export interface IAppRecord {
  id: string;
  slug: string;
  name: string;
  provider: ProviderType;
  tier: AppTier;
  description: string;
  appId?: string;
  clientId?: string;
  status: 'Ativo em Produção' | 'Homologado' | 'Em Avaliação';
  scopes: string[];
  homepageUrl: string;
  landingUrl?: string;
  docsPath: string;
}
