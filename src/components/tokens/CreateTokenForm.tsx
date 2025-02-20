'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createToken, createTokenWallet } from '@/lib/supabase/client';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createTokenMint } from '@/lib/solana/token';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function CreateTokenForm() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const name = formData.get('name') as string;
      const symbol = formData.get('symbol') as string;
      const description = formData.get('description') as string;
      const supply = formData.get('supply') as string;
      const price = formData.get('price') as string;

      // Create a new keypair for the token mint
      const mintKeypair = Keypair.generate();
      
      // Connect to Solana
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
      );

      // Create token mint
      const mintPubkey = await createTokenMint(
        connection,
        mintKeypair,
        publicKey,
        null, // No freeze authority
        6 // 6 decimals
      );

      // Create token in database
      const token = await createToken({
        name,
        symbol,
        description,
        total_supply: parseInt(supply),
        initial_price: parseFloat(price),
        token_address: mintPubkey.toString(),
        creator_wallet: publicKey.toString(),
      });

      // Create token wallet
      await createTokenWallet(token.id, publicKey.toString());

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

      {!connected ? (
        <div className="bg-white shadow-card rounded-lg p-8 text-center">
          <p className="text-lg text-gray-600 mb-6">
            Connect your wallet to create a token
          </p>
          <WalletMultiButton className="wallet-button !text-lg !py-4 !px-8" />
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