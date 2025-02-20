'use client';

import { Token } from '@/lib/types';

interface VestingInfoProps {
  token: Token;
}

export function VestingInfo({ token }: VestingInfoProps) {
  // This is a placeholder component. You'll need to implement the actual vesting schedule logic
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Initial Release</h3>
        <p className="mt-1 text-sm text-gray-900">20% at token generation event (TGE)</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Vesting Period</h3>
        <p className="mt-1 text-sm text-gray-900">12 months linear vesting</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Cliff Period</h3>
        <p className="mt-1 text-sm text-gray-900">1 month after TGE</p>
      </div>
    </div>
  );
} 