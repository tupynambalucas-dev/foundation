export interface PortalEnv {
  ASSETS: Fetcher;
  PR_GATE_WORKFLOW: Workflow<PrGateParams>;
  GITHUB_WEBHOOK_SECRET?: string;
  GUARDIAN_APP_ID?: string;
  GUARDIAN_APP_INSTALLATION_ID?: string;
  GUARDIAN_APP_PRIVATE_KEY_BASE64?: string;
  PORTAL_STATE_SECRET?: string;
  INFISICAL_CLIENT_ID?: string;
  INFISICAL_CLIENT_SECRET?: string;
  INFISICAL_PROJECT_ID?: string;
  INFISICAL_API_URL?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  ALERT_WEBHOOK_URL?: string;
}

export interface PrGateParams {
  owner: string;
  repo: string;
  pullNumber: number;
  headSha: string;
  authorLogin: string;
  authorId?: number;
  authorType?: string;
  title: string;
  body: string;
  deliveryId: string;
}

export interface GateOutcome {
  passed: boolean;
  reason: string;
}

export interface PrGateEvaluationResult {
  approved: boolean;
  alreadyApproved: boolean;
  headSha: string;
  gates: {
    ci: GateOutcome;
    signatures: GateOutcome;
    rbac: GateOutcome;
    security: GateOutcome;
    semantic: GateOutcome;
    botConfinement: GateOutcome;
  };
}
