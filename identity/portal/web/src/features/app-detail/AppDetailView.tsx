import React from 'react';
import { APPS_DATA } from '@/domains/apps/apps.data';
import { useLiveAppStatus } from '@/domains/apps/hooks/useLiveAppStatus';
import { Badge } from '@/shared/ui/Badge';
import { Link } from '@/shared/router/useRouter';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CloudIcon,
  ExternalLinkIcon,
  KeyIcon,
  ServerIcon,
  ShieldCheckIcon,
} from '@/shared/ui/Icons';
import { NotFoundView } from '@/features/not-found/NotFoundView';

export const AppDetailView: React.FC<{ slug: string }> = ({ slug }) => {
  const liveApps = useLiveAppStatus(APPS_DATA);
  const app = liveApps.find((item) => item.slug === slug);

  if (!app) {
    return <NotFoundView />;
  }

  const providerLabel = {
    github: 'GitHub App',
    gcloud: 'Google Cloud OAuth',
    workspace: 'Google Cloud & Workspace',
  }[app.provider];

  const badgeVariant = {
    github: 'blue' as const,
    gcloud: 'emerald' as const,
    workspace: 'purple' as const,
  }[app.provider];

  const icon = {
    github: <KeyIcon size={24} />,
    gcloud: <CloudIcon size={24} />,
    workspace: <ServerIcon size={24} />,
  }[app.provider];

  const iconBoxClass = {
    github: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    gcloud: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    workspace: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  }[app.provider];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <Link to="/" className="text-xs font-mono text-blue-400 hover:text-blue-300">
          &larr; Voltar ao Catálogo de Aplicações
        </Link>
      </div>

      <div className="glass-card rounded-2xl p-8 sm:p-10 mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${iconBoxClass}`}>{icon}</div>
            <div>
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider block">
                {app.page?.subtitle || providerLabel}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{app.name}</h1>
            </div>
          </div>
          <Badge variant={badgeVariant}>{app.tier}</Badge>
        </div>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">{app.description}</p>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 mb-8">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Especificações Técnicas & Identidade Soberana
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Tipo de Identidade:</span>
              <span className="text-slate-200 font-semibold">{app.page?.identityType || providerLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status Operacional:</span>
              <span
                className={
                  app.appId === 'Pending Provisioning'
                    ? 'text-amber-400 font-semibold'
                    : 'text-emerald-400 font-semibold'
                }
              >
                {app.status}
              </span>
            </div>
            {app.appId && (
              <div>
                <span className="text-slate-500 block">App ID:</span>
                <span className="text-blue-400 font-semibold">{app.appId}</span>
              </div>
            )}
            {app.clientId && (
              <div>
                <span className="text-slate-500 block">Client ID:</span>
                <span className="text-emerald-400 font-semibold break-all">{app.clientId}</span>
              </div>
            )}
            {app.infisicalPath && (
              <div>
                <span className="text-slate-500 block">Infisical Vault Path:</span>
                <span className="text-slate-200 font-semibold">{app.infisicalPath}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block">Origem Declarativa (SSOT):</span>
              <span className="text-slate-300">{app.docsPath}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-500 block">Escopos & Permissões Declaradas:</span>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {app.scopes.map((scope) => (
                  <div key={scope} className="flex items-center gap-2 text-slate-300">
                    <CheckCircleIcon size={14} className="text-emerald-400 shrink-0" />
                    <code className="break-all">{scope}</code>
                  </div>
                ))}
              </div>
            </div>

            {app.events && app.events.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Eventos de Webhook Assinados:</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {app.events.map((ev) => (
                    <span
                      key={ev}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {app.page?.highlights && app.page.highlights.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheckIcon size={20} className="text-blue-400" />
              Garantias de Arquitetura, Privacidade e Governança
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {app.page.highlights.map((highlight) => (
                <div key={highlight.title} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div className="text-slate-200 font-semibold text-sm mb-2">{highlight.title}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {app.provider === 'github' && app.appId === 'Pending Provisioning' && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-amber-200">
              Este GitHub App está declarado em SSOT e pronto para provisionamento Zero Trust via Manifest Flow.
            </div>
            <a
              href={`/api/github/provision?tier=${encodeURIComponent(app.slug)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
            >
              Provisionar (Zero Trust)
              <ArrowRightIcon size={14} />
            </a>
          </div>
        )}

        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://apps.tupynambalucas.dev/privacy"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Política de Privacidade &rarr;
            </a>
            <a
              href="https://apps.tupynambalucas.dev/terms"
              className="text-slate-400 hover:text-slate-200 font-medium"
            >
              Termos de Serviço
            </a>
          </div>

          {app.page?.externalDocsUrl && (
            <a
              href={app.page.externalDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200"
            >
              {app.page.externalDocsLabel || 'Documentação Externa'}
              <ExternalLinkIcon size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
