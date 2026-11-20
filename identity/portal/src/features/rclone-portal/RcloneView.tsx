import React from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Link } from '@/shared/router/useRouter';
import { TerminalIcon, ShieldCheckIcon, CheckCircleIcon, ExternalLinkIcon, LockIcon } from '@/shared/ui/Icons';

export const RcloneView: React.FC = () => {
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
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TerminalIcon size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider block">
                Google Cloud Platform OAuth Desktop App
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Rclone Windows & WSL Desktop Client
              </h1>
            </div>
          </div>
          <Badge variant="emerald">Produção Homologada</Badge>
        </div>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
          O aplicativo <strong>Rclone Desktop Client</strong> é a solução de software utilizada pela organização{' '}
          <span className="text-slate-100 font-semibold">tupynambalucas-dev</span> para integração nativa do motor Rclone com o driver WinFsp no Windows e WSL2. Ele permite a montagem de volumes virtuais de alta velocidade e a execução de rotinas automáticas de backup profissional e espelhamento entre múltiplas contas do Google Drive.
        </p>

        {/* Technical Metadata Box */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 mb-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Especificações Técnicas de Integração OAuth 2.0
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Tipo de Aplicativo:</span>
              <span className="text-slate-200 font-semibold">Desktop Application (Installed App)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status de Verificação:</span>
              <span className="text-emerald-400 font-semibold">Produção (Domínio apps.tupynambalucas.dev)</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block">Escopos de API Autorizados:</span>
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircleIcon size={14} className="text-emerald-400" />
                  <code>https://www.googleapis.com/auth/drive</code> (Acesso e sincronização de arquivos)
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircleIcon size={14} className="text-emerald-400" />
                  <code>https://www.googleapis.com/auth/drive.metadata.readonly</code> (Consulta de metadados)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architectural Guarantees */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheckIcon size={20} className="text-blue-400" />
            Garantias de Privacidade e Segurança do Usuário
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm mb-2">
                <LockIcon size={16} className="text-emerald-400" />
                Armazenamento Local Estrito
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                As chaves de acesso e refresh tokens obtidos no consentimento OAuth 2.0 residem unicamente no arquivo local <code>rclone.conf</code> protegido na sua máquina. Nenhum token é transmitido a servidores remotos da nossa organização.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm mb-2">
                <ShieldCheckIcon size={16} className="text-blue-400" />
                Limited Use Compliance
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nenhum dado é compartilhado com terceiros ou utilizado para fins de treinamento de modelos de IA generalistas, cumprindo os requisitos de Limited Use da Google API Services User Data Policy.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Topologia de Montagem de Unidades</h3>
            <p className="text-xs text-slate-400 mb-3">
              O Rclone opera mapeando as contas conectadas em unidades virtuais Windows via WinFsp:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
              <div className="p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-blue-400 font-bold block">H:</span>
                <span className="text-slate-400 text-[11px]">Drive Pessoal</span>
              </div>
              <div className="p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-emerald-400 font-bold block">E:</span>
                <span className="text-slate-400 text-[11px]">Drive Org</span>
              </div>
              <div className="p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-purple-400 font-bold block">L:</span>
                <span className="text-slate-400 text-[11px]">Drive Mídia</span>
              </div>
              <div className="p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-amber-400 font-bold block">R:</span>
                <span className="text-slate-400 text-[11px]">Drive Backup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <Link to="/privacy" className="text-blue-400 hover:text-blue-300 font-medium">
            Ver Política de Privacidade Completa &rarr;
          </Link>
          <a
            href="https://rclone.org/drive/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200"
          >
            Documentação Oficial Rclone Drive
            <ExternalLinkIcon size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
