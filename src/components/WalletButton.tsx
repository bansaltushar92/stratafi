'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleClick = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect({ connector: coinbaseWallet() });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-button hover:shadow-lg transition-smooth"
    >
      {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
    </button>
  );
} 