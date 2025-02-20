'use client';

interface TokenHolder {
  wallet_address: string;
  balance: number;
  percentage: number;
}

interface TokenHoldersProps {
  holders: TokenHolder[];
}

export function TokenHolders({ holders }: TokenHoldersProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Wallet
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              %
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {holders.map((holder, index) => (
            <tr key={holder.wallet_address}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {holder.wallet_address.slice(0, 4)}...{holder.wallet_address.slice(-4)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {holder.balance.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {holder.percentage.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 