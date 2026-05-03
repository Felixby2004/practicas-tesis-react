'use client';

import { TRPCProvider } from '@/lib/trpc/provider';
import { ThemeProvider } from '@/lib/theme-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TRPCProvider>
        {children}
      </TRPCProvider>
    </ThemeProvider>
  );
}