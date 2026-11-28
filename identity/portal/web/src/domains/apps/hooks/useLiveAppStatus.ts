import { useEffect, useState } from 'react';
import {
  AppsStatusResponseSchema,
  type IAppRecord,
  PORTAL_API_ROUTES,
} from '@tupynambalucas-dev/identity-portal-core';

/**
 * Hydrates static catalog records with live GitHub App provisioning state from GET /api/apps/status.
 * Falls back gracefully to the initial catalog if the edge status endpoint is unreachable.
 */
export function useLiveAppStatus(initialApps: IAppRecord[]): IAppRecord[] {
  const [apps, setApps] = useState<IAppRecord[]>(initialApps);

  useEffect(() => {
    let active = true;

    async function fetchLiveStatus() {
      try {
        const res = await fetch(PORTAL_API_ROUTES.appsStatus, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return;
        const parsed = AppsStatusResponseSchema.safeParse(await res.json());
        if (!active || !parsed.success) return;
        const payload = parsed.data;

        const bySlug = new Map(payload.apps.map((item) => [item.slug, item]));

        setApps(
          initialApps.map((app) => {
            if (app.provider !== 'github') return app;
            const live = bySlug.get(app.slug);
            if (!live) return app;

            if (live.provisioned && live.appId) {
              return {
                ...app,
                appId: live.appId,
                status: 'Ativo em Produção',
              };
            }

            return {
              ...app,
              appId: 'Pending Provisioning',
              status: 'Pendente de Provisionamento',
            };
          })
        );
      } catch {
        // Non-fatal: keep static SSOT catalog rendered
      }
    }

    void fetchLiveStatus();
    return () => {
      active = false;
    };
  }, [initialApps]);

  return apps;
}
