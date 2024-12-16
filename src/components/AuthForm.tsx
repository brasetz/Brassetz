import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { TradingChart } from './TradingChart';

interface AuthFormProps {
  onSuccess: (passphrase: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassphrase, setGeneratedPassphrase] = useState('');

  const validateLoginPassphrase = (pass: string) => {
    if (pass.length !== 26) return false;
    const pattern = /^.{5}021au.*120btz.{3}$/;
    return pattern.test(pass);
  };

  const transformMobileToAlpha = (mobile: string) => {
    const last7 = mobile.slice(-7);
    return last7.split('').map(n => 
      String.fromCharCode(97 + parseInt(n))
    ).join('');
  };

  const generatePassphrase = () => {
    const prefix = Math.random() > 0.5 ? '0b' : '0x';
    const usernameSuffix = username.slice(-3);
    const mobileAlpha = transformMobileToAlpha(mobile);
    const emailPrefix = email.slice(0, 3);
    
    // Generate Luhn algorithm compliant number
    let luhnNumber = '';
    for (let i = 0; i < 11; i++) {
      luhnNumber += Math.floor(Math.random() * 10);
    }
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      let digit = parseInt(luhnNumber[i]);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    luhnNumber += checkDigit;

    return `${prefix}${usernameSuffix}021au${mobileAlpha}120btz${emailPrefix}${luhnNumber}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        if (username.length !== 7 || !/^\d+$/.test(username)) {
          toast.error("Username must be 7 digits");
          return;
        }
        if (!mobile || !email) {
          toast.error("All fields are required");
          return;
        }
        
        const newPassphrase = generatePassphrase();
        setGeneratedPassphrase(newPassphrase);
        toast.success("Signup successful! Copy your passphrase");
        onSuccess(newPassphrase);
      } else {
        if (!validateLoginPassphrase(passphrase)) {
          toast.error("Invalid passphrase format");
          return;
        }
        onSuccess(passphrase);
        toast.success("Login successful!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex justify-center space-x-4 mb-6">
        <Button
          variant={isSignup ? "outline" : "default"}
          onClick={() => setIsSignup(false)}
        >
          Login
        </Button>
        <Button
          variant={!isSignup ? "outline" : "default"}
          onClick={() => setIsSignup(true)}
        >
          Sign Up
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup ? (
          <>
            <div>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (7 digits)"
                maxLength={7}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Must be exactly 7 digits
              </p>
            </div>
            <Input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile Number"
            />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </>
        ) : (
          <div>
            <Input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter 26-character passphrase"
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Example: abcde021auXXXXX120btzYYY
            </p>
            <p className="text-sm text-muted-foreground">
              Hint: Contains "021au" after first 5 chars and "120btz" before last 3 chars
            </p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            isSignup ? "Sign Up" : "Login"
          )}
        </Button>
      </form>

      {generatedPassphrase && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
          <p className="font-medium mb-2">Your Generated Passphrase:</p>
          <div className="flex items-center space-x-2">
            <code className="bg-black/10 p-2 rounded flex-1 break-all">
              {generatedPassphrase}
            </code>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatedPassphrase);
                toast.success("Passphrase copied!");
              }}
              size="sm"
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};