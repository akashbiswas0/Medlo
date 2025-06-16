'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { TomoEVMKitProvider } from '@tomo-inc/tomo-evm-kit';
import { config } from '@/lib/tomo-config';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TomoEVMKitProvider>
          {children}
        </TomoEVMKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 