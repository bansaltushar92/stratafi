'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

// Generate realistic price data
const generatePriceData = () => {
  const data = [];
  let price = 1000;
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    price = price * (1 + (Math.random() - 0.48) * 0.02);
    
    data.push({
      date: date.toISOString(),
      price: parseFloat(price.toFixed(2))
    });
  }
  return data;
};

export function TokenPriceChart() {
  const data = generatePriceData();
  const lastPrice = data[data.length - 1]?.price || 0;

  return (
    <div className="bg-white rounded-lg p-3">
      <div className="text-3xl font-bold text-gray-900 mb-3">
        ${lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tick={{ fontSize: 12 }}
              tickCount={5}
              domain={['dataMin - 100', 'dataMax + 100']}
              width={65}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
              labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 