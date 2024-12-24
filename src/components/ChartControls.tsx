import React from 'react';
import { Button } from './ui/button';

interface ChartControlsProps {
  timeframe: string;
  setTimeframe: (tf: string) => void;
  chartType: 'line' | 'candle';
  setChartType: (type: 'line' | 'candle') => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  timeframe,
  setTimeframe,
  chartType,
  setChartType
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 bg-[#2a2e39] p-1 rounded-md">
          {['1m', '5m', '15m', '30m', '1h', '1D', '1W', '1M'].map(time => (
            <Button
              key={time}
              variant={timeframe === time ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeframe(time)}
              className={`text-xs ${
                timeframe === time 
                  ? 'bg-[#363a45] text-[#d1d4dc]' 
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              {time}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant={chartType === 'line' ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType('line')}
            className="text-xs"
          >
            Line
          </Button>
          <Button
            variant={chartType === 'candle' ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType('candle')}
            className="text-xs"
          >
            Candle
          </Button>
        </div>
      </div>
    </div>
  );
};