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
    if (code.length !== 62) return false;
    if (!code.startsWith('02a')) return false;
    if (!code.endsWith('@021btz')) return false;
    return true;
  };

  const extractKeywords = (code: string): string => {
    if (code.length < 62) return '';
    const positions = [6, 9, 11, 14, 21, 24, 27, 29, 31, 32];
    let result = '';
    
    positions.forEach(pos => {
      const char = code[pos];
      if (/[0-9]/.test(char)) {
        result += char;
      } else if (/[!@#$%^&*(),.?":{}|<>]/.test(char)) {
        // Skip symbols
        return;
      } else {
        result += char;
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

  const keywords = extractKeywords(passcode);
  const isValid = validatePasscode(passcode) && isKeywordValid(keywords);

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
              placeholder="Enter 62-character passcode"
            />
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