import React from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Link } from '@/shared/router/useRouter';
import { ServerIcon, CheckCircleIcon, ExternalLinkIcon, LockIcon } from '@/shared/ui/Icons';

export const WorkspaceView: React.FC = () => {
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
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ServerIcon size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-purple-400 font-semibold uppercase tracking-wider block">
                Google Workspace & Service Account
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Workspace & AppSheet Automation
              </h1>
            </div>
          </div>
          <Badge variant="purple">Service Account</Badge>
        </div>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
          A integração <strong>Google Workspace & AppSheet Automation</strong> é utilizada pela organização{' '}
          <span className="text-slate-100 font-semibold">tupynambalucas-dev</span> para geração e manutenção automatizada de planilhas empresariais no Google Sheets que servem como bancos de dados relacionais em Primeira Forma Normal (1NF) para aplicativos no Google AppSheet e pipelines analíticos.
        </p>

        {/* Technical Specs */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 mb-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Especificações de Autenticação e Escopos
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Tipo de Identidade:</span>
              <span className="text-slate-200 font-semibold">Google Cloud Service Account (Machine-to-Machine)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Segredo Gerenciado:</span>
              <span className="text-emerald-400 font-semibold">Infisical Universal Auth (GOOGLE_SERVICE_ACCOUNT_JSON)</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block">Escopos de API Autorizados:</span>
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircleIcon size={14} className="text-emerald-400" />
                  <code>https://www.googleapis.com/auth/spreadsheets</code> (Criação e mutação de planilhas)
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircleIcon size={14} className="text-emerald-400" />
                  <code>https://www.googleapis.com/auth/drive.file</code> (Gerenciamento de pastas de projetos dedicadas)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Directives */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <LockIcon size={20} className="text-purple-400" />
            Regras de Modelagem e Governança de Dados
          </h2>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <strong>Normalização Relacional (1NF)</strong>: Toda planilha gerada possui cabeçalhos congelados na Linha 1 e identificador primário determinístico <code>&lt;Entidade&gt;Id</code> gerado com <code>UNIQUEID()</code>.
            </li>
            <li className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <strong>Isolamento de Diretórios</strong>: Os arquivos de dados são criados estritamente dentro de pastas designadas de equipe (Team Drives) com ID específico, sem dispersão em Meu Drive pessoal.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs">
          <Link to="/privacy" className="text-blue-400 hover:text-blue-300 font-medium">
            Ver Política de Privacidade &rarr;
          </Link>
          <a
            href="https://developers.google.com/sheets/api"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200"
          >
            Google Sheets API Docs
            <ExternalLinkIcon size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
