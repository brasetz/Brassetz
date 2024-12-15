import React, { useState } from 'react';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TradingChartProps {
  coinValue: number;
  showLine?: boolean;
}

export const TradingChart: React.FC<TradingChartProps> = ({ coinValue, showLine = true }) => {
  const [timeframe, setTimeframe] = useState('1D');
  
  const generateData = () => {
    let dataPoints;
    let format;
    
    switch(timeframe) {
      case '5m':
        dataPoints = 12;
        format = 'min';
        break;
      case '15m':
        dataPoints = 16;
        format = 'min';
        break;
      case '30m':
        dataPoints = 24;
        format = 'min';
        break;
      case '1h':
        dataPoints = 60;
        format = 'min';
        break;
      case '1D':
        dataPoints = 24;
        format = 'hour';
        break;
      case '1W':
        dataPoints = 7;
        format = 'day';
        break;
      case '1M':
        dataPoints = 30;
        format = 'day';
        break;
      default:
        dataPoints = 30;
        format = 'day';
    }

    const data = [];
    let currentValue = 0;
    
    for (let i = 0; i < dataPoints; i++) {
      currentValue += (coinValue / dataPoints);
      let label;
      if (format === 'min') {
        label = `${i * parseInt(timeframe)}m`;
      } else if (format === 'hour') {
        label = `${i}h`;
      } else {
        label = `${i + 1}d`;
      }
      
      data.push({
        time: label,
        value: showLine ? Number(currentValue.toFixed(3)) : 0,
        investors: Math.floor((i + 1) * (100000 / dataPoints))
      });
    }
    return data;
  };

  const formatYAxisTick = (value: number) => {
    // Convert price values to simplified numbers (e.g., 0.015 -> 3, 0.020 -> 4)
    const priceMultiplier = 200; // This will convert 0.015 to 3, 0.020 to 4, etc.
    return Math.round(value * priceMultiplier);
  };

  return (
    <div className="chart-container">
      <div className="flex justify-between mb-4">
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
            dataKey="time" 
            label={{ value: 'Time', position: 'bottom' }}
          />
          <YAxis 
            yAxisId="price"
            orientation="right"
            domain={[0, Math.ceil(coinValue * 1.2 * 100) / 100]}
            tickFormatter={(value) => value.toFixed(3)}
          />
          <YAxis 
            yAxisId="investors"
            orientation="left"
            domain={[0, 100000]}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip />
          <Line 
            yAxisId="price"
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