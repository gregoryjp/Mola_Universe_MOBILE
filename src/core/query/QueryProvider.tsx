import { QueryClientProvider } from '@tanstack/react-query';
import type { JSX, ReactNode } from 'react';
import { queryClient } from './queryClient';

export const QueryProvider = ({ children }: { children: ReactNode }): JSX.Element => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
