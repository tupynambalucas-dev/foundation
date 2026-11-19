export const DISTRIBUTIONS = ['tupynambalucas-dev', 'tupynambalucas-dev-cluster'] as const;
export type DistributionName = (typeof DISTRIBUTIONS)[number];
