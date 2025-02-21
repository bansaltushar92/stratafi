'use client'

import { createConfig, WagmiConfig } from 'wagmi'
import { baseGoerli } from 'viem/chains'
import { http } from 'viem'
import { ReactNode } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { SmartWallet } from '@coinbase/smart-wallet-sdk'

export function WagmiProvider({ children }: { children: ReactNode }) {
  // Initialize Coinbase Wallet SDK
  const coinbaseWalletSDK = new CoinbaseWalletSDK({
    appName: 'Stratafi',
    appLogoUrl: '', // Add your logo URL
    darkMode: false
  })

  // Initialize Smart Wallet SDK with Account Abstraction
  const smartWallet = new SmartWallet({
    chain: baseGoerli.id,
    wallet: coinbaseWalletSDK,
    transport: {
      rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://goerli.base.org',
    },
    // Smart Account configuration
    account: {
      // This enables gasless transactions
      sponsorUserOperation: true,
      // This enables batching multiple transactions
      batchUserOperations: true,
    }
  })

  const config = createConfig({
    chains: [baseGoerli],
    connectors: [smartWallet.connector],
    transports: {
      [baseGoerli.id]: http('https://goerli.base.org'),
    }
  })

  console.log('WagmiProvider initialized with:', {
    chains: [baseGoerli],
    connectorId: smartWallet.connector.id,
    hasProvider: !!window.ethereum,
    availableConnectors: config.connectors
  })

  return <WagmiConfig config={config}>{children}</WagmiConfig>
} 