import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface BrasetzBalanceProps {
  onSell: () => void;
}

export const BrasetzBalance: React.FC<BrasetzBalanceProps> = ({ onSell }) => {
  const [passphrase, setPassphrase] = useState('');
  const [showBalance, setShowBalance] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const COIN_VALUE = 0.035;

  const validatePassphrase = (pass: string): boolean => {
    if (pass.length !== 52) return false;
    if (!pass.startsWith('0x')) return false;
    if (pass[10] !== 'j') return false;
    if (pass[14] !== 'm') return false;
    if (pass[19] !== 't') return false;
    if (pass[24] !== 'z') return false;
    if (pass.slice(29, 35) !== '120btz') return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass[36])) return false;
    
    const lastTwelve = pass.slice(-12);
    if (!/^\d+$/.test(lastTwelve)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = lastTwelve.length - 1; i >= 0; i--) {
      let digit = parseInt(lastTwelve[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const extractKeywords = (pass: string): string[] => {
    if (pass.length < 39) return [];
    const positions = [3, 5, 8, 12, 17, 18, 21, 23, 24, 25, 27, 29, 38];
    return positions
      .map(pos => pass[pos])
      .filter(char => !/[!@#$%^&*(),.?":{}|<>]/.test(char));
  };

  const handlePassphraseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassphrase(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassphrase(passphrase)) {
      toast.error("Invalid passcode format");
      return;
    }

    const keywords = extractKeywords(passphrase);
    setSelectedKeywords(keywords);
    setShowBalance(true);
    toast.success("Balance view accessed successfully!");
  };

  const examplePasscode = "0x1234j567m89t1234z5678120btz@123456789012";

  return (
    <div className="max-w-md mx-auto space-y-6">
      {!showBalance ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="password"
                value={passphrase}
                onChange={handlePassphraseChange}
                placeholder="Enter passphrase (exactly 52 characters)"
                className="pr-10"
              />
              {passphrase.length === 52 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {validatePassphrase(passphrase) ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Format Requirements:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Must be exactly 52 characters</li>
                <li>Starts with 0x</li>
                <li>11th character must be 'j'</li>
                <li>15th character must be 'm'</li>
                <li>20th character must be 't'</li>
                <li>25th character must be 'z'</li>
                <li>Contains '120btz' after position 29</li>
                <li>37th character must be a symbol</li>
                <li>Last 12 characters must be valid Luhn number</li>
              </ul>
              <p className="mt-2">Example format: {examplePasscode}</p>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={!validatePassphrase(passphrase)}
          >
            Submit
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