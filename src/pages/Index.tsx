import React, { useState } from 'react';
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
  const [showChart, setShowChart] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const COIN_VALUE = 0.035;

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
          toast.success("Wallet connected successfully!");
        }
      } else {
        toast.error("MetaMask is not installed!");
      }
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <nav className="flex space-x-4">
          {['dashboard', 'your account', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        {activeTab === 'dashboard' && (
          <Button
            onClick={connectWallet}
            disabled={isWalletConnected}
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            {isWalletConnected ? 'Connected' : 'Connect Wallet'}
          </Button>
        )}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          
          <Button 
            onClick={() => setShowChart(true)}
            className="w-full md:w-auto"
          >
            Show Chart
          </Button>
          
          <TradingChart coinValue={COIN_VALUE} showLine={showChart} />
          
          <div className="flex space-x-4">
            <Button
              onClick={handleBuy}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              Buy
            </Button>
            <Button
              onClick={handleSell}
              className="flex-1 bg-red-500 hover:bg-red-600"
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
  );
};

export default Index;