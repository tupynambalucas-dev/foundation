import React from 'react';
import { Link, useRouter } from '../router/useRouter';
import { ShieldCheckIcon, LayersIcon } from './Icons';

export const Header: React.FC = () => {
  const { path } = useRouter();

  const navItems = [
    { label: 'Catálogo de Apps', to: '/' },
    { label: 'Org Workspace', to: '/apps/org-workspace' },
    { label: 'Org Guardian', to: '/apps/org-guardian' },
    { label: 'Privacidade', to: '/privacy' },
    { label: 'Termos de Serviço', to: '/terms' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090d16]/80 border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:border-blue-500/60 transition-colors">
            <LayersIcon size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-100 tracking-tight text-base sm:text-lg">
              tupynambalucas<span className="text-blue-500">.dev</span>
            </span>
            <span className="text-xs font-mono text-slate-400 -mt-1">Identity & Trust Portal</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = path === item.to || (item.to !== '/' && path.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheckIcon size={14} />
            Edge Secured
          </span>
        </div>
      </div>
    </header>
  );
};
