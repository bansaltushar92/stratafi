'use client';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { createContext, useContext } from 'react';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

export function ClientWalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAddress(accounts[0]);
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      alert('Please install MetaMask or another Ethereum wallet');
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  useEffect(() => {
    // Check if already connected
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAddress(accounts[0] || null);
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{
      address,
      isConnected: !!address,
      connect,
      disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  );
} 