import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose }) => {
  const [passcode, setPasscode] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [keywords, setKeywords] = useState('');

  const validateLuhn = (digits: string): boolean => {
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost position
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

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

  const validatePasscode = (code: string): boolean => {
    if (code.length !== 52) return false;
    if (!code.startsWith('0x')) return false;
    if (code[10] !== 'j') return false;
    if (code[14] !== 'm') return false;
    if (code[19] !== 't') return false;
    if (code[24] !== 'z') return false;
    if (code.substring(29, 35) !== '120btz') return false;
    if (!/[@#$%^&*]/.test(code[36])) return false;
    
    const lastTwelve = code.slice(-12);
    if (!/^\d+$/.test(lastTwelve)) return false;
    
    return validateLuhn(lastTwelve);
  };

  const extractKeywords = (code: string): string => {
    if (code.length < 37) return '';
    
    const positions = [5, 7, 11, 17, 21, 27, 30, 32];
    let result = '';
    
    positions.forEach(pos => {
      const char = code[pos];
      // Only add dots for symbols, skip letters and numbers
      if (/[@#$%^&*]/.test(char)) {
        result += '.';
      }
    });
    
    return result;
  };

  useEffect(() => {
    const valid = validatePasscode(passcode);
    setIsValid(valid);
    setKeywords(extractKeywords(passcode));
  }, [passcode]);

  const handleSubmit = () => {
    if (isValid) {
      // Handle submission logic here
      console.log('Passcode submitted:', passcode);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Passcode to Buy</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Passcode</label>
            <Input
              type="text"
              placeholder="Enter 52-character passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Format Requirements:
              <br />- Starts with 0x
              <br />- 11th='j', 15th='m', 20th='t', 25th='z'
              <br />- 30-35='120btz', 37th=symbol, last 12=Luhn
              <br />Example: 0x1234j567m89t1234z5678120btz@123456789012
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords</label>
            <p className="text-lg font-mono">{keywords}</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Status:</span>
            <span className="flex items-center">
              {isValid ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 ml-1">Approved</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 ml-1">Not Approved</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Submit Buy Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyModal;