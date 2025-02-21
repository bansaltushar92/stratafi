'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { createConfig, WagmiConfig } from 'wagmi'
import { baseGoerli } from 'viem/chains'
import { http } from 'viem'

const queryClient = new QueryClient()

const config = createConfig({
  chains: [baseGoerli],
  transports: {
    [baseGoerli.id]: http('https://goerli.base.org'),
  }
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        {children}
      </WagmiConfig>
    </QueryClientProvider>
  )
} 