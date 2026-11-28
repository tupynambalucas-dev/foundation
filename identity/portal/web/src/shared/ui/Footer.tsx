import React from 'react';
import { Link } from '../router/useRouter';
import { ExternalLinkIcon } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060911] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <span className="font-bold text-slate-100 tracking-tight text-lg">
              tupynambalucas<span className="text-blue-500">.dev</span>
            </span>
            <p className="mt-2 text-sm text-slate-400 max-w-sm">
              Plataforma corporativa de infraestrutura, identidades de máquina soberanas e governança de software para engenharia autônoma.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">Conformidade Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-slate-200 transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-slate-200 transition-colors">
                  Termos de Serviço
                </Link>
              </li>
              <li>
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Google API Policy
                  <ExternalLinkIcon size={12} />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">Ecossistema</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/apps/org-workspace" className="text-slate-400 hover:text-slate-200 transition-colors">
                  tupynambalucas-org-workspace
                </Link>
              </li>
              <li>
                <Link to="/apps/org-guardian" className="text-slate-400 hover:text-slate-200 transition-colors">
                  tupynambalucas-org-guardian
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/tupynambalucas-dev"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  GitHub Organization
                  <ExternalLinkIcon size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>Copyright (c) 2026 tupynambalucas.dev. Todos os direitos reservados.</p>
          <p>Hospedado globalmente na borda com Cloudflare Workers</p>
        </div>
      </div>
    </footer>
  );
};
