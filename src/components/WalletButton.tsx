'use client';

import { useWallet } from './ClientWalletProvider';

export function WalletButton() {
  const { address, isConnected, connect, disconnect } = useWallet();

  return (
    <button
      onClick={isConnected ? disconnect : connect}
      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-lg font-medium shadow-button hover:shadow-lg transition-smooth"
    >
      {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
    </button>
  );
} 