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

  const validateLuhnNumber = (cardNumber: string): boolean => {
    if (!/^\d{12}$/.test(cardNumber)) return false;
    
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
    
    return sum % 10 === 0;
  };

  const validatePassphrase = (pass: string): boolean => {
    // Check minimum length
    if (pass.length < 43) return false;

    // Check prefix
    if (!pass.startsWith('0z')) return false;

    // Validate card number (positions 2-14)
    const cardNumber = pass.slice(2, 14);
    if (!validateLuhnNumber(cardNumber)) return false;

    // Check fixed key '0btz' after card number
    if (pass.slice(14, 18) !== '0btz') return false;

    // Check for symbol at the end
    const hasEndingSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(pass);
    if (!hasEndingSymbol) return false;

    return true;
  };

  const extractKeywords = (pass: string): string[] => {
    const positions = [19, 24, 27, 30, 31, 33, 35, 38, 40, 41];
    return positions
      .map(pos => pass[pos])
      .filter(char => !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(char));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassphrase(passphrase)) {
      toast.error("Wrong passcode. Connect at connectbrasetz@gmail.com");
      return;
    }

    const keywords = extractKeywords(passphrase);
    setSelectedKeywords(keywords);
    setShowBalance(true);
    toast.success("Balance view accessed successfully!");
  };

  const examplePasscode = "0z123456789012" + "0btz" + "abc123def456ghi789jkl" + "@";

  return (
    <div className="max-w-md mx-auto space-y-6">
      {!showBalance ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter passphrase (minimum 43 characters)"
              className="w-full"
            />
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              <p>Format Requirements:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Starts with 0z</li>
                <li>Contains 12-digit card number after 0z</li>
                <li>Contains 0btz after the card number</li>
                <li>Must end with a symbol</li>
                <li>Minimum length: 43 characters</li>
              </ul>
              <p className="mt-2">Example format: {examplePasscode}</p>
            </div>
          </div>
          <Button type="submit" className="w-full">
            View Balance
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">
              Hi {selectedKeywords.join('')}
            </h3>
            <div className="space-y-4">
              <h4 className="font-medium">Account Information</h4>
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