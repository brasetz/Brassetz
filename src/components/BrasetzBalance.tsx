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

  const validateLuhnNumber = (cardNumber: string): boolean => {
    if (!/^\d{12}$/.test(cardNumber)) return false;
    
    const digits = cardNumber.split('').map(Number);
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const validatePassphrase = (pass: string): boolean => {
    // Check exact length
    if (pass.length !== 52) return false;

    // Check prefix
    if (!pass.startsWith('0z')) return false;

    // Check for '0btz' after 10th position
    if (pass.slice(10, 14) !== '0btz') return false;

    // Check Luhn number (positions 36-48)
    const luhnNumber = pass.slice(36, 48);
    if (!validateLuhnNumber(luhnNumber)) return false;

    // Check for symbol at the end
    const hasEndingSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(pass);
    if (!hasEndingSymbol) return false;

    return true;
  };

  const extractKeywords = (pass: string): string[] => {
    const positions = [4, 8, 26, 29, 30, 32, 34, 49, 50];
    return positions
      .map(pos => pass[pos])
      .filter(char => !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(char));
  };

  const handlePassphraseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassphrase(value);
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

  // Example with valid Luhn number (424242424242)
  const examplePasscode = "0z12345678900btz123456789012345678424242424242AB@";

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
                <li>Starts with 0z</li>
                <li>Contains 0btz after 10th position</li>
                <li>Contains valid 12-digit Luhn number after position 36</li>
                <li>Must end with a symbol</li>
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