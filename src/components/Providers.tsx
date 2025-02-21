'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { OnchainProvider } from '@coinbase/onchainkit'

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <OnchainProvider
        options={{
          appName: 'Stratafi',
          network: {
            chainId: 84532, // Base Goerli
            rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://goerli.base.org',
          },
          gas: {
            sponsorUserOperation: true,
            batchUserOperations: true,
          },
          onramp: {
            enableCardPayments: true,
            enableCoinbasePayments: true,
          },
          identity: {
            enableENS: true,
            enableAvatar: true,
          }
        }}
      >
        {children}
      </OnchainProvider>
    </QueryClientProvider>
  )
} 