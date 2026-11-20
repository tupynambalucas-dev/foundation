import React from 'react';
import { Link } from '@/shared/router/useRouter';
import { ArrowRightIcon } from '@/shared/ui/Icons';

export const NotFoundView: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 font-mono font-bold text-2xl mb-6">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
        Página Não Encontrada
      </h1>
      <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
        O recurso ou rota solicitada não existe ou foi transferido dentro da governança de identidades corporativas.
      </p>

      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
        >
          Retornar ao Catálogo Central
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </div>
  );
};
