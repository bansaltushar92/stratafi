'use client';

import { useState } from 'react';
import { TokenWallet } from '@/types/database';
import { calculateVestedAmount } from '@/lib/tokens/vesting';

interface VestingInfoProps {
  wallet: TokenWallet;
  onRelease?: () => void;
}

export function VestingInfo({ wallet, onRelease }: VestingInfoProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vesting = calculateVestedAmount(wallet);
  const hasVestedTokens = vesting.nextRelease && vesting.nextRelease.amount > 0;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRelease = async () => {
    if (!hasVestedTokens) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tokens/vesting/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: wallet.token_id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to release tokens');
      }

      onRelease?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release tokens');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.vesting_schedule) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Vesting Schedule</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Locked Balance</span>
          <span className="text-sm font-medium text-gray-900">
            {wallet.locked_balance.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Vested</span>
          <span className="text-sm font-medium text-gray-900">
            {vesting.totalVested.toLocaleString()}
          </span>
        </div>

        {wallet.vesting_schedule && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vesting Start</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(new Date(wallet.vesting_start!))}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vesting End</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(new Date(wallet.vesting_end!))}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Release Frequency</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {wallet.vesting_schedule.release_frequency}
              </span>
            </div>
          </>
        )}

        {vesting.nextRelease && (
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Next Release</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {vesting.nextRelease.amount.toLocaleString()} tokens
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(vesting.nextRelease.date)}
                </div>
              </div>
            </div>

            <button
              onClick={handleRelease}
              disabled={!hasVestedTokens || loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Release Tokens'}
            </button>

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 