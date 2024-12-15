import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TradingChart } from './TradingChart';

export const LoginForm = () => {
  const [passphrase, setPassphrase] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pattern = /^.{5}021au.*120btz.{3}$/;
  const COIN_VALUE = 0.035;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length !== 26) {
      toast.error("Passphrase must be 26 characters long");
      return;
    }
    if (!pattern.test(passphrase)) {
      toast.error("Invalid passphrase pattern");
      return;
    }
    setIsLoggedIn(true);
    toast.success("Login successful!");
  };

  const handleSell = () => {
    toast.error("Sell order placed successfully!");
  };

  if (isLoggedIn) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Account Type:</span>
              <span className="font-medium">Brasetz Account</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-medium">1 BTZ</span>
            </div>
            <Button
              onClick={handleSell}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Sell
            </Button>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Trading Chart</h3>
          <TradingChart coinValue={COIN_VALUE} showLine={true} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <Input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="Enter 26-digit passphrase"
          className="w-full"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Hint: 26 digits, contains "021au" after first 5 digits and "120btz" before last 3 digits
        </p>
      </div>
      <Button type="submit" className="w-full">Login</Button>
    </form>
  );
};