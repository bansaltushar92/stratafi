'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Token } from '@/types/database';

interface ContributeFormProps {
  token: Token;
  onContribute: (amount: number) => Promise<void>;
}

export function ContributeForm({ token, onContribute }: ContributeFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wallet = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (numAmount < 1) {
        throw new Error('Minimum contribution is 1 USDC');
      }

      const remainingToRaise = token.target_raise - token.amount_raised;
      if (numAmount > remainingToRaise) {
        throw new Error(`Maximum contribution at this time is ${remainingToRaise} USDC`);
      }

      await onContribute(numAmount);
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (token.status !== 'fundraising') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Contribute</h2>
      {!wallet.connected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to contribute</p>
          <WalletMultiButton className="wallet-button !text-lg !py-4 !px-8" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-900">
              Amount (USDC)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-700 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md text-gray-900"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                step="0.01"
                min="1"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-700 sm:text-sm">USDC</span>
              </div>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              You will receive approximately {amount ? (parseFloat(amount) / token.price_per_token).toFixed(2) : '0'} {token.symbol}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Token Price</span>
            <span>${token.price_per_token}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Remaining to Raise</span>
            <span>${(token.target_raise - token.amount_raised).toLocaleString()}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-4 px-8 border border-transparent rounded-lg shadow-button text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Contributing...' : 'Contribute'}
          </button>
        </form>
      )}
    </div>
  );
} 