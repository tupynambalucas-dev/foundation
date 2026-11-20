import React from 'react';
import { IAppRecord } from '@/domains/apps/apps.types';
import { Badge } from '@/shared/ui/Badge';
import { Link } from '@/shared/router/useRouter';
import { KeyIcon, ServerIcon, CloudIcon, ArrowRightIcon } from '@/shared/ui/Icons';

export const AppCard: React.FC<{ app: IAppRecord }> = ({ app }) => {
  const providerIcon = {
    github: <KeyIcon className="text-blue-400" size={18} />,
    gcloud: <CloudIcon className="text-emerald-400" size={18} />,
    workspace: <ServerIcon className="text-purple-400" size={18} />,
  }[app.provider];

  const providerBadgeVariant = {
    github: 'blue' as const,
    gcloud: 'emerald' as const,
    workspace: 'purple' as const,
  }[app.provider];

  return (
    <div className="glass-card rounded-xl p-6 flex flex-col justify-between transition-all duration-200">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
              {providerIcon}
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                {app.provider.toUpperCase()}
              </span>
              <h3 className="font-semibold text-slate-100 text-base">{app.name}</h3>
            </div>
          </div>
          <Badge variant={providerBadgeVariant}>{app.tier}</Badge>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">{app.description}</p>

        <div className="space-y-2 mb-6">
          {app.appId && (
            <div className="flex items-center justify-between text-xs font-mono py-1 px-2.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">App ID:</span>
              <span className="text-blue-400 font-semibold">{app.appId}</span>
            </div>
          )}
          {app.clientId && (
            <div className="flex items-center justify-between text-xs font-mono py-1 px-2.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Client ID:</span>
              <span className="text-emerald-400 font-semibold truncate max-w-[200px]" title={app.clientId}>
                {app.clientId}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {app.scopes.map((scope) => (
              <span key={scope} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/40">
                {scope}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {app.status}
        </span>

        {app.landingUrl ? (
          <Link
            to={app.landingUrl}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ver Detalhes
            <ArrowRightIcon size={14} />
          </Link>
        ) : (
          <span className="text-xs font-mono text-slate-500">SSOT Registrado</span>
        )}
      </div>
    </div>
  );
};
