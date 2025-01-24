import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StatusDisplay } from './buy/StatusDisplay';
import { DepositAddress } from './buy/DepositAddress';
import { validateAmount } from '@/utils/validation';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinValue: number;
}

export const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, coinValue }) => {
  const [passcode, setPasscode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const USDT_CONTRACT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
  
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

    const extractedAmount = extractKeywords(passcode);
    if (!extractedAmount) {
      toast.error("Could not extract valid amount from passcode");
      return;
    }

    if (!validateAmount(extractedAmount, coinValue)) {
      toast.error("Amount must be at least double the coin value");
      return;
    }

    setIsProcessing(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        const transferFunctionSignature = '0xa9059cbb';
        const amount = (parseFloat(extractedAmount) * 1000000).toString(16).padStart(64, '0');
        const paddedAddress = USDT_CONTRACT_ADDRESS.slice(2).padStart(64, '0');
        const data = `${transferFunctionSignature}${paddedAddress}${amount}`;

        const networkUSDTAddresses: { [key: string]: string } = {
          '0x1': '0xdac17f958d2ee523a2206206994597c13d831ec7',
          '0x89': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
          '0x38': '0x55d398326f99059ff775485246999027b3197955',
        };

        const currentUSDTAddress = networkUSDTAddresses[chainId] || USDT_CONTRACT_ADDRESS;

        const transactionParameters = {
          to: currentUSDTAddress,
          from: accounts[0],
          data: data,
          gas: '0x186A0',
        };

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

  const isValid = validatePasscode(passcode);
  const extractedAmount = extractKeywords(passcode);
  const isAmountValid = validateAmount(extractedAmount, coinValue);

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
            <label className="text-sm font-medium">Required USDT Deposit Amount</label>
            <div className="flex items-center space-x-2">
              <Input 
                type="text"
                value={isValid ? `${extractedAmount} USDT` : ''}
                readOnly
                className="font-mono bg-background"
                placeholder="Amount will appear here"
              />
            </div>
          </div>

          <StatusDisplay 
            isValid={isValid} 
            isAmountValid={isAmountValid}
            passcode={passcode}
          />

          <DepositAddress address={USDT_CONTRACT_ADDRESS} />

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            disabled={!isValid || !isAmountValid || isProcessing}
          >
            {isProcessing ? 'Processing...' : `Submit ${extractedAmount} USDT Payment`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};