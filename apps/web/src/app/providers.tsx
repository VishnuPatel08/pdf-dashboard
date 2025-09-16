'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode, useEffect } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: false, // Disable retries during SSR
          },
          mutations: {
            retry: false, // Disable retries during SSR
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <DevTools />}
    </QueryClientProvider>
  );
}

// Separate component for DevTools with error boundary
function DevTools() {
  const [mounted, setMounted] = useState(false);
  const [DevtoolsComponent, setDevtoolsComponent] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Load devtools asynchronously
    import('@tanstack/react-query-devtools')
      .then((mod) => {
        setDevtoolsComponent(() => mod.ReactQueryDevtools);
      })
      .catch((err) => {
        console.warn('React Query DevTools failed to load:', err);
      });
  }, []);

  if (!mounted || !DevtoolsComponent) {
    return null;
  }

  try {
    return <DevtoolsComponent initialIsOpen={false} />;
  } catch (error) {
    console.warn('React Query DevTools error:', error);
    return null;
  }
}
