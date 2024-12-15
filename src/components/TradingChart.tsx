import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TradingChartProps {
  coinValue: number;
  showLine?: boolean;
}

export const TradingChart: React.FC<TradingChartProps> = ({ coinValue, showLine = true }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('line');
  
  const generateData = () => {
    const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const data = [];
    let currentValue = 0;
    
    for (let i = 0; i < months.length; i++) {
      currentValue += (coinValue / months.length);
      data.push({
        month: months[i],
        value: showLine ? Number(currentValue.toFixed(3)) : 0,
        investors: Math.floor((i + 1) * 20000)
      });
    }
    return data;
  };

  return (
    <div className="chart-container">
      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <button 
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded ${chartType === 'line' ? 'bg-accent' : 'bg-card'}`}
          >
            Line
          </button>
          <button 
            onClick={() => setChartType('candles')}
            className={`px-3 py-1 rounded ${chartType === 'candles' ? 'bg-accent' : 'bg-card'}`}
          >
            Candles
          </button>
        </div>
        <div className="space-x-2">
          {['5m', '15m', '30m', '1h', '1D', '1W', '1M'].map(time => (
            <button
              key={time}
              onClick={() => setTimeframe(time)}
              className={`px-3 py-1 rounded ${timeframe === time ? 'bg-accent' : 'bg-card'}`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={generateData()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            label={{ value: 'Investors', position: 'bottom' }}
          />
          <YAxis 
            domain={[0, Math.ceil(coinValue * 1.2 * 100) / 100]}
            tickFormatter={(value) => value.toFixed(3)}
          />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#4caf50" 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};