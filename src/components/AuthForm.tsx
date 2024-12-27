import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuthFormProps {
  onSuccess: (passphrase: string) => void;
}

const countryCodes = [
  { value: "91", label: "India (+91)" },
  { value: "1", label: "USA (+1)" },
  { value: "44", label: "UK (+44)" },
  { value: "86", label: "China (+86)" },
  { value: "81", label: "Japan (+81)" },
  { value: "49", label: "Germany (+49)" },
];

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [username, setUsername] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassphrase, setGeneratedPassphrase] = useState('');

  const validateLoginPassphrase = (pass: string) => {
    if (pass.length !== 26) return false;
    const pattern = /^.{5}021au.*120btz.{3}$/;
    return pattern.test(pass);
  };

  const validateEmail = (email: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
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
    const emailPrefix = email.slice(0, 3).toLowerCase();
    
    // Generate a passphrase that's exactly 26 characters without spaces
    const passphrase = `${prefix}${usernameSuffix}021au${mobileAlpha}120btz${emailPrefix}`;
    return passphrase.replace(/\s+/g, ''); // Remove any spaces
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        if (username.length < 3 || username.length > 10) {
          toast.error("Username must be between 3 and 10 characters");
          return;
        }
        if (!mobile || mobile.length < 7) {
          toast.error("Please enter a valid mobile number");
          return;
        }
        if (!validateEmail(email)) {
          toast.error("Please enter a valid email address");
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
                placeholder="Username (3-10 characters)"
                maxLength={10}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Must be between 3 and 10 characters
              </p>
            </div>
            <div className="flex space-x-2">
              <Select
                value={countryCode}
                onValueChange={setCountryCode}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((code) => (
                    <SelectItem key={code.value} value={code.value}>
                      {code.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setMobile(value);
                }}
                placeholder="Mobile Number"
                className="flex-1"
              />
            </div>
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