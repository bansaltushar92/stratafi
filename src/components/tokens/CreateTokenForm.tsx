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
      await createTokenWallet(token.id);

      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating token:', err);
      setError(err instanceof Error ? err.message : 'Failed to create token');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Create New Token</h1>

      {!connected ? (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <p className="text-sm text-gray-500 mb-4">
            Connect your wallet to create a token
          </p>
          <WalletMultiButton />
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Token Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
              Token Symbol
            </label>
            <input
              type="text"
              name="symbol"
              id="symbol"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="supply" className="block text-sm font-medium text-gray-700">
              Total Supply
            </label>
            <input
              type="number"
              name="supply"
              id="supply"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">Default price is 1 USDC per token</p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
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