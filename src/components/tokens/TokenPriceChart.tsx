'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TokenPriceChartProps {
  data: Array<{
    timestamp: string;
    price: number;
  }>;
}

export function TokenPriceChart({ data }: TokenPriceChartProps) {
  const formattedData = data.map(point => ({
    ...point,
    timestamp: new Date(point.timestamp).toLocaleDateString(),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#4F46E5" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 