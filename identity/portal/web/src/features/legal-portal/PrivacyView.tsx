import React from 'react';
import { PRIVACY_CONTENT } from '@/domains/compliance/privacy.content';
import { Link } from '@/shared/router/useRouter';
import { ShieldCheckIcon, FileTextIcon } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';

export const PrivacyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <Link to="/" className="text-xs font-mono text-blue-400 hover:text-blue-300">
          &larr; Voltar ao Catálogo de Aplicações
        </Link>
      </div>

      <div className="glass-card rounded-2xl p-8 sm:p-12 mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShieldCheckIcon size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider block">
                Conformidade Legal & Governança de Dados
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{PRIVACY_CONTENT.title}</h1>
            </div>
          </div>
          <Badge variant="blue">Versão Vigente: 2026.11</Badge>
        </div>

        <div className="py-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 border-b border-slate-800/60 mb-8">
          <span>Última atualização: {PRIVACY_CONTENT.lastUpdated}</span>
          <span>Organização: {PRIVACY_CONTENT.organization}</span>
        </div>

        <div className="space-y-10">
          {PRIVACY_CONTENT.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-4 flex items-baseline gap-2">
                <span className="text-blue-400 font-mono text-sm">{section.number}.</span>
                {section.title}
              </h2>
              <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                {section.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <FileTextIcon size={16} className="text-blue-400" />
            <span>Documento oficial de conformidade jurídica para Google Cloud e GitHub</span>
          </div>
          <Link to="/terms" className="text-blue-400 hover:text-blue-300">
            Consultar Termos de Serviço &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
