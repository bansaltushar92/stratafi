'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Token, TokenPrice, TokenHolder, Contribution, TokenWallet } from '@/types/database';
import { TokenMetadata } from '@/components/tokens/TokenMetadata';
import { ContributeForm } from '@/components/tokens/ContributeForm';
import { TransferForm } from '@/components/tokens/TransferForm';
import { VestingInfo } from '@/components/tokens/VestingInfo';
import { getToken, getTokenContributions } from '@/lib/supabase/client';
import { useAuth } from '@clerk/nextjs';

interface TokenDetailsClientProps {
  token: Token;
  priceHistory: TokenPrice[];
  holders: TokenHolder[];
  contributions: Contribution[];
  wallet: TokenWallet | null;
  balance: number | null;
}

export function TokenDetailsClient({ 
  token: initialToken,
  priceHistory,
  holders,
  contributions: initialContributions,
  wallet,
  balance
}: TokenDetailsClientProps) {
  const { publicKey } = useWallet();
  const { getToken } = useAuth();
  const [token, setToken] = useState(initialToken);
  const [contributions, setContributions] = useState(initialContributions);

  const handleContribute = async (amount: number) => {
    try {
      if (!publicKey) {
        throw new Error('Please connect your wallet first');
      }

      // Get the session token from Clerk
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/tokens/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tokenId: initialToken.id,
          amount,
          walletAddress: publicKey.toString()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process contribution');
      }

      const result = await response.json();

      // Update local state with the response data
      if (result.token) {
        setToken(result.token);
      }

      if (result.contribution) {
        setContributions(prev => [result.contribution, ...prev]);
      }

    } catch (error) {
      console.error('Contribution error:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Token Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{token.name}</h1>
                <p className="text-gray-500">{token.symbol}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Status</div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                  {token.status}
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-600">{token.description}</p>
          </div>

          <TokenMetadata token={token} priceHistory={priceHistory} />
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          <ContributeForm token={token} onContribute={handleContribute} />
          
          {wallet && (
            <>
              <TransferForm token={token} />
              <VestingInfo wallet={wallet} />
            </>
          )}
        </div>
      </div>
    </div>
  );
} 