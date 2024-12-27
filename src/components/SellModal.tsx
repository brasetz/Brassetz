import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinValue: number;
}

export const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, coinValue }) => {
  const [passcode, setPasscode] = useState('');
  
  const validatePasscode = (code: string): boolean => {
    if (code.length !== 52) return false;
    if (!code.startsWith('0xb1q')) return false;
    if (!code.endsWith('1b2t0z')) return false;
    return true;
  };

  const extractKeywords = (code: string): string => {
    if (code.length < 52) return '';
    const positions = [5, 7, 11, 17, 21, 27, 30, 32];
    let result = '';
    positions.forEach(pos => {
      const char = code[pos];
      if (/[0-9]/.test(char)) {
        result += char;
      } else if (/[!@#$%^&*(),.?":{}|<>]/.test(char)) {
        result += '.';
      }
    });
    return result;
  };

  const isKeywordValid = (keywords: string): boolean => {
    if (!keywords) return false;
    const numericValue = parseFloat(keywords);
    return !isNaN(numericValue) && numericValue <= coinValue;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePasscode(passcode)) {
      const keywords = extractKeywords(passcode);
      if (isKeywordValid(keywords)) {
        toast.success("Order confirmed! Kindly check your mail & wallet");
        onClose();
      } else {
        toast.error("Invalid amount in passcode");
      }
    } else {
      toast.error("Invalid passcode format");
    }
  };

  const isValid = validatePasscode(passcode);
  const extractedAmount = extractKeywords(passcode);
  const isAmountValid = isKeywordValid(extractedAmount);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Sell BTZ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Passcode</label>
            <Input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="font-mono"
              placeholder="Enter 52-character passcode"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <label className="text-sm font-medium">Extracted Amount</label>
            <div className="flex items-center space-x-2">
              <Input 
                type="text"
                value={isValid ? `${extractedAmount} BTZ` : ''}
                readOnly
                className="font-mono bg-background"
                placeholder="Amount will appear here"
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-background p-2 rounded-md w-full">
                <span className={isValid && isAmountValid ? 'text-green-500' : 'text-red-500'}>
                  {isValid && isAmountValid ? 'Approved' : 'Not Approved'}
                </span>
                {isValid && isAmountValid ? (
                  <Check className="text-green-500 h-5 w-5" />
                ) : (
                  <X className="text-red-500 h-5 w-5" />
                )}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
            disabled={!isValid || !isAmountValid}
          >
            Submit Sell Order
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};