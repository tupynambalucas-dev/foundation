import React, { useState } from 'react';
import { APPS_DATA } from '@/domains/apps/apps.data';
import { ProviderType } from '@/domains/apps/apps.types';
import { AppCard } from './AppCard';
import { SearchIcon, ShieldCheckIcon, TerminalIcon, KeyIcon } from '@/shared/ui/Icons';
import { Link } from '@/shared/router/useRouter';

export const AppCatalogView: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | ProviderType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = APPS_DATA.filter((app) => {
    const matchesFilter = selectedFilter === 'all' || app.provider === selectedFilter;
    const matchesSearch =
      searchQuery === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.appId && app.appId.includes(searchQuery)) ||
      (app.clientId && app.clientId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Header */}
      <div className="mb-12 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
          <KeyIcon size={14} />
          Portal Central de Confiança & Identidade Soberana
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Aplicações Corporativas & Identidades de Máquina
        </h1>
        <p className="mt-3 text-base text-slate-400 max-w-3xl leading-relaxed">
          Catálogo autoritativo de identidades de software da organização <span className="text-slate-200 font-semibold">tupynambalucas-dev</span>.
          Garantindo emissão de tokens efêmeros de menor privilégio, verificação oficial de marca OAuth e conformidade legal em conformidade com as diretrizes do Google e GitHub.
        </p>

        {/* Action quick links */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/privacy"
            className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            Política de Privacidade Canônica
          </Link>
          <Link
            to="/rclone"
            className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            Rclone Desktop Client
          </Link>
          <Link
            to="/workspace"
            className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            Workspace Automation
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 w-full sm:w-auto overflow-x-auto">
          {(['all', 'github', 'gcloud', 'workspace'] as const).map((filter) => {
            const labels = {
              all: 'Todos os Apps',
              github: 'GitHub Apps',
              gcloud: 'Google Cloud OAuth',
              workspace: 'Google Workspace',
            };
            const isActive = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por nome, id ou escopo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="absolute left-3 top-2.5 text-slate-500 pointer-events-none">
            <SearchIcon size={14} />
          </div>
        </div>
      </div>

      {/* Grid of Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>

      {/* Operational Highlights Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6">
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit mb-4">
            <ShieldCheckIcon size={20} />
          </div>
          <h3 className="font-semibold text-slate-200 text-base mb-2">Token Broker Daemon</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Micro-serviço em Go centralizando a chave privada RSA de forma hermética. Emite tokens efêmeros de 1 hora com escopo delimitado aos repositórios autorizados em policies.yaml.
          </p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-4">
            <TerminalIcon size={20} />
          </div>
          <h3 className="font-semibold text-slate-200 text-base mb-2">WinFsp & Rclone Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Montagem de unidades no Windows e WSL2 com cache SSD de alto desempenho, transferências nuvem-para-nuvem sem consumo de banda local e backups incrementais com versionamento.
          </p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-4">
            <KeyIcon size={20} />
          </div>
          <h3 className="font-semibold text-slate-200 text-base mb-2">Google & GitHub Verified</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Brand Verification em Produção. Escopos OAuth permanentes sem expiração semanal, cumprindo integralmente as exigências de Limited Use e a LGPD/GDPR.
          </p>
        </div>
      </div>
    </div>
  );
};
