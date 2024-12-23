import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend } from 'recharts';
import { Button } from './ui/button';

interface TradingChartProps {
  coinValue: number;
  showLine?: boolean;
}

export const TradingChart: React.FC<TradingChartProps> = ({ coinValue, showLine = true }) => {
  const [timeframe, setTimeframe] = useState('5m');
  const [currentPrice, setCurrentPrice] = useState(coinValue);
  const [priceChange, setPriceChange] = useState({ value: 0.005, percentage: 1.45 });
  
  const generateData = () => {
    let dataPoints;
    let format;
    
    switch(timeframe) {
      case '5m':
        dataPoints = 60;
        format = 'min';
        break;
      case '15m':
        dataPoints = 40;
        format = 'min';
        break;
      case '30m':
        dataPoints = 30;
        format = 'min';
        break;
      case '1h':
        dataPoints = 24;
        format = 'hour';
        break;
      case '4h':
        dataPoints = 12;
        format = 'hour';
        break;
      case '1D':
        dataPoints = 30;
        format = 'day';
        break;
      case '1W':
        dataPoints = 52;
        format = 'week';
        break;
      default:
        dataPoints = 60;
        format = 'min';
    }

    const data = [];
    let value = 0;
    
    for (let i = 0; i < dataPoints; i++) {
      value += 0.001 * (1 + Math.random() * 0.5);
      
      let label;
      if (format === 'min') {
        label = `${i * parseInt(timeframe)}m`;
      } else if (format === 'hour') {
        label = `${i}h`;
      } else if (format === 'day') {
        label = `${i + 1}d`;
      } else {
        label = `W${i + 1}`;
      }
      
      const volume = Math.floor(Math.random() * 1000) + 100;
      
      data.push({
        time: label,
        value: showLine ? Number(value.toFixed(3)) : 0,
        volume
      });
    }

    // Update current price
    setCurrentPrice(value);
    return data;
  };

  return (
    <div className="chart-container">
      <div className="price-info">
        <div className="price-item">
          <span className="price-label">BTZ/USD</span>
          <span className="price-value">{currentPrice.toFixed(3)}</span>
        </div>
        <div className="price-item">
          <span className="price-label">24h Change</span>
          <span className="price-value" style={{ color: '#22c55e' }}>
            +{priceChange.value} (+{priceChange.percentage}%)
          </span>
        </div>
        <div className="price-item">
          <span className="price-label">24h High</span>
          <span className="price-value">{(currentPrice + 0.001).toFixed(3)}</span>
        </div>
        <div className="price-item">
          <span className="price-label">24h Low</span>
          <span className="price-value">{(currentPrice - 0.004).toFixed(3)}</span>
        </div>
      </div>

      <div className="timeframe-selector mb-6">
        {['5m', '15m', '30m', '1h', '4h', '1D', '1W'].map(time => (
          <button
            key={time}
            onClick={() => setTimeframe(time)}
            className={`timeframe-btn ${timeframe === time ? 'active' : ''}`}
          >
            {time}
          </button>
        ))}
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={generateData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="#787b86"
              tick={{ fill: '#787b86' }}
            />
            <YAxis 
              yAxisId="price"
              orientation="right"
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(3)}
              stroke="#787b86"
              tick={{ fill: '#787b86' }}
            />
            <YAxis 
              yAxisId="volume"
              orientation="left"
              domain={[0, 'dataMax']}
              stroke="#787b86"
              tick={{ fill: '#787b86' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(19, 23, 34, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px'
              }}
              labelStyle={{ color: '#d1d4dc' }}
              itemStyle={{ color: '#d1d4dc' }}
            />
            <Line 
              yAxisId="price"
              type="monotone" 
              dataKey="value" 
              stroke="#2962FF"
              strokeWidth={2}
              dot={false}
              fill="rgba(41, 98, 255, 0.1)"
            />
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill="#2a2e39"
              opacity={0.3}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};