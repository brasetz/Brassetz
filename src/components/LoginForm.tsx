import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TradingChart } from './TradingChart';
import { AuthForm } from './AuthForm';
import { BrasetzBalance } from './BrasetzBalance';

export const LoginForm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBalanceView, setShowBalanceView] = useState(false);
  const [userPassphrase, setUserPassphrase] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const COIN_VALUE = 0.035;
  
  const handleAuthSuccess = (passphrase: string) => {
    setIsLoggedIn(true);
    setUserPassphrase(passphrase);
  };

  const handleSell = () => {
    toast.success("Sell order placed successfully!");
  };

  const handleBackFromBalance = () => {
    setShowBalanceView(false);
  };

  const handleRegisterClick = () => {
    window.open('https://forms.office.com/r/irGB2vvvGe', '_blank');
  };

  const handleBrasetzDIDClick = () => {
    window.open('https://forms.office.com/r/UB4NycU3Km', '_blank');
  };

  if (!isLoggedIn) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  if (showBalanceView) {
    return <BrasetzBalance onSell={handleSell} onBack={handleBackFromBalance} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {userPassphrase && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">Your Passphrase:</p>
          <code className="block mt-2 p-2 bg-background rounded break-all">{userPassphrase}</code>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="p-4 sm:p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Token Registration</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">1 BTZ = ${COIN_VALUE}</span>
            </div>
            <div className="space-y-3">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base"
                onClick={handleRegisterClick}
              >
                Register & Order Token
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10 text-sm sm:text-base"
                onClick={handleBrasetzDIDClick}
              >
                Order with Brasetz-DID
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">View Balance</h2>
          <Button
            onClick={() => setShowBalanceView(true)}
            className="w-full text-sm sm:text-base"
          >
            Check Brasetz Balance
          </Button>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4">Trading Chart</h3>
        <div className="w-full overflow-hidden">
          <TradingChart coinValue={COIN_VALUE} showLine={true} />
        </div>
      </div>
    </div>
  );
};