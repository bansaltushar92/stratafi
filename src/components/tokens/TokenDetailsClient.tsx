'use client';

import { useState } from 'react';
import { Token } from '@/lib/types';
import { ContributionForm } from '@/components/tokens/ContributionForm';
import { TokenStats } from '@/components/tokens/TokenStats';
import { TokenPriceChart } from '@/components/tokens/TokenPriceChart';
import { TokenHolders } from '@/components/tokens/TokenHolders';
import { ContributionHistory } from '@/components/tokens/ContributionHistory';
import { VestingInfo } from '@/components/tokens/VestingInfo';
import { useWallet } from '@/components/ClientWalletProvider';

interface TokenDetailsClientProps {
  token: Token;
  priceHistory: any[];
  holders: any[];
  contributions: any[];
  wallet: any;
  balance: number | null;
}

export function TokenDetailsClient({
  token,
  priceHistory,
  holders,
  contributions,
  wallet,
  balance
}: TokenDetailsClientProps) {
  const { address, isConnected } = useWallet();
  const [isContributing, setIsContributing] = useState(false);

  const handleContribute = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setIsContributing(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{token.name}</h1>
            <p className="text-gray-600">{token.symbol}</p>
          </div>
          <button
            onClick={handleContribute}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-lg font-medium shadow-button hover:shadow-lg transition-smooth"
          >
            Contribute
          </button>
        </div>
        <p className="text-gray-700 mb-4">{token.description}</p>
        
        {isContributing && (
          <div className="mb-6">
            <ContributionForm
              tokenId={token.id}
              onClose={() => setIsContributing(false)}
              walletAddress={address}
            />
          </div>
        )}

        <TokenStats token={token} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Price History</h2>
          <TokenPriceChart data={priceHistory} />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Token Holders</h2>
          <TokenHolders holders={holders} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Contribution History</h2>
          <ContributionHistory contributions={contributions} />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Vesting Schedule</h2>
          <VestingInfo token={token} />
        </div>
      </div>
    </div>
  );
} 