'use client';

import { useTokens } from '@/hooks/useTokens';
import Link from 'next/link';
import { CurrencyDollarIcon } from '@heroicons/react/24/solid';

export default function DashboardPage() {
  const { tokens, loading, error } = useTokens({ limit: 10 });

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
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
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Available Tokens</h1>
        <Link
          href="/dashboard/create"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
        >
          <span>Create Token</span>
          <span className="text-white/80 text-2xl">+</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tokens.map((token) => (
          <Link
            key={token.id}
            href={`/dashboard/tokens/${token.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-8 border border-gray-100 hover:border-indigo-100 hover:-translate-y-1 min-h-[250px] flex flex-col"
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-50 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <CurrencyDollarIcon className="text-indigo-600 w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {token.name}
                </h2>
                <p className="text-base text-gray-500 mt-1">{token.symbol}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-baseline">
                <p className="text-2xl font-medium text-gray-900">
                  {token.amount_raised.toLocaleString()}
                  <span className="text-base text-gray-500 ml-2">USDC</span>
                </p>
                <p className="text-lg font-medium text-gray-900">
                  of {token.target_raise.toLocaleString()}
                </p>
              </div>
              
              <div className="relative pt-1">
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out group-hover:shadow-sm"
                    style={{
                      width: `${Math.min((token.amount_raised / token.target_raise) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-right">
                  {((token.amount_raised / token.target_raise) * 100).toFixed(1)}% Raised
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {tokens.length === 0 && (
        <div className="text-center py-24 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500">No tokens available yet.</p>
          <p className="text-sm text-gray-400 mt-1">Create your first token to get started</p>
        </div>
      )}
    </div>
  );
} 