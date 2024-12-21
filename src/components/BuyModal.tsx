import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, X } from "lucide-react";
import { toast } from "sonner";

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinValue: number;
}

export const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, coinValue }) => {
  const [passcode, setPasscode] = useState('');
  const fixedKey = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  
  const validatePasscode = (code: string): boolean => {
    if (code.length !== 52) return false;
    if (!code.startsWith('0xb1q')) return false;
    if (!code.endsWith('1b2t0z')) return false;
    return true;
  };

  const extractKeywords = (code: string): string => {
    if (code.length < 52) return '';
    const positions = [5, 7, 11, 17, 21, 27, 30, 32]; // 6th, 8th, 12th, 18th, 22nd, 28th, 31st, 33rd positions
    let result = '';
    
    positions.forEach(pos => {
      const char = code[pos];
      // Only add numbers and dots (for symbols) to result
      if (/[0-9]/.test(char)) {
        result += char;
      } else if (/[!@#$%^&*(),.?":{}|<>]/.test(char)) {
        result += '.';
      }
    });
    
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePasscode(passcode)) {
      try {
        if (typeof window.ethereum !== 'undefined') {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          toast.success("MetaMask connected successfully!");
          onClose();
        } else {
          toast.error("MetaMask is not installed!");
        }
      } catch (error) {
        toast.error("Failed to connect to MetaMask");
      }
    } else {
      toast.error("Invalid passcode format");
    }
  };

  const copyFixedKey = () => {
    navigator.clipboard.writeText(fixedKey);
    toast.success("Key copied to clipboard!");
  };

  const isValid = validatePasscode(passcode);
  const keywords = extractKeywords(passcode);
  const examplePasscode = "0xb1q" + "0".repeat(41) + "1b2t0z";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Buy BTZ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Passcode</label>
            <Input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="mt-1"
              placeholder="Enter 52-character passcode"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Format: Starts with 0xb1q, ends with 1b2t0z, total 52 characters
              <br />
              Example: {examplePasscode}
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <label className="text-sm font-medium">Keywords</label>
            <div className="flex items-center space-x-2 mt-1">
              <Input 
                type="text"
                value={isValid ? keywords : ''}
                readOnly
                className="font-mono bg-background"
                placeholder="Keywords will appear here"
              />
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <label className="text-sm font-medium">Status</label>
            <div className="flex items-center space-x-2 mt-1">
              {passcode && (
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

          <div className="bg-muted/50 p-3 rounded-lg">
            <label className="text-sm font-medium">Fixed Key</label>
            <div className="flex items-center justify-between mt-1 p-2 bg-background rounded-md">
              <code className="text-sm break-all">{fixedKey}</code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={copyFixedKey}
                className="ml-2 flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isValid}
          >
            Submit Buy Order
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};