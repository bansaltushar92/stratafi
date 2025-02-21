'use client';

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

const generateMockTrades = (): Trade[] => {
  return [
    {
      id: 't1',
      type: 'buy',
      amount: 500,
      price: 1.05,
      total: 525,
      timestamp: '2024-02-20T14:30:00Z',
      status: 'completed'
    },
    {
      id: 't2',
      type: 'sell',
      amount: 200,
      price: 1.08,
      total: 216,
      timestamp: '2024-02-20T13:15:00Z',
      status: 'completed'
    },
    {
      id: 't3',
      type: 'buy',
      amount: 1000,
      price: 1.02,
      total: 1020,
      timestamp: '2024-02-20T10:45:00Z',
      status: 'completed'
    },
    {
      id: 't4',
      type: 'buy',
      amount: 300,
      price: 1.03,
      total: 309,
      timestamp: '2024-02-20T09:20:00Z',
      status: 'completed'
    },
    {
      id: 't5',
      type: 'sell',
      amount: 150,
      price: 1.07,
      total: 160.50,
      timestamp: '2024-02-19T16:45:00Z',
      status: 'completed'
    }
  ];
};

export function TradeHistory() {
  const trades = generateMockTrades();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Trade History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    trade.type === 'buy' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  {trade.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  ${trade.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  ${trade.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    trade.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : trade.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {trade.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 