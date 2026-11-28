import React from 'react';
import { TERMS_CONTENT } from '@tupynambalucas-dev/identity-portal-core';
import { Link } from '@/shared/router/useRouter';
import { FileTextIcon } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';

export const TermsView: React.FC = () => {
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
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FileTextIcon size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-purple-400 font-semibold uppercase tracking-wider block">
                Termos & Condições de Uso de Software
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{TERMS_CONTENT.title}</h1>
            </div>
          </div>
          <Badge variant="purple">Versão Vigente: 2026.11</Badge>
        </div>

        <div className="py-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 border-b border-slate-800/60 mb-8">
          <span>Última atualização: {TERMS_CONTENT.lastUpdated}</span>
          <span>Organização: {TERMS_CONTENT.organization}</span>
        </div>

        <div className="space-y-10">
          {TERMS_CONTENT.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-4 flex items-baseline gap-2">
                <span className="text-purple-400 font-mono text-sm">{section.number}.</span>
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
          <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
            &larr; Consultar Política de Privacidade
          </Link>
          <span>apps.tupynambalucas.dev</span>
        </div>
      </div>
    </div>
  );
};
