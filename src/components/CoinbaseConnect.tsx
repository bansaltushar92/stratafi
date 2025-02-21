'use client'

import { useState } from 'react'
import {
  ConnectWallet,
  Wallet,
  WalletAdvanced,
  WalletAdvancedAddressDetails,
  WalletAdvancedTokenHoldings,
  WalletAdvancedTransactionActions,
  WalletAdvancedWalletActions,
} from '@coinbase/onchainkit/wallet'
import { Avatar, Name } from '@coinbase/onchainkit/identity'
import { parseUnits } from 'viem'

// USDC contract on Base Goerli
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

export function CoinbaseConnect() {
  const [txError, setTxError] = useState<string | null>(null)

  const handleUSDCDeposit = async (amount: string) => {
    try {
      // Convert amount to USDC units (6 decimals)
      const value = parseUnits(amount, 6)
      
      // Create transaction batch
      const transactions = [
        {
          to: USDC_ADDRESS,
          value: value,
          data: '0x', // For simple transfers
        }
      ]

      // Send batch transaction
      const tx = await window.coinbaseWallet.request({
        method: 'eth_sendTransaction',
        params: [{ transactions }],
      })

      console.log('Deposit transaction:', tx)
    } catch (err) {
      console.error('Deposit error:', err)
      setTxError(err instanceof Error ? err.message : 'Failed to deposit USDC')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Wallet>
        <ConnectWallet 
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Avatar className="w-6 h-6 rounded-full" />
          <Name className="font-medium" />
        </ConnectWallet>

        <WalletAdvanced className="mt-6 p-6 bg-white rounded-lg shadow-lg">
          {txError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {txError}
            </div>
          )}

          <div className="space-y-6">
            <WalletAdvancedWalletActions 
              className="p-4 bg-gray-50 rounded-lg"
            />
            
            <WalletAdvancedAddressDetails 
              className="p-4 bg-gray-50 rounded-lg"
            />

            <WalletAdvancedTransactionActions 
              className="p-4 bg-gray-50 rounded-lg"
              onSend={async (tx) => {
                try {
                  console.log('Sending transaction:', tx)
                } catch (err) {
                  console.error('Transaction error:', err)
                  setTxError('Failed to send transaction')
                }
              }}
              onCancel={async (tx) => {
                try {
                  console.log('Cancelling transaction:', tx)
                } catch (err) {
                  console.error('Cancel error:', err)
                  setTxError('Failed to cancel transaction')
                }
              }}
            />
            
            <WalletAdvancedTokenHoldings 
              className="p-4 bg-gray-50 rounded-lg"
              tokens={[
                {
                  symbol: 'USDC',
                  address: USDC_ADDRESS,
                  decimals: 6
                }
              ]}
            />
          </div>
        </WalletAdvanced>
      </Wallet>
    </div>
  )
} 