'use client';

import { useState } from 'react'
import { ContributionForm } from './ContributeForm'
import Link from 'next/link';
import { CurrencyDollarIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface TokenCardProps {
  token: {
    id: string;
    name: string;
    symbol: string;
    description: string;
    total_supply: number;
    price_per_token: number;
    amount_raised: number;
    target_raise: number;
    status: string;
  };
}

export function TokenCard({ token }: TokenCardProps) {
  const [showContributeModal, setShowContributeModal] = useState(false)

  const handleContributeClick = () => {
    setShowContributeModal(true)
  }

  const progressPercentage = (token.amount_raised / token.target_raise) * 100;

  return (
    <Link 
      href={`/dashboard/tokens/${token.id}`}
      className="block transition-all hover:transform hover:scale-[1.02]"
    >
      <div className="bg-white rounded-lg shadow-card hover:shadow-card-hover transition-smooth p-6 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{token.name}</h3>
            <p className="text-sm text-secondary-500">{token.symbol}</p>
          </div>
          <div className="p-2 bg-primary-50 rounded-full">
            <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
          </div>
        </div>

        <p className="text-secondary-600 mb-4 line-clamp-2">{token.description}</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-secondary-600">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Price</span>
            </div>
            <span className="font-medium">${token.price_per_token}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-secondary-600">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Supply</span>
            </div>
            <span className="font-medium">
              {token.total_supply?.toLocaleString() ?? '0'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-600">Raised</span>
              <span className="font-medium">${token.amount_raised.toLocaleString()} / ${token.target_raise.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${token.status === 'fundraising' ? 'bg-primary-100 text-primary-700' : 
                token.status === 'active' ? 'bg-green-100 text-green-700' : 
                'bg-secondary-100 text-secondary-700'}
            `}>
              {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleContributeClick();
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Contribute
          </button>
        </div>
      </div>

      {showContributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ContributionForm 
            tokenId={token.id} 
            onClose={() => setShowContributeModal(false)} 
          />
        </div>
      )}
    </Link>
  );
} 