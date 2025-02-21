'use client';

import { useTokens } from '@/hooks/useTokens';
import Link from 'next/link';

export default function DashboardPage() {
  const { tokens, loading, error } = useTokens({ limit: 10 });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Available Tokens</h1>
        <Link
          href="/dashboard/create"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium shadow-button hover:shadow-lg transition-smooth"
        >
          Create Token
        </Link>
      </div>

      <div className="space-y-4">
        {tokens.map((token) => (
          <Link
            key={token.id}
            href={`/dashboard/tokens/${token.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{token.name}</h2>
                <p className="text-gray-500">{token.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">
                  {token.amount_raised.toLocaleString()} / {token.target_raise.toLocaleString()} USDC
                </p>
                <p className="text-sm text-gray-500">
                  {((token.amount_raised / token.target_raise) * 100).toFixed(1)}% Raised
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((token.amount_raised / token.target_raise) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </Link>
        ))}

        {tokens.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tokens available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
} 