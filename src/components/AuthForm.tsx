import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  onSuccess: (passphrase: string) => void;
}

const countries = [
  "USA", "India", "UK", "China", "Japan", "Germany", "France", "Italy", "Canada", "Australia"
];

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [salt, setSalt] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassphrase, setGeneratedPassphrase] = useState('');

  useEffect(() => {
    const savedPassphrase = localStorage.getItem('userPassphrase');
    if (savedPassphrase) {
      onSuccess(savedPassphrase);
    }
  }, [onSuccess]);

  const generateSHA256 = async (text: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateDID = async (name: string, dob: string, city: string, salt: string) => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '');
    const cleanDob = dob.replace(/-/g, '');
    const cleanCity = city.replace(/\s+/g, '');
    const baseString = `${cleanName}${cleanDob}${cleanCity}${salt}`;
    const hash = await generateSHA256(baseString);
    return `0x${hash}0btz`;
  };

  const validateLoginPassphrase = (pass: string) => {
    if (!pass.startsWith('0x')) return false;
    if (!pass.endsWith('0btz')) return false;
    if (pass.length !== 70) return false;
    const middlePart = pass.slice(2, -4);
    const hexRegex = /^[0-9a-f]+$/i;
    return hexRegex.test(middlePart);
  };

  const validateForm = () => {
    if (fullName.length < 3) {
      toast.error("Please enter your full name (minimum 3 characters)");
      return false;
    }
    if (!dob) {
      toast.error("Please enter your date of birth");
      return false;
    }
    if (!city) {
      toast.error("Please enter your city");
      return false;
    }
    if (!salt) {
      toast.error("Please enter a salt key (e.g., childhood school, favorite person)");
      return false;
    }
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid mobile number (minimum 10 digits)");
      return false;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!address) {
      toast.error("Please enter your address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        if (!validateForm()) {
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('Name', fullName);
        formData.append('Email', email);
        formData.append('Mobile', mobile);
        formData.append('Address', address);
        formData.append('DOB', dob);
        formData.append('City', city);
        formData.append('Country', country);
        formData.append('Message', message);
        formData.append('salt key', salt);

        const params = new URLSearchParams();
        formData.forEach((value, key) => {
          params.append(key, value.toString());
        });

        const response = await fetch('https://script.google.com/macros/s/AKfycbzbaUEzMZZhHFi1DYLy84NtpPxGbouMgVGMUagIO3xYyoZJumUoPMSKfnOpboWzCFz45g/exec', {
          method: 'POST',
          body: params,
        });

        const data = await response.json();
        
        if (data.result !== 'success') {
          throw new Error(data.error || 'Failed to submit form');
        }

        const did = await generateDID(fullName, dob, city, salt);
        setGeneratedPassphrase(did);
        localStorage.setItem('userPassphrase', did);
        toast.success("Registration successful! Please save your DID");
        onSuccess(did);
      } else {
        if (!validateLoginPassphrase(passphrase)) {
          toast.error("Invalid DID format. Must start with '0x' and end with '0btz'");
          return;
        }
        localStorage.setItem('userPassphrase', passphrase);
        onSuccess(passphrase);
        toast.success("Login successful!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error submitting form. Please try again.");
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
            <div className="space-y-2">
              <Label htmlFor="Name">Name</Label>
              <Input
                id="Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="DOB">Date of Birth</Label>
              <Input
                id="DOB"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="City">City</Label>
              <Input
                id="City"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Country">Country</Label>
              <Select
                value={country}
                onValueChange={setCountry}
              >
                <SelectTrigger id="Country" className="w-full">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="saltkey">Salt Key</Label>
              <Input
                id="saltkey"
                type="text"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                placeholder="Enter a memorable phrase (e.g., childhood school)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Mobile">Mobile</Label>
              <Input
                id="Mobile"
                type="tel"
                value={mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setMobile(value);
                }}
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Email">Email</Label>
              <Input
                id="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Address">Address</Label>
              <Textarea
                id="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Message">Message (Optional)</Label>
              <Textarea
                id="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter any additional message"
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="passphrase">DID</Label>
            <Input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter your DID"
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Your DID ends with '0btz'
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
          <p className="font-medium mb-2">Your Generated DID:</p>
          <div className="flex items-center space-x-2">
            <code className="bg-black/10 p-2 rounded flex-1 break-all">
              {generatedPassphrase}
            </code>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatedPassphrase);
                toast.success("DID copied!");
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