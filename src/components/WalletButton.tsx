'use client';

import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton: FC = () => {
  const { publicKey } = useWallet();

  return (
    <div>
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700">
        {publicKey ? `${publicKey.toString().slice(0, 4)}...` : 'Connect Wallet'}
      </WalletMultiButton>
    </div>
  );
}; 