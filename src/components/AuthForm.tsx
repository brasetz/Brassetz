import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoginForm } from './auth/LoginForm';
import { SignupForm } from './auth/SignupForm';
import { PassphraseDisplay } from './auth/PassphraseDisplay';

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
    
    const passphrase = `${prefix}${usernameSuffix}021au${mobileAlpha}120btz${emailPrefix}`;
    return passphrase.replace(/\s+/g, '');
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

      {isSignup ? (
        <SignupForm
          username={username}
          setUsername={setUsername}
          mobile={mobile}
          setMobile={setMobile}
          email={email}
          setEmail={setEmail}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      ) : (
        <LoginForm
          passphrase={passphrase}
          setPassphrase={setPassphrase}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      )}

      <PassphraseDisplay generatedPassphrase={generatedPassphrase} />
    </div>
  );
};