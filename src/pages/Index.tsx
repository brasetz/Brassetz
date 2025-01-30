import React, { useState, useEffect } from 'react';
import { TradingChart } from '@/components/TradingChart';
import { StatCard } from '@/components/StatCard';
import { LoginForm } from '@/components/LoginForm';
import { Analytics } from '@/components/Analytics';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BuyModal } from '@/components/BuyModal';
import { SellModal } from '@/components/SellModal';
import { Wallet } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const COIN_VALUE = 0.055;

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setIsWalletConnected(true);
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const handleBuy = () => {
    setShowBuyModal(true);
  };

  const handleSell = () => {
    setShowSellModal(true);
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setWalletAddress(accounts[0]);
          toast.success("Wallet connected successfully!");
        }
      } else {
        toast.error("MetaMask is not installed!");
      }
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Brasetz</h1>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <nav className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
            {['dashboard', 'your account', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`nav-link text-sm sm:text-base whitespace-nowrap ${activeTab === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
          {activeTab === 'dashboard' && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
              {isWalletConnected && walletAddress && (
                <span className="text-xs sm:text-sm font-medium bg-muted px-2 sm:px-3 py-1 rounded-md truncate max-w-[150px]">
                  {formatAddress(walletAddress)}
                </span>
              )}
              <Button
                onClick={connectWallet}
                disabled={isWalletConnected}
                className="flex items-center gap-2 text-sm sm:text-base"
                size="sm"
              >
                <Wallet className="h-4 w-4" />
                {isWalletConnected ? 'Connected' : 'Connect Wallet'}
              </Button>
            </div>
          )}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard 
                title="Coin Value" 
                value={`$${COIN_VALUE}`}
                change="+5.3%"
              />
              <StatCard 
                title="Total Valuation" 
                value="$18"
                change="+2.1%"
              />
              <StatCard 
                title="Total Investors" 
                value="120"
                change="+1.8%"
              />
            </div>
            
            <div className="w-full overflow-hidden rounded-lg">
              <TradingChart coinValue={COIN_VALUE} showLine={true} />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Button
                onClick={handleBuy}
                className="flex-1 bg-green-500 hover:bg-green-600 text-sm sm:text-base"
              >
                Buy
              </Button>
              <Button
                onClick={handleSell}
                className="flex-1 bg-red-500 hover:bg-red-600 text-sm sm:text-base"
              >
                Sell
              </Button>
            </div>

            <Analytics />
          </div>
        )}

        {activeTab === 'your account' && (
          <div className="space-y-6">
            <LoginForm />
          </div>
        )}

        {activeTab === 'analytics' && <Analytics />}

        <BuyModal 
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          coinValue={COIN_VALUE}
        />
        
        <SellModal 
          isOpen={showSellModal}
          onClose={() => setShowSellModal(false)}
          coinValue={COIN_VALUE}
        />
      </div>
    </div>
  );
};

export default Index;
