'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Token } from '@/types/database';

interface TransferFormProps {
  token: Token;
}

export function TransferForm({ token }: TransferFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wallet = useWallet();

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!wallet.publicKey) {
        throw new Error('Please connect your wallet first');
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Call the transfer API
      const response = await fetch('/api/tokens/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: token.id,
          amount: numAmount,
          fromWallet: wallet.publicKey.toString(),
          toWallet: token.treasury_wallet // Transfer to treasury wallet
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transfer failed');
      }

      setAmount('');
      // You might want to refresh token data here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Transfer {token.symbol}</h2>
      {!wallet.connected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to transfer tokens</p>
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
        </div>
      ) : (
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label htmlFor="transfer-amount" className="block text-sm font-medium text-gray-900">
              Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="transfer-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.000001"
                required
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{token.symbol}</span>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Transfer'}
          </button>
        </form>
      )}
    </div>
  );
} 