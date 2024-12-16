import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BrasetzBalanceProps {
  onSell: () => void;
}

export const BrasetzBalance: React.FC<BrasetzBalanceProps> = ({ onSell }) => {
  const [passphrase, setPassphrase] = useState('');
  const [showBalance, setShowBalance] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const COIN_VALUE = 0.035;

  const validatePassphrase = (pass: string) => {
    if (pass.length !== 42) return false;
    if (!pass.startsWith('0z0') && !pass.startsWith('0a1')) return false;
    
    // Check Luhn algorithm for digits 11-22
    const cardNumber = pass.slice(10, 22);
    if (!/^\d+$/.test(cardNumber)) return false;
    
    let sum = 0;
    let isEven = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    if (sum % 10 !== 0) return false;

    // Check fixed key 0btz after position 22
    if (!pass.includes('0btz', 22)) return false;
    
    // Check for symbol at position 36
    const hasSymbolAt36 = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass[35]);
    if (!hasSymbolAt36) return false;

    return true;
  };

  const extractKeywords = (pass: string) => {
    const positions = [4, 8, 26, 29, 30, 32, 34, 37, 39, 40];
    return positions
      .map(pos => pass[pos])
      .filter(char => char !== '0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassphrase(passphrase)) {
      toast.error("Invalid passphrase format");
      return;
    }

    const keywords = extractKeywords(passphrase);
    setSelectedKeywords(keywords);
    setShowBalance(true);
    toast.success("Balance view accessed successfully!");
  };

  const examplePasscode = "0z0123456789012345670btz12345@123456789012";

  return (
    <div className="max-w-md mx-auto space-y-6">
      {!showBalance ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter 42-character passphrase"
              className="w-full"
            />
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              <p>Format Requirements:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Starts with 0z0 or 0a1</li>
                <li>Contains 12-digit card number after position 10</li>
                <li>Contains 0btz after position 22</li>
                <li>Symbol at position 36</li>
                <li>Total length: 42 characters</li>
              </ul>
              <p className="mt-2">Example: {examplePasscode}</p>
            </div>
          </div>
          <Button type="submit" className="w-full">
            View Balance
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <p className="mb-4">Hi {selectedKeywords.join('')}</p>
            <div className="flex justify-between items-center mb-2">
              <span>Coin Value:</span>
              <span className="font-bold">${COIN_VALUE}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
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
      )}
    </div>
  );
};