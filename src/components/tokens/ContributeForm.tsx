'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { parseUnits } from 'viem';

// USDC contract on Base Goerli
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
// STRAT token contract
const STRAT_ADDRESS = '0x643b4995e6d0f1c5e31a062838777cc2ab670185';

// Placeholder ABI - Replace with actual ABI
const STRAT_ABI = [
  // USDC approval function
  'function approve(address spender, uint256 amount) external returns (bool)',
  // Contribute/Swap function
  'function contribute(uint256 amount) external returns (bool)',
  // Optional: Check allowance
  'function allowance(address owner, address spender) external view returns (uint256)'
];

const USDC_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)'
];

interface ContributionFormProps {
  tokenId: string;
  onClose: () => void;
}

export function ContributionForm({ tokenId, onClose }: ContributionFormProps) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'initial' | 'approving' | 'contributing'>('initial');

  // Check wallet connection on mount
  useEffect(() => {
    if (!isConnected && window.ethereum) {
      connect();
    }
  }, [isConnected, connect]);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      // Convert amount to USDC units (6 decimals)
      const usdcAmount = parseUnits(amount, 6);
      
      // Step 1: Approve USDC
      setStep('approving');
      const approvalData = {
        to: USDC_ADDRESS,
        from: address,
        data: `0x095ea7b3${STRAT_ADDRESS.slice(2).padStart(64, '0')}${usdcAmount.toString(16).padStart(64, '0')}`,
        gasLimit: '100000' // Adjust as needed
      };

      const approveTx = await window.coinbaseWallet.request({
        method: 'eth_sendTransaction',
        params: [approvalData]
      });

      // Wait for approval confirmation
      let receipt = null;
      while (!receipt) {
        receipt = await window.coinbaseWallet.request({
          method: 'eth_getTransactionReceipt',
          params: [approveTx]
        });
        if (!receipt) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Step 2: Contribute/Swap
      setStep('contributing');
      // Using same amount since exchange rate is 1:1
      const contributeData = {
        to: STRAT_ADDRESS,
        from: address,
        data: `0x${Buffer.from('contribute(uint256)').toString('hex').slice(0, 8)}${usdcAmount.toString(16).padStart(64, '0')}`,
        gasLimit: '200000' // Adjust as needed
      };

      const contributeTx = await window.coinbaseWallet.request({
        method: 'eth_sendTransaction',
        params: [contributeData]
      });

      // Wait for contribution confirmation
      receipt = null;
      while (!receipt) {
        receipt = await window.coinbaseWallet.request({
          method: 'eth_getTransactionReceipt',
          params: [contributeTx]
        });
        if (!receipt) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Add STRAT token to Coinbase Wallet
      await window.coinbaseWallet.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: STRAT_ADDRESS,
            symbol: 'STRAT',
            decimals: 18, // Adjust if different
            image: '' // Add token image URL if available
          }
        }
      });

      onClose();
    } catch (err) {
      console.error('Contribution error:', err);
      setError(err instanceof Error ? err.message : 'Failed to contribute');
    } finally {
      setIsSubmitting(false);
      setStep('initial');
    }
  };

  const getButtonText = () => {
    if (isSubmitting) {
      switch (step) {
        case 'approving':
          return 'Approving USDC...';
        case 'contributing':
          return 'Contributing...';
        default:
          return 'Processing...';
      }
    }
    return 'Contribute';
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-black">Contribute USDC</h3>
        <button
          onClick={onClose}
          className="text-black hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleContribute} className="space-y-6">
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-black mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-400"
            placeholder="Enter amount"
          />
          {amount && (
            <p className="mt-1 text-sm text-black">
              You will receive: {amount} STRAT
            </p>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !amount}
          className={`w-full flex justify-center py-4 px-8 border border-transparent rounded-lg shadow-button text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {getButtonText()}
        </button>
      </form>
    </div>
  );
} 