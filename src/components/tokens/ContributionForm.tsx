'use client';

import { useState } from 'react';

interface ContributionFormProps {
  tokenId: string;
  onClose: () => void;
  walletAddress?: string;
}

export function ContributionForm({ tokenId, onClose, walletAddress }: ContributionFormProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/tokens/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'solana-wallet': walletAddress
        },
        body: JSON.stringify({
          tokenId,
          amount: parseFloat(amount),
          walletAddress
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process contribution');
      }

      alert('Contribution successful!');
      onClose();
    } catch (error) {
      console.error('Contribution error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Contribute USDC</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (USDC)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter amount"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !amount || !walletAddress}
            className={`w-full flex justify-center py-4 px-8 border border-transparent rounded-lg shadow-button text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Contributing...' : 'Contribute'}
          </button>
        </div>
      </form>
    </div>
  );
} 