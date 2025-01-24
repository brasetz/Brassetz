import { ethers } from 'ethers';

export const TRADING_CONTRACT_ADDRESS = '0x9177E4c474f111689eD87937eeAd5FFd84A2474B';
export const TRADING_COIN_VALUE = 0.00035;

export const TRADING_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "confirmPayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "confirmationMessage",
        "type": "string"
      }
    ],
    "name": "PaymentReceived",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "recipientAddress",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address"
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

    // Create transaction with nonce
    const nonce = await provider.getTransactionCount(await signer.getAddress());
    const tx = await contract.confirmPayment({ 
      value: ethers.parseEther(amount),
      nonce: nonce
    });
    
    const receipt = await tx.wait();
    
    // Listen for PaymentReceived event
    const filter = contract.filters.PaymentReceived(await signer.getAddress());
    const events = await contract.queryFilter(filter, receipt.blockNumber, receipt.blockNumber);
    
    if (events.length > 0) {
      console.log('Payment confirmed:', events[0].args.confirmationMessage);
    }
    
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
  confirmationMessage?: string;
}

export const getRecipientAddress = async (): Promise<string> => {
  try {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(TRADING_CONTRACT_ADDRESS, TRADING_CONTRACT_ABI, provider);
    
    return await contract.recipientAddress();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch recipient address');
  }
};