'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';
import { coinbaseWallet } from 'wagmi/connectors';

// Contract addresses
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PHANTOM_WALLET = '9UHyMNK97R66s3ZhnQ1YtaqwhDCV1Q2zbHTcpeSK7k3B'; // Replace with actual Phantom company wallet address

interface ContributionFormProps {
  tokenId: string;
  onClose: () => void;
}

export function ContributionForm({ tokenId, onClose }: ContributionFormProps) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { data: walletClient } = useWalletClient();

  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'initial' | 'connecting' | 'approving' | 'transferring'>('initial');

  // Connect wallet if not already connected
  const handleConnect = async () => {
    try {
      setStatus('connecting');
      await connect({ 
        connector: coinbaseWallet({
          appName: 'Your App Name',
          jsonRpcUrl: process.env.NEXT_PUBLIC_RPC_URL
        })
      });
    } catch (err) {
      setError('Failed to connect wallet');
      setStatus('initial');
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      await handleConnect();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Convert amount to USDC units (6 decimals)
      const usdcAmount = parseUnits(amount, 6);

      // 1. Approve USDC transfer
      setStatus('approving');
      const approvalTx = await walletClient?.writeContract({
        address: USDC_ADDRESS,
        abi: ['function approve(address spender, uint256 amount) returns (bool)'],
        functionName: 'approve',
        args: [PHANTOM_WALLET, usdcAmount],
      });

      if (approvalTx) {
        await walletClient?.waitForTransactionReceipt({ hash: approvalTx });
      }

      // 2. Transfer USDC
      setStatus('transferring');
      const transferTx = await walletClient?.writeContract({
        address: USDC_ADDRESS,
        abi: ['function transfer(address recipient, uint256 amount) returns (bool)'],
        functionName: 'transfer',
        args: [PHANTOM_WALLET, usdcAmount],
      });

      if (transferTx) {
        await walletClient?.waitForTransactionReceipt({ hash: transferTx });
      }

      // Close modal after successful contribution
      onClose();
    } catch (err) {
      console.error('Contribution error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process contribution');
    } finally {
      setIsSubmitting(false);
      setStatus('initial');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Contribute USDC</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleContribute} className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
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
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter amount"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !amount}
          className={`w-full py-4 px-6 rounded-xl text-white font-medium transition-all
            ${isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'}
          `}
        >
          {status === 'initial' && !isConnected && 'Connect Wallet'}
          {status === 'initial' && isConnected && 'Confirm Contribution'}
          {status === 'connecting' && 'Connecting Wallet...'}
          {status === 'approving' && 'Approving USDC...'}
          {status === 'transferring' && 'Processing Transfer...'}
        </button>
      </form>

      {isConnected && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      )}
    </div>
  );
}