import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StatusDisplay } from './buy/StatusDisplay';
import { DepositAddress } from './buy/DepositAddress';
import { validateAmount } from '@/utils/validation';
import { Loader2 } from 'lucide-react';
import { 
  TRADING_CONTRACT_ADDRESS,
  buyBTZ,
  connectWallet,
  getTransactionHistory,
  getRecipientAddress
} from '@/contracts/TradingContract';

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
}

export const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, coinValue }) => {
  const [passcode, setPasscode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('polygon');

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
      blockExplorerUrls: ['https://polygonscan.com/']
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
      blockExplorerUrls: ['https://bscscan.com/']
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
      blockExplorerUrls: ['https://etherscan.io/']
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
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return false;
    }

    try {
      setIsNetworkSwitching(true);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: networkConfig.chainId,
              chainName: networkConfig.chainName,
              nativeCurrency: networkConfig.nativeCurrency,
              rpcUrls: networkConfig.rpcUrls,
              blockExplorerUrls: networkConfig.blockExplorerUrls
            }],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error("Failed to add network. Please try again.");
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    } finally {
      setIsNetworkSwitching(false);
    }
  };

  const handleNetworkChange = async (networkKey: string) => {
    const networkConfig = networks[networkKey];
    if (await switchNetwork(networkConfig)) {
      setSelectedNetwork(networkKey);
      toast.success(`Switched to ${networkConfig.chainName}`);
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
      const { account } = await connectWallet();
      
      // Process the buy transaction
      const receipt = await buyBTZ(extractedAmount);
      setCurrentTxHash(receipt.hash);
      toast.success("Payment processed successfully!");

      // Get transaction history
      const history = await getTransactionHistory(account);
      console.log('Transaction history:', history);

      onClose();
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
          <DialogTitle className="text-xl font-bold text-center">Buy BTZ</DialogTitle>
          <DialogDescription>
            Select your preferred network for the transaction
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Network</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(networks).map(([key, network]) => (
                <Button
                  key={key}
                  type="button"
                  variant={selectedNetwork === key ? "default" : "outline"}
                  onClick={() => handleNetworkChange(key)}
                  className="w-full"
                  disabled={isNetworkSwitching}
                >
                  {isNetworkSwitching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    network.nativeCurrency.symbol
                  )}
                </Button>
              ))}
            </div>
          </div>

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
            <label className="text-sm font-medium">Required USDT Amount</label>
            <Input 
              type="text"
              value={isValid ? `${extractedAmount} USDT` : ''}
              readOnly
              className="font-mono bg-background"
              placeholder="Amount will appear here"
            />
          </div>

          <StatusDisplay 
            isValid={isValid} 
            isAmountValid={isAmountValid}
            passcode={passcode}
          />

          <DepositAddress address={await getRecipientAddress()} />

          {currentTxHash && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <label className="text-sm font-medium">Transaction Status</label>
              <a 
                href={`${networks[selectedNetwork].blockExplorerUrls[0]}tx/${currentTxHash}`}
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
