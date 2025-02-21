'use client';

import { Token } from '@/lib/types';

interface TokenStatsProps {
  token: Token;
}

export function TokenStats({ token }: TokenStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-black">Target Raise</h3>
        <p className="mt-1 text-2xl font-semibold text-black">
          {token.target_raise.toLocaleString()} USDC
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-black">Amount Raised</h3>
        <p className="mt-1 text-2xl font-semibold text-black">
          {token.amount_raised.toLocaleString()} USDC
        </p>
        <p className="text-sm text-black">
          {((token.amount_raised / token.target_raise) * 100).toFixed(1)}% of target
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-black">Status</h3>
        <p className="mt-1 text-2xl font-semibold text-black">
          {token.status}
        </p>
      </div>
    </div>
  );
} 