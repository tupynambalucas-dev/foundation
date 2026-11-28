export type ProviderType = 'github' | 'gcloud' | 'workspace';

export type AppTier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Desktop App' | 'Service Account';

export type AppStatus =
  | 'Ativo em Produção'
  | 'Homologado'
  | 'Em Avaliação'
  | 'Pendente de Provisionamento';

export interface IAppRecord {
  id: string;
  slug: string;
  name: string;
  provider: ProviderType;
  tier: AppTier;
  description: string;
  appId?: string;
  clientId?: string;
  status: AppStatus;
  scopes: string[];
  homepageUrl: string;
  landingUrl?: string;
  docsPath: string;
}

export interface IAppLiveStatus {
  slug: string;
  name: string;
  provisioned: boolean;
  appId: string | null;
  htmlUrl: string | null;
  checkedAt: string;
}

export interface IAppsStatusResponse {
  checkedAt: string;
  apps: IAppLiveStatus[];
}
