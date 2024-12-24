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
  const [isProcessing, setIsProcessing] = useState(false);
  // USDT Contract Address on Polygon Network
  const USDT_CONTRACT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
  // Deposit address for USDT
  const DEPOSIT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasscode(passcode)) {
      toast.error("Invalid passcode format");
      return;
    }

    setIsProcessing(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // The USDT transfer data
        // Function signature for transfer(address,uint256)
        const transferFunctionSignature = '0xa9059cbb';
        
        // Convert amount to USDT decimals (6 decimals)
        const usdtAmount = coinValue;
        const amount = (usdtAmount * 1000000).toString(16).padStart(64, '0');
        // Convert address to padded hex
        const paddedAddress = DEPOSIT_ADDRESS.slice(2).padStart(64, '0');
        
        // Construct the data field
        const data = `${transferFunctionSignature}${paddedAddress}${amount}`;

        // Prepare transaction parameters for USDT transfer
        const transactionParameters = {
          to: USDT_CONTRACT_ADDRESS,
          from: accounts[0],
          data: data,
          gas: '0x186A0', // 100000 gas
        };

        // Request transaction
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });

        toast.success("USDT transfer initiated! Transaction hash: " + txHash);
        onClose();
      } else {
        toast.error("MetaMask is not installed!");
      }
    } catch (error: any) {
      toast.error(error.message || "Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyFixedKey = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    toast.success("Deposit address copied to clipboard!");
  };

  const isValid = validatePasscode(passcode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Buy BTZ with USDT</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Passcode</label>
            <Input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="font-mono"
              placeholder="Enter 52-character passcode"
            />
            <p className="text-sm text-muted-foreground">
              If you don't have a passcode, please login/signup and order your coin.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <label className="text-sm font-medium">USDT Amount to Deposit</label>
            <div className="flex items-center space-x-2">
              <Input 
                type="text"
                value={`${coinValue} USDT`}
                readOnly
                className="font-mono bg-background"
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex items-center space-x-2">
              {passcode && (
                <div className="flex items-center space-x-2 bg-background p-2 rounded-md w-full">
                  <span className={isValid ? 'text-green-500' : 'text-red-500'}>
                    {isValid ? 'Approved' : 'Not Approved'}
                  </span>
                  {isValid ? (
                    <Check className="text-green-500 h-5 w-5" />
                  ) : (
                    <X className="text-red-500 h-5 w-5" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <label className="text-sm font-medium">USDT Deposit Address (Polygon Network)</label>
            <div className="flex items-center justify-between p-2 bg-background rounded-md">
              <code className="text-sm break-all">{DEPOSIT_ADDRESS}</code>
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
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            disabled={!isValid || isProcessing}
          >
            {isProcessing ? 'Processing...' : `Submit ${coinValue} USDT Payment`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};