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

  const validatePassphrase = (pass: string) => {
    if (pass.length !== 42) return false;
    if (!pass.startsWith('0z0') && !pass.startsWith('0a1')) return false;
    if (!pass.includes('0btz', 22)) return false;
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
            <p className="text-sm text-muted-foreground mt-2">
              Example: 0z0XXXXXXXXXXXXX0btzXXXXX@XXXXXX
            </p>
            <p className="text-sm text-muted-foreground">
              Hint: Starts with 0z0 or 0a1, contains 0btz after 22nd char, symbol at 36th position
            </p>
          </div>
          <Button type="submit" className="w-full">
            View Balance
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Account Information</h3>
            <p className="mb-4">Hi {selectedKeywords.join('')}</p>
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