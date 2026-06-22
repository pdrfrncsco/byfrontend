import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure QueryClient with premium default values
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Avoid unexpected refetches on focus
      retry: 1,                    // Retry failed requests once
      staleTime: 5 * 60 * 1000,    // Consider data fresh for 5 minutes
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
