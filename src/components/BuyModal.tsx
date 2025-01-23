import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  usdtAddress: string;
}

export const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, coinValue }) => {
  const [passcode, setPasscode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
  
  const networks: { [key: string]: NetworkConfig } = {
    polygon: {
      chainId: '0x89',
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      },
      rpcUrls: ['https://polygon-rpc.com/'],
      blockExplorerUrls: ['https://polygonscan.com/'],
      usdtAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    },
    bsc: {
      chainId: '0x38',
      chainName: 'Binance Smart Chain',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      },
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
      blockExplorerUrls: ['https://bscscan.com/'],
      usdtAddress: '0x55d398326f99059ff775485246999027b3197955'
    },
    ethereum: {
      chainId: '0x1',
      chainName: 'Ethereum Mainnet',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['https://mainnet.infura.io/v3/'],
      blockExplorerUrls: ['https://etherscan.io/'],
      usdtAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7'
    }
  };

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

  const switchNetwork = async (networkConfig: NetworkConfig) => {
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  };

  const checkUSDTBalance = async (address: string, usdtAddress: string, amount: string) => {
    try {
      const abiFragment = [
        {
          name: 'balanceOf',
          type: 'function',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: 'balance', type: 'uint256' }],
          stateMutability: 'view'
        }
      ];

      const contract = new window.web3.eth.Contract(abiFragment, usdtAddress);
      const balance = await contract.methods.balanceOf(address).call();
      const requiredAmount = parseFloat(amount) * 1e6; // USDT has 6 decimals
      return BigInt(balance) >= BigInt(requiredAmount);
    } catch (error) {
      console.error('Error checking USDT balance:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasscode(passcode)) {
      toast.error("Invalid passcode format");
      return;
    }

    const extractedAmount = extractKeywords(passcode);
    if (!validateAmount(extractedAmount, coinValue)) {
      toast.error("Amount must be at least double the coin value");
      return;
    }

    setIsProcessing(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Try to switch to Polygon first (preferred network)
        const networkSwitched = await switchNetwork(networks.polygon);
        if (!networkSwitched) {
          toast.error("Failed to switch network. Please try again.");
          setIsProcessing(false);
          return;
        }

        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentNetwork = Object.values(networks).find(n => n.chainId === chainId);
        
        if (!currentNetwork) {
          toast.error("Unsupported network");
          setIsProcessing(false);
          return;
        }

        // Check USDT balance
        const hasEnoughUSDT = await checkUSDTBalance(
          accounts[0],
          currentNetwork.usdtAddress,
          extractedAmount
        );

        if (!hasEnoughUSDT) {
          toast.error("Insufficient USDT balance. Please swap some tokens first.");
          setIsProcessing(false);
          return;
        }

        const transferFunctionSignature = '0xa9059cbb';
        const amount = (parseFloat(extractedAmount) * 1000000).toString(16).padStart(64, '0');
        const paddedAddress = currentNetwork.usdtAddress.slice(2).padStart(64, '0');
        const data = `${transferFunctionSignature}${paddedAddress}${amount}`;

        const transactionParameters = {
          to: currentNetwork.usdtAddress,
          from: accounts[0],
          data: data,
          gas: '0x186A0',
        };

        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });

        setCurrentTxHash(txHash);
        toast.success("USDT transfer initiated! Transaction hash: " + txHash);
        
        // Monitor transaction status
        const interval = setInterval(async () => {
          const receipt = await window.ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          });
          
          if (receipt) {
            clearInterval(interval);
            if (receipt.status === '0x1') {
              toast.success("Payment confirmed!");
            } else {
              toast.error("Transaction failed!");
            }
          }
        }, 5000);

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
          <DialogDescription>
            Transaction will be processed on Polygon Network (MATIC)
          </DialogDescription>
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

          <DepositAddress address={networks.polygon.usdtAddress} />

          {currentTxHash && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <label className="text-sm font-medium">Transaction Status</label>
              <a 
                href={`${networks.polygon.blockExplorerUrls[0]}tx/${currentTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 break-all"
              >
                View on Explorer
              </a>
            </div>
          )}

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