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
  const LOGIN_PASSPHRASE = "0xb18d2392c22be15c4c1e94427fbb5258c4706f7c0c7a053f15179db3358dcc9a0btz";

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

  const comparePassphrases = (loginPhrase: string, balancePhrase: string): boolean => {
    const loginGapped = extractGappedCharacters(loginPhrase);
    const balanceGapped = extractGappedCharacters(balancePhrase);
    return loginGapped === balanceGapped.slice(0, loginGapped.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasscode(passcode)) {
      toast.error("Invalid passcode format! Must be 147 characters and end with @021btz");
      return;
    }

    if (!comparePassphrases(LOGIN_PASSPHRASE, passcode)) {
      toast.error("Invalid code! Gapped characters do not match login passphrase.");
      return;
    }

    setUsername(LOGIN_PASSPHRASE.slice(0, 8) + "..." + LOGIN_PASSPHRASE.slice(-8));
    setShowBalance(true);
    toast.success("Balance view accessed successfully!");
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
            <h3 className="text-lg font-semibold mb-4">Login Passphrase</h3>
            <code className="block p-2 bg-muted rounded text-sm mb-4 break-all">
              {LOGIN_PASSPHRASE}
            </code>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Enter Passcode</label>
                <Input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter 147-digit passcode"
                  className="w-full font-mono"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Must be 147 characters long, match the gapped pattern, and end with @021btz
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