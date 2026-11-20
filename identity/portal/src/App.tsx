import React from 'react';
import { RouterProvider, useRouter } from './shared/router/useRouter';
import { Header } from './shared/ui/Header';
import { Footer } from './shared/ui/Footer';
import { AppCatalogView } from './features/app-catalog/AppCatalogView';
import { RcloneView } from './features/rclone-portal/RcloneView';
import { WorkspaceView } from './features/workspace-portal/WorkspaceView';
import { PrivacyView } from './features/legal-portal/PrivacyView';
import { TermsView } from './features/legal-portal/TermsView';
import { NotFoundView } from './features/not-found/NotFoundView';

const RouteRenderer: React.FC = () => {
  const { path } = useRouter();

  const normalizedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

  switch (normalizedPath) {
    case '':
    case '/':
      return <AppCatalogView />;
    case '/privacy':
    case '/privacy.html':
      return <PrivacyView />;
    case '/terms':
    case '/terms.html':
      return <TermsView />;
    case '/rclone':
    case '/rclone/index.html':
      return <RcloneView />;
    case '/workspace':
    case '/workspace/index.html':
      return <WorkspaceView />;
    default:
      return <NotFoundView />;
  }
};

export const App: React.FC = () => {
  return (
    <RouterProvider>
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
