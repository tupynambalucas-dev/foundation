import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: typeof window !== 'undefined' ? window.location.pathname : '/',
  navigate: () => {},
});

export const RouterProvider: React.FC<{ initialPath?: string; children: React.ReactNode }> = ({
  initialPath,
  children,
}) => {
  const [path, setPath] = useState(
    initialPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  );

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== to) {
      window.history.pushState(null, '', to);
      setPath(to);
      window.scrollTo(0, 0);
    }
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
};

export const useRouter = () => useContext(RouterContext);

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, children, className, onClick, ...props }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (to.startsWith('http://') || to.startsWith('https://')) {
      return; // Permite links externos normalmente
    }
    e.preventDefault();
    onClick?.(e);
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};
