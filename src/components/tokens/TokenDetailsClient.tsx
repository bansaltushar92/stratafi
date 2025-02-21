'use client';

import { useState } from 'react';
import { ContributionForm } from './ContributeForm';

interface TokenDetailsClientProps {
  token: {
    id: string;
    name: string;
    symbol: string;
    description?: string;
    price_per_token?: number;
    total_supply?: number;
    amount_raised?: number;
    target_raise?: number;
    status?: string;
  };
  priceHistory: any[];
  holders: any[];
  contributions: any[];
  wallet: any;
  balance: any;
}

export function TokenDetailsClient({ 
  token,
  priceHistory,
  holders,
  contributions,
  wallet,
  balance
}: TokenDetailsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{token.name}</h1>
            <p className="text-xl text-gray-600">{token.symbol}</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Contribute
          </button>
        </div>

        {/* Token Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm text-gray-500">Price</h3>
            <p className="text-2xl font-semibold">${token.price_per_token?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm text-gray-500">Total Supply</h3>
            <p className="text-2xl font-semibold">{token.total_supply?.toLocaleString() || '0'}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm text-gray-500">Amount Raised</h3>
            <p className="text-2xl font-semibold">${token.amount_raised?.toLocaleString() || '0'}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm text-gray-500">Target Raise</h3>
            <p className="text-2xl font-semibold">${token.target_raise?.toLocaleString() || '0'}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-gray-600">{token.description || 'No description available.'}</p>
        </div>

        {/* Add more sections for price history, holders, etc. */}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <ContributionForm
                tokenId={token.id}
                onClose={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}