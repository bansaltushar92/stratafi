import { Token, TokenPrice } from '@/types/database';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TokenMetadataProps {
  token: Token;
  priceHistory: TokenPrice[];
}

export function TokenMetadata({ token, priceHistory }: TokenMetadataProps) {
  const progressPercentage = (token.amount_raised / token.target_raise) * 100;

  // Format price history data for the chart
  const chartData = priceHistory.map(price => ({
    date: new Date(price.timestamp).toLocaleDateString(),
    price: price.price
  }));

  return (
    <div className="space-y-6">
      {/* Price Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Price History</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fundraising Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Fundraising Progress</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Raised: ${token.amount_raised.toLocaleString()}</span>
            <span>Target: ${token.target_raise.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Token Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Token Distribution</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Available for Trading</span>
            <span className="text-sm font-medium text-gray-900">
              {(token.initial_supply * 0.7).toLocaleString()} {token.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Performance Based Reward</span>
            <span className="text-sm font-medium text-gray-900">
              {(token.initial_supply * 0.3).toLocaleString()} {token.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Supply</span>
            <span className="text-sm font-medium text-gray-900">
              {token.initial_supply.toLocaleString()} {token.symbol}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 