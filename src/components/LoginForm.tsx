import { useState, useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TradingChart } from './TradingChart';
import { AuthForm } from './AuthForm';
import { BrasetzBalance } from './BrasetzBalance';
import { Copy, LogOut } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TradeRegistrationForm } from './TradeRegistrationForm';

const PassphraseDisplay = memo(({ 
  userPassphrase, 
  onCopy 
}: { 
  userPassphrase: string;
  onCopy: () => void;
}) => (
  <div className="p-4 sm:p-6 bg-muted rounded-lg">
    <div className="flex items-center justify-between">
      <p className="text-sm sm:text-base font-medium">Your Passphrase:</p>
      <Button
        variant="outline"
        size="sm"
        onClick={onCopy}
        className="ml-2"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy
      </Button>
    </div>
    <code className="block mt-2 p-2 sm:p-3 bg-background rounded break-all text-sm sm:text-base">
      {userPassphrase}
    </code>
  </div>
));

PassphraseDisplay.displayName = 'PassphraseDisplay';

// Memoized ActionCard component
const ActionCard = memo(({ 
  title, 
  children 
}: { 
  title: string;
  children: React.ReactNode;
}) => (
  <div className="p-4 sm:p-6 bg-card rounded-lg shadow-lg group relative overflow-hidden">
    <div className="absolute -inset-full h-[200%] w-[200%] rotate-45 translate-x-[-100%] transition-all duration-700 bg-gradient-to-tr from-transparent via-white/10 to-transparent group-hover:translate-x-[100%] z-20 pointer-events-none" />
    <div className="relative z-10">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  </div>
));

ActionCard.displayName = 'ActionCard';

export const LoginForm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBalanceView, setShowBalanceView] = useState(false);
  const [userPassphrase, setUserPassphrase] = useState('');
  const [showTradeRegistration, setShowTradeRegistration] = useState(false);
  const COIN_VALUE = 0.035;

  const handleAuthSuccess = useCallback((passphrase: string) => {
    setIsLoggedIn(true);
    setUserPassphrase(passphrase);
  }, []);

  const handleSell = useCallback(() => {
    toast.success("Sell order placed successfully!");
  }, []);

  const handleBackFromBalance = useCallback(() => {
    setShowBalanceView(false);
  }, []);

  const handleRegisterClick = useCallback(() => {
    setShowTradeRegistration(true);
  }, []);

  const handleBrasetzDIDClick = useCallback(() => {
    window.open('https://forms.office.com/r/UB4NycU3Km', '_blank');
  }, []);

  const handleDifferentAccount = useCallback(() => {
    setIsLoggedIn(false);
    setUserPassphrase('');
    localStorage.removeItem('userPassphrase');
    toast.success("Logged out successfully!");
  }, []);

  const handleCopyPassphrase = useCallback(() => {
    navigator.clipboard.writeText(userPassphrase);
    toast.success("Passphrase copied to clipboard!");
  }, [userPassphrase]);

  if (!isLoggedIn) {
    return (
      <>
        <Helmet>
          <title>Login - Brasetz Trading Platform</title>
          <meta name="description" content="Secure login to your Brasetz trading account. Access your portfolio and start trading." />
        </Helmet>
        <AuthForm onSuccess={handleAuthSuccess} />
      </>
    );
  }

  if (showBalanceView) {
    return (
      <>
        <Helmet>
          <title>Balance - Brasetz Trading Platform</title>
          <meta name="description" content="View your Brasetz balance and trading history." />
        </Helmet>
        <BrasetzBalance 
          onSell={handleSell} 
          onBack={handleBackFromBalance}
          userPassphrase={userPassphrase}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Brasetz Trading Platform</title>
        <meta name="description" content="Manage your Brasetz tokens, view trading charts, and access account features." />
      </Helmet>
      <div className="container-fluid py-6 sm:py-8 space-y-6 sm:space-y-8">
        {userPassphrase && (
          <PassphraseDisplay 
            userPassphrase={userPassphrase} 
            onCopy={handleCopyPassphrase}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <ActionCard title="Token Registration">
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
          </ActionCard>

          <ActionCard title="Account Actions">
            <div className="space-y-3">
              <Button
                onClick={() => setShowBalanceView(true)}
                className="w-full text-sm sm:text-base"
              >
                Check Brasetz Balance
              </Button>
              <Button
                onClick={handleDifferentAccount}
                variant="outline"
                className="w-full text-sm sm:text-base"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Different Account
              </Button>
            </div>
          </ActionCard>
        </div>
        
        <div className="mt-8 sm:mt-12">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Trading Chart</h3>
          <div className="w-full overflow-hidden rounded-lg">
            <TradingChart coinValue={COIN_VALUE} showLine={true} />
          </div>
        </div>

        <Dialog open={showTradeRegistration} onOpenChange={setShowTradeRegistration}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Trade Registration Form</DialogTitle>
            </DialogHeader>
            <TradeRegistrationForm onClose={() => setShowTradeRegistration(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
