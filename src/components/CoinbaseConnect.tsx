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
  useWallet,
} from '@coinbase/onchainkit/wallet'
import { Avatar, Name } from '@coinbase/onchainkit/identity'
import { parseUnits } from 'viem'

// USDC contract on Base Goerli
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

export function CoinbaseConnect() {
  const { isConnected, isConnecting, error } = useWallet()
  const [isDepositing, setIsDepositing] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

  const handleUSDCDeposit = async (amount: string) => {
    try {
      setIsDepositing(true)
      setTxError(null)
      
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
    } finally {
      setIsDepositing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Wallet>
        {/* Enhanced Connect Button with Loading & Error States */}
        <ConnectWallet 
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${isConnected 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-blue-500 hover:bg-blue-600'} 
            ${isConnecting ? 'opacity-70 cursor-wait' : 'text-white'}
            ${error ? 'bg-red-500' : ''}
          `}
        >
          {isConnecting ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Connecting...
            </div>
          ) : (
            <>
              <Avatar className="w-6 h-6 rounded-full" />
              <Name className="font-medium" />
            </>
          )}
        </ConnectWallet>

        {/* Advanced Wallet Features */}
        {isConnected && (
          <WalletAdvanced className="mt-6 p-6 bg-white rounded-lg shadow-lg">
            {/* Error Display */}
            {txError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                {txError}
              </div>
            )}

            {/* Wallet Actions */}
            <div className="space-y-6">
              <WalletAdvancedWalletActions 
                className="p-4 bg-gray-50 rounded-lg"
              />
              
              <WalletAdvancedAddressDetails 
                className="p-4 bg-gray-50 rounded-lg"
              />
              
              {/* USDC Deposit Section */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Deposit USDC</h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    className="flex-1 px-3 py-2 border rounded"
                    min="0"
                    step="0.01"
                    disabled={isDepositing}
                  />
                  <button
                    onClick={() => handleUSDCDeposit('100')} // Example amount
                    disabled={isDepositing}
                    className={`px-4 py-2 bg-blue-500 text-white rounded
                      ${isDepositing ? 'opacity-70 cursor-wait' : 'hover:bg-blue-600'}`}
                  >
                    {isDepositing ? 'Depositing...' : 'Deposit'}
                  </button>
                </div>
              </div>

              <WalletAdvancedTransactionActions 
                className="p-4 bg-gray-50 rounded-lg"
                onSend={async (tx) => {
                  try {
                    console.log('Sending transaction:', tx)
                    // Handle transaction sending
                  } catch (err) {
                    console.error('Transaction error:', err)
                    setTxError('Failed to send transaction')
                  }
                }}
                onCancel={async (tx) => {
                  try {
                    console.log('Cancelling transaction:', tx)
                    // Handle transaction cancellation
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
        )}
      </Wallet>
    </div>
  )
} 