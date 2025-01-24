import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StatusDisplay } from './buy/StatusDisplay';
import { DepositAddress } from './buy/DepositAddress';
import { validateAmount } from '@/utils/validation';
import { convertUSDTtoINR } from '@/utils/currencyConverter';
import { ArrowLeft } from 'lucide-react';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinValue: number;
}

export const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, coinValue }) => {
  const [passcode, setPasscode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUPIDetails, setShowUPIDetails] = useState(false);
  const [inrAmount, setInrAmount] = useState<number | null>(null);
  const [showTxInput, setShowTxInput] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const USDT_CONTRACT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
  const UPI_ID = 'deepaks5559@fifederal';
  
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

  const handleUPISubmit = async () => {
    const extractedAmount = extractKeywords(passcode);
    if (!extractedAmount) {
      toast.error("Could not extract valid amount from passcode");
      return;
    }

    try {
      const inrValue = await convertUSDTtoINR(extractedAmount);
      setInrAmount(inrValue);
      setShowUPIDetails(true);
    } catch (error) {
      toast.error("Failed to convert currency. Please try again.");
    }
  };

  const handleConfirmTransaction = () => {
    if (!transactionId) {
      toast.error("Please enter the transaction ID");
      return;
    }
    
    toast.success("Transaction confirmed! ID: " + transactionId);
    onClose();
  };

  const handleBack = () => {
    setShowUPIDetails(false);
    setShowTxInput(false);
    setTransactionId('');
    setInrAmount(null);
  };

  const isValid = validatePasscode(passcode);
  const extractedAmount = extractKeywords(passcode);
  const isAmountValid = validateAmount(extractedAmount, coinValue);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {showUPIDetails ? (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                UPI Payment Details
              </div>
            ) : (
              'Buy BTZ with USDT/UPI'
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {!showUPIDetails ? (
            <>
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
              
              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  disabled={!isValid || !isAmountValid || isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Submit ${extractedAmount} USDT Payment`}
                </Button>
                <Button 
                  type="button"
                  onClick={handleUPISubmit}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  disabled={!isValid || !isAmountValid || isProcessing}
                >
                  Submit by UPI
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src="/lovable-uploads/dd7c985a-7ba3-4311-8263-5d45ee69e631.png" 
                  alt="UPI QR Code"
                  className="mx-auto w-48 h-48 object-contain"
                />
                <p className="mt-2 font-medium">UPI ID: {UPI_ID}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scan this QR code and deposit ₹{inrAmount?.toFixed(2)}. Once deposited, click confirm below.
                </p>
              </div>

              {!showTxInput ? (
                <Button
                  type="button"
                  onClick={() => setShowTxInput(true)}
                  className="w-full"
                >
                  Confirm Payment
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter UPI Transaction ID"
                    className="w-full"
                  />
                  <Button
                    type="button"
                    onClick={handleConfirmTransaction}
                    className="w-full"
                    disabled={!transactionId}
                  >
                    Submit Transaction ID
                  </Button>
                </div>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};