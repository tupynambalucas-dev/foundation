import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  PORTAL_APPS_CATALOG,
  PRIVACY_CONTENT,
  TERMS_CONTENT,
} from '@tupynambalucas-dev/identity-portal-core';
import App from '../src/App';

interface PrerenderTarget {
  route: string;
  outFile: string;
  title: string;
  description: string;
  expectedHeading: string;
}

const SCRIPT_DIR = import.meta.dirname;
const DIST_DIR = path.resolve(SCRIPT_DIR, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTargets(): PrerenderTarget[] {
  const workspaceApp = PORTAL_APPS_CATALOG.find((a) => a.slug === 'org-workspace');
  const workspaceTitle = workspaceApp?.name || 'tupynambalucas-org-workspace';
  const workspaceDesc =
    workspaceApp?.description ||
    'Plataforma central Google Workspace e Cloud da organizacao tupynambalucas-dev.';

  const targets: PrerenderTarget[] = [
    {
      route: '/',
      outFile: 'index.html',
      title: 'tupynambalucas-dev | Identity & Trust Portal',
      description:
        'Central corporativa de identidades, aplicacoes soberanas, termos de servico e politicas de privacidade da organizacao tupynambalucas-dev.',
      expectedHeading: 'Aplicações Corporativas',
    },
    {
      route: '/privacy',
      outFile: 'privacy.html',
      title: `${PRIVACY_CONTENT.title} | tupynambalucas.dev`,
      description:
        'Politica de Privacidade e Protecao de Dados da organizacao tupynambalucas-dev em conformidade com LGPD, GDPR e Google API Services User Data Policy.',
      expectedHeading: PRIVACY_CONTENT.title,
    },
    {
      route: '/terms',
      outFile: 'terms.html',
      title: `${TERMS_CONTENT.title} | tupynambalucas.dev`,
      description:
        'Termos de Servico para aplicacoes, ferramentas CLI e APIs da organizacao tupynambalucas-dev.',
      expectedHeading: TERMS_CONTENT.title,
    },
    {
      route: '/workspace',
      outFile: 'workspace.html',
      title: `${workspaceTitle} | tupynambalucas.dev`,
      description: workspaceDesc,
      expectedHeading: workspaceTitle,
    },
    {
      route: '/rclone',
      outFile: 'rclone.html',
      title: `${workspaceTitle} | tupynambalucas.dev`,
      description: workspaceDesc,
      expectedHeading: workspaceTitle,
    },
  ];

  for (const app of PORTAL_APPS_CATALOG) {
    targets.push({
      route: `/apps/${app.slug}`,
      outFile: `apps/${app.slug}.html`,
      title: `${app.name} | tupynambalucas.dev`,
      description: app.description,
      expectedHeading: app.name,
    });
  }

  return targets;
}

function main(): void {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`[prerender] Missing Vite build template at ${TEMPLATE_PATH}`);
  }
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const targets = buildTargets();

  for (const target of targets) {
    const renderedHtml = renderToString(React.createElement(App, { initialPath: target.route }));

    if (!renderedHtml.includes(escapeHtml(target.expectedHeading)) && !renderedHtml.includes(target.expectedHeading)) {
      throw new Error(
        `[prerender] Route ${target.route} failed heading assertion (expected "${target.expectedHeading}").`
      );
    }
    if (!renderedHtml.includes('/privacy')) {
      throw new Error(`[prerender] Route ${target.route} is missing required /privacy anchor.`);
    }

    const withRoot = template.replace('<div id="root"></div>', `<div id="root">${renderedHtml}</div>`);
    const withTitle = withRoot.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(target.title)}</title>`);
    const withMeta = withTitle.replace(
      /<meta name="description" content="[^"]*"\s*\/>/i,
      `<meta name="description" content="${escapeHtml(target.description)}" />`
    );

    const outPath = path.join(DIST_DIR, target.outFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, withMeta, 'utf8');
  }

  console.log(`[prerender] Generated ${targets.length} static SSG HTML files under ${DIST_DIR}`);
}

main();
