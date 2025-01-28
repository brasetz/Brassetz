import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface BrasetzBalanceProps {
  onSell: () => void;
  onBack?: () => void;
}

export const BrasetzBalance: React.FC<BrasetzBalanceProps> = ({ onSell, onBack }) => {
  const [showBalance, setShowBalance] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [username, setUsername] = useState('');
  const COIN_VALUE = 0.035;
  const FIXED_KEY = "Brasetz";

  const validatePasscode = (code: string): boolean => {
    if (code.length !== 147) return false;
    if (!code.endsWith('@021btz')) return false;
    return true;
  };

  const extractGappedCharacters = (text: string): string => {
    let result = '';
    for (let i = 0; i < text.length; i += 2) {
      result += text[i];
    }
    return result;
  };

  const extractUsername = (code: string): string => {
    const gappedCode = extractGappedCharacters(code);
    const positions = [6, 9, 11, 14, 21, 24, 27, 29, 31, 32];
    let extractedChars = positions.map(pos => gappedCode[pos]);
    return extractedChars.filter(char => !['@', '#', '$', '%', '^', '&', '*', '(', ')', '+'].includes(char)).join('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasscode(passcode)) {
      toast.error("Invalid passcode format! Must be 147 characters and end with @021btz");
      return;
    }

    const extractedUsername = extractUsername(passcode);
    if (extractedUsername) {
      setUsername(extractedUsername);
      setShowBalance(true);
      toast.success("Balance view accessed successfully!");
    } else {
      toast.error("Could not extract valid username!");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Account
      </Button>

      {!showBalance ? (
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Fixed Key: {FIXED_KEY}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Enter Passcode</label>
                <Input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter 147-digit passcode"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Must be 147 characters long and end with @021btz
                </p>
              </div>
              <Button type="submit" className="w-full">
                View Balance
              </Button>
            </form>
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
                <span>Username:</span>
                <span className="font-bold">{username}</span>
              </div>
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