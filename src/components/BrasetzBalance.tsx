import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BrasetzBalanceProps {
  onSell: () => void;
}

export const BrasetzBalance: React.FC<BrasetzBalanceProps> = ({ onSell }) => {
  const [showBalance, setShowBalance] = useState(false);
  const COIN_VALUE = 0.035;
  const FIXED_KEY = "Brasetz";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBalance(true);
    toast.success("Balance view accessed successfully!");
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {!showBalance ? (
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Fixed Key: {FIXED_KEY}</h3>
            <Button 
              onClick={handleSubmit} 
              className="w-full"
            >
              View Balance
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Coin Value:</span>
                <span className="font-bold">${COIN_VALUE}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Brasetz Balance:</span>
                <span className="font-bold">1 BTZ</span>
              </div>
              <Button
                onClick={onSell}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                Sell
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};