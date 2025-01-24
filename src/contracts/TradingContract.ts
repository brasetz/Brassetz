import { ethers } from 'ethers';

export const TRADING_CONTRACT_ADDRESS = '0x9177E4c474f111689eD87937eeAd5FFd84A2474B';
export const TRADING_COIN_VALUE = 0.00035;

export const TRADING_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "buy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getTransactionHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isBuy",
            "type": "bool"
          }
        ],
        "internalType": "struct Trading.Transaction[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    
    return {
      account: accounts[0],
      provider
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to connect wallet');
  }
};

export const buyBTZ = async (amount: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(TRADING_CONTRACT_ADDRESS, TRADING_CONTRACT_ABI, signer);

    const tx = await contract.buy({ value: ethers.parseEther(amount) });
    const receipt = await tx.wait();
    
    return receipt;
  } catch (error: any) {
    throw new Error(error.message || 'Transaction failed');
  }
};

export const getCoinValue = () => {
  return TRADING_COIN_VALUE;
};

export interface Transaction {
  timestamp: bigint;
  amount: bigint;
  isBuy: boolean;
}

export const getTransactionHistory = async (address: string): Promise<Transaction[]> => {
  try {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(TRADING_CONTRACT_ADDRESS, TRADING_CONTRACT_ABI, provider);
    
    const history = await contract.getTransactionHistory(address);
    return history;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch transaction history');
  }
};