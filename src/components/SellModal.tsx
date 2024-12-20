import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, X } from "lucide-react";
import { toast } from "sonner";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinValue: number;
}

export const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, coinValue }) => {
  const [passcode, setPasscode] = useState('');
  const fixedKey = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  
  const validatePasscode = (code: string): boolean => {
    if (code.length !== 52) return false;
    if (!code.startsWith('0x') && !code.startsWith('0a')) return false;
    if (code[10] !== 'j') return false;
    if (code[14] !== 'm') return false;
    if (code[19] !== 't') return false;
    if (code[24] !== 'z') return false;
    if (code.slice(29, 35) !== '120btz') return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(code[36])) return false;
    
    const lastTwelve = code.slice(-12);
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

  const extractKeywords = (code: string): string => {
    if (code.length < 39) return '';
    const positions = [3, 5, 8, 12, 17, 18, 21, 23, 24, 25, 27, 29, 38];
    let result = '';
    
    positions.forEach(pos => {
      let char = code[pos];
      if (/[!@#$%^&*(),.?":{}|<>]/.test(char)) {
        char = '.';
      }
      if (/[\d.]/.test(char)) result += char;
    });
    
    return result;
  };

  const isKeywordValid = (keywords: string): boolean => {
    if (!keywords) return false;
    const numericValue = parseFloat(keywords.replace('.', ''));
    return numericValue <= coinValue;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePasscode(passcode)) {
      const keywords = extractKeywords(passcode);
      if (isKeywordValid(keywords)) {
        toast.success("Sell order placed successfully!");
        onClose();
      } else {
        toast.error("Invalid keywords value");
      }
    } else {
      toast.error("Invalid passcode format");
    }
  };

  const copyFixedKey = () => {
    navigator.clipboard.writeText(fixedKey);
    toast.success("Key copied to clipboard!");
  };

  const keywords = extractKeywords(passcode);
  const isValid = isKeywordValid(keywords);

  // const examplePasscode = "0x1234j567m89t1234z5678120btz@123456789012";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Sell BTZ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Passcode</label>
            <Input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="mt-1"
              placeholder="Enter 52-character passcode"
            />
{/*             <p className="text-sm text-muted-foreground mt-1">
              Format: Starts with 0x/0a, 11th=j, 15th=m, 20th=t, 25th=z, 30-35=120btz, 37th=symbol, last 12=Luhn
              <br />
              Example: {examplePasscode}
            </p> */}
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <label className="text-sm font-medium">Keywords</label>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-lg font-mono">{keywords || '...'}</span>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <label className="text-sm font-medium">Status</label>
            <div className="flex items-center space-x-2 mt-1">
              {keywords && (
                <>
                  <span>{isValid ? 'Approved' : 'Not Approved'}</span>
                  {isValid ? (
                    <Check className="text-green-500 h-5 w-5" />
                  ) : (
                    <X className="text-red-500 h-5 w-5" />
                  )}
                </>
              )}
            </div>
          </div>

        

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isValid}
          >
            Submit Sell Order
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
