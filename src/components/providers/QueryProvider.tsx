/**
 * React Query Provider Component
 * Provides query client to the app with dev tools
 */

'use client';

import { useState } from 'react';
import {
  QueryClientProvider,
  ReactQueryDevtools,
  createQueryClient,
} from '@/lib/query/client';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create client once per browser session
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;
