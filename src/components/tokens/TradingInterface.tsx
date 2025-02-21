'use client';

import { useState } from 'react';

interface TradingInterfaceProps {
  symbol: string;
}

export function TradingInterface({ symbol = 'DRP' }: TradingInterfaceProps) {
  const [amount, setAmount] = useState('0.00');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [activeButton, setActiveButton] = useState('');

  const handleAmountClick = (value: string) => {
    setAmount(value);
    setActiveButton(value);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex mb-4 gap-2">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-3 rounded-lg text-lg font-medium transition-colors ${
            side === 'buy' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-3 rounded-lg text-lg font-medium transition-colors ${
            side === 'sell' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          sell
        </button>
      </div>

      <div className="flex justify-between mb-4">
        <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition-colors">
          switch to goof
        </button>
        <button className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition-colors">
          set max slippage
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-gray-100 rounded-lg py-3 px-4 text-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0.00"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          <span className="text-xl text-gray-600 mr-2">{symbol}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => handleAmountClick('0')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeButton === '0'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          reset
        </button>
        <button 
          onClick={() => handleAmountClick('0.1')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeButton === '0.1'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          0.1 {symbol}
        </button>
        <button 
          onClick={() => handleAmountClick('0.5')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeButton === '0.5'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          0.5 {symbol}
        </button>
        <button 
          onClick={() => handleAmountClick('1')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeButton === '1'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          1 {symbol}
        </button>
        <button 
          onClick={() => handleAmountClick('max')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeButton === 'max'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          max
        </button>
      </div>

      <button 
        className="w-full py-4 rounded-lg text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-colors"
      >
        place trade
      </button>
    </div>
  );
} 