'use client';

import { TokenDetailsClient } from '@/components/tokens/TokenDetailsClient';
import { TradingInterface } from '@/components/tokens/TradingInterface';
import { TradeHistory } from '@/components/tokens/TradeHistory';

// Hardcoded token data matching our My Tokens page
const MOCK_TOKEN_DATA = {
  'drp-1': {
    id: 'drp-1',
    name: "DRP Strategy Fund",
    symbol: "DRP",
    description: "Quantitative trading strategy focused on market neutral positions",
    amount_raised: 50000,
    target_raise: 100000,
    status: 'trading',
    creator_wallet: 'DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj'
  },
  'drp-2': {
    id: 'drp-2',
    name: "DRP Momentum Fund",
    symbol: "DRPM",
    description: "Trend following strategy across major cryptocurrencies",
    amount_raised: 75000,
    target_raise: 150000,
    status: 'fundraising',
    creator_wallet: 'DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj'
  },
  'akn-1': {
    id: 'akn-1',
    name: "AKN Quant Fund",
    symbol: "AKN",
    description: "AI-driven algorithmic trading strategy",
    amount_raised: 150000,
    target_raise: 200000,
    status: 'trading',
    creator_wallet: 'AKnL4NNf3DGWZJS6cPknBuEGnVsV4A4m5tgebLHaRSZ9'
  }
};

// Add owned token check
const isOwnedToken = (tokenId: string, walletAddress: string) => {
  const WALLET_TOKENS = {
    'DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj': ['drp-1', 'drp-2'],
    'AKnL4NNf3DGWZJS6cPknBuEGnVsV4A4m5tgebLHaRSZ9': ['akn-1']
  };
  
  return WALLET_TOKENS[walletAddress]?.includes(tokenId) || false;
};

export default function TokenDetailsPage({ params }: { params: { id: string } }) {
  const tokenId = params.id;
  const mockWallet = 'DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj';
  
  const tokenData = MOCK_TOKEN_DATA[tokenId as keyof typeof MOCK_TOKEN_DATA];

  if (!tokenData) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          Token not found
        </div>
      </div>
    );
  }

  // Mock data for other sections
  const priceData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    price: 100 + Math.random() * 20
  }));

  const holdersData = [
    { wallet: '0x1234...5678', balance: 1000, percentage: 25 },
    { wallet: '0x8765...4321', balance: 800, percentage: 20 },
  ];

  return (
    <>
      <TokenDetailsClient
        token={tokenData}
        priceHistory={priceData}
        holders={holdersData}
        contributions={[]}
        wallet={null}
        balance={null}
      />
      
      {isOwnedToken(tokenId, mockWallet) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-8 grid grid-cols-1 gap-4">
          <div>
            <TradingInterface symbol={tokenData.symbol} />
          </div>
          <div>
            <TradeHistory />
          </div>
        </div>
      )}
    </>
  );
} 