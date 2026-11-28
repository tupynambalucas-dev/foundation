import React from 'react';
import { RouterProvider, useRouter } from './shared/router/useRouter';
import { Header } from './shared/ui/Header';
import { Footer } from './shared/ui/Footer';
import { AppCatalogView } from './features/app-catalog/AppCatalogView';
import { AppDetailView } from './features/app-detail/AppDetailView';
import { PrivacyView } from './features/legal-portal/PrivacyView';
import { TermsView } from './features/legal-portal/TermsView';
import { NotFoundView } from './features/not-found/NotFoundView';

const RouteRenderer: React.FC = () => {
  const { path } = useRouter();

  const normalizedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

  if (normalizedPath === '' || normalizedPath === '/') {
    return <AppCatalogView />;
  }

  if (normalizedPath === '/privacy' || normalizedPath === '/privacy.html') {
    return <PrivacyView />;
  }

  if (normalizedPath === '/terms' || normalizedPath === '/terms.html') {
    return <TermsView />;
  }

  if (
    normalizedPath === '/workspace' ||
    normalizedPath === '/workspace/index.html' ||
    normalizedPath === '/rclone' ||
    normalizedPath === '/rclone/index.html'
  ) {
    return <AppDetailView slug="org-workspace" />;
  }

  if (normalizedPath.startsWith('/apps/')) {
    const rawSlug = normalizedPath.slice('/apps/'.length).replace(/\.html$/, '');
    if (rawSlug.length > 0 && !rawSlug.includes('/')) {
      return <AppDetailView slug={rawSlug} />;
    }
  }

  return <NotFoundView />;
};

export const App: React.FC<{ initialPath?: string }> = ({ initialPath }) => {
  return (
    <RouterProvider initialPath={initialPath}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <RouteRenderer />
        </main>
        <Footer />
      </div>
    </RouterProvider>
  );
};

export default App;
