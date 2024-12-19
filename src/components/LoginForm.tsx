import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TradingChart } from './TradingChart';
import { AuthForm } from './AuthForm';
import { BuyModal } from './BuyModal';

export const LoginForm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPassphrase, setUserPassphrase] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [hasBought, setHasBought] = useState(false);
  const COIN_VALUE = 0.035;
  
  const handleAuthSuccess = (passphrase: string) => {
    setIsLoggedIn(true);
    setUserPassphrase(passphrase);
  };

  const handleBuySuccess = () => {
    setHasBought(true);
    toast.success("Your balance is 1 BTZ");
  };

  if (!isLoggedIn) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="space-y-6">
      {userPassphrase && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">Your Passphrase:</p>
          <code className="block mt-2 p-2 bg-background rounded">{userPassphrase}</code>
        </div>
      )}
      
      {hasBought ? (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-lg font-medium">Your Balance: 1 BTZ</p>
          </div>
          <Button
            onClick={() => toast.success("Sell functionality coming soon!")}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Sell BTZ
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Buy BTZ</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">1 BTZ = ${COIN_VALUE}</span>
              </div>
              <Button
                onClick={() => setShowBuyModal(true)}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Buy BTZ
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <BuyModal 
        isOpen={showBuyModal}
        onClose={() => {
          setShowBuyModal(false);
        }}
        coinValue={COIN_VALUE}
      />
    </div>
  );
};