'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/ClientWalletProvider';
import { WalletButton } from '@/components/WalletButton';

export function CreateTokenForm() {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    try {
      if (!address) {
        setError('Please connect your wallet first');
        return;
      }

      setLoading(true);
      setError(null);

      const name = formData.get('name') as string;
      const symbol = formData.get('symbol') as string;
      const description = formData.get('description') as string;
      const supply = formData.get('supply') as string;
      const price = formData.get('price') as string;

      // Create token through API
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          symbol,
          description,
          initial_supply: parseInt(supply),
          target_raise: parseInt(supply) * parseFloat(price),
          price_per_token: parseFloat(price),
          creator_id: address,
          features: {
            burnable: false,
            mintable: false
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create token');
      }

      const token = await response.json();
      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating token:', err);
      setError(err instanceof Error ? err.message : 'Failed to create token');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Token</h1>
      <p className="text-lg text-gray-600 mb-8">Launch your tokenized trading strategy</p>

      {!isConnected ? (
        <div className="bg-white shadow-card rounded-lg p-8 text-center">
          <p className="text-lg text-gray-600 mb-6">
            Connect your wallet to create a token
          </p>
          <WalletButton />
        </div>
      ) : (
        <form action={handleSubmit} className="bg-white shadow-card rounded-lg p-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">
              Token Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg"
              placeholder="Enter token name"
            />
          </div>

          <div>
            <label htmlFor="symbol" className="block text-lg font-medium text-gray-700 mb-2">
              Token Symbol
            </label>
            <input
              type="text"
              name="symbol"
              id="symbol"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg"
              placeholder="e.g., BTC"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg"
              placeholder="Describe your trading strategy"
            />
          </div>

          <div>
            <label htmlFor="supply" className="block text-lg font-medium text-gray-700 mb-2">
              Total Supply
            </label>
            <input
              type="number"
              name="supply"
              id="supply"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg"
              placeholder="Enter total supply"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-lg font-medium text-gray-700 mb-2">
              Initial Price (in USDC)
            </label>
            <input
              type="number"
              name="price"
              id="price"
              step="0.000001"
              defaultValue="1"
              min="0.000001"
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg"
            />
            <p className="mt-2 text-base text-gray-500">Default price is 1 USDC per token</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-8 border border-transparent rounded-lg shadow-button text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Token'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 