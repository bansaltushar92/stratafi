'use client';

import { Token } from '@/lib/types';

interface TokenStatsProps {
  token: Token;
}

export function TokenStats({ token }: TokenStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Target Raise</h3>
        <p className="mt-1 text-2xl font-semibold text-gray-900">
          {token.target_raise.toLocaleString()} USDC
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Amount Raised</h3>
        <p className="mt-1 text-2xl font-semibold text-gray-900">
          {token.amount_raised.toLocaleString()} USDC
        </p>
        <p className="text-sm text-gray-500">
          {((token.amount_raised / token.target_raise) * 100).toFixed(1)}% of target
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Status</h3>
        <p className="mt-1 text-2xl font-semibold text-gray-900">
          {token.status}
        </p>
      </div>
    </div>
  );
} 