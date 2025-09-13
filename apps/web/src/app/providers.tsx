'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

const ReactQueryDevtools = 
  process.env.NODE_ENV === 'development' 
    ? require('@tanstack/react-query-devtools').ReactQueryDevtools 
    : () => null;

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
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
