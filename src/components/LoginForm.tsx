import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TradingChart } from './TradingChart';
import { AuthForm } from './AuthForm';
import { BrasetzBalance } from './BrasetzBalance';

export const LoginForm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBalanceView, setShowBalanceView] = useState(false);
  const [userPassphrase, setUserPassphrase] = useState('');
  const COIN_VALUE = 0.035;
  
  const handleAuthSuccess = (passphrase: string) => {
    setIsLoggedIn(true);
    setUserPassphrase(passphrase);
  };

  const handleSell = () => {
    toast.success("Sell order placed successfully!");
  };

  const handleBackFromBalance = () => {
    setShowBalanceView(false);
  };

  if (!isLoggedIn) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  if (showBalanceView) {
    return <BrasetzBalance onSell={handleSell} onBack={handleBackFromBalance} />;
  }

  return (
    <div className="space-y-6">
      {userPassphrase && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">Your Passphrase:</p>
          <code className="block mt-2 p-2 bg-background rounded">{userPassphrase}</code>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Order Your Coin</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">1 BTZ = ${COIN_VALUE}</span>
            </div>
            <Button
              onClick={() => toast.success("Order placed successfully!")}
              className="w-full"
            >
              Order Coin
            </Button>
          </div>
        </div>

        <div className="p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">View Balance</h2>
          <Button
            onClick={() => setShowBalanceView(true)}
            className="w-full"
          >
            Check Brasetz Balance
          </Button>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Trading Chart</h3>
        <TradingChart coinValue={COIN_VALUE} showLine={true} />
      </div>
    </div>
  );
};