'use client';

interface Holder {
  wallet: string;
  balance: number;
  percentage: number;
}

const generateHolderData = (): Holder[] => {
  return [
    {
      wallet: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      balance: 250000,
      percentage: 25.0
    },
    {
      wallet: '0x3Ed49f2Cf254eB53ACb8A4719444C0B51f3c96Df',
      balance: 180000,
      percentage: 18.0
    },
    {
      wallet: '0xDc49A46AEa139B98C9Cd8c4a0F337c3B835d0d7C',
      balance: 150000,
      percentage: 15.0
    },
    {
      wallet: '0x4F6742bADB049791CD9A37ea913f2BAC38d01279',
      balance: 120000,
      percentage: 12.0
    },
    {
      wallet: '0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2',
      balance: 100000,
      percentage: 10.0
    },
    {
      wallet: 'Other Holders',
      balance: 200000,
      percentage: 20.0
    }
  ];
};

export function TokenHolders() {
  const holders = generateHolderData();
  
  const formatWallet = (wallet: string) => {
    if (wallet === 'Other Holders') return wallet;
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg p-3">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 text-sm font-medium text-gray-500">
              WALLET
            </th>
            <th className="text-right py-3 text-sm font-medium text-gray-500">
              BALANCE
            </th>
            <th className="text-right py-3 text-sm font-medium text-gray-500">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {holders.map((holder, index) => (
            <tr 
              key={holder.wallet}
              className={`
                ${index !== holders.length - 1 ? 'border-b border-gray-100' : ''}
                hover:bg-gray-50 transition-colors
              `}
            >
              <td className="py-4">
                <div className="flex items-center">
                  <span className={`
                    ${holder.wallet === 'Other Holders' ? 'text-gray-500' : 'text-gray-900'}
                    text-sm font-medium
                  `}>
                    {formatWallet(holder.wallet)}
                  </span>
                </div>
              </td>
              <td className="text-right py-4 text-gray-900">
                <span className="text-base font-semibold">
                  {formatBalance(holder.balance)}
                </span>
              </td>
              <td className="text-right py-4 text-gray-900">
                <span className="text-base font-semibold">
                  {holder.percentage.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 