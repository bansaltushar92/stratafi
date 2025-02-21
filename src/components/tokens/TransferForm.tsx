'use client';

import { useState } from 'react';
import { useWallet } from '@/components/ClientWalletProvider';
import { WalletButton } from '@/components/WalletButton';

interface TransferFormProps {
  tokenId: string;
  onClose: () => void;
  walletAddress?: string;
}

export function TransferForm({ tokenId, onClose, walletAddress }: TransferFormProps) {
  const { isConnected } = useWallet();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/tokens/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tokenId,
          amount: parseFloat(amount),
          fromAddress: walletAddress,
          toAddress: recipient
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process transfer');
      }

      alert('Transfer successful!');
      onClose();
    } catch (error) {
      console.error('Transfer error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Transfer Tokens</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      {!isConnected ? (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">Connect your wallet to transfer tokens</p>
          <WalletButton />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter recipient's Ethereum address"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
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
              disabled={isSubmitting || !amount || !recipient || !walletAddress}
              className={`w-full flex justify-center py-4 px-8 border border-transparent rounded-lg shadow-button text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Transferring...' : 'Transfer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 