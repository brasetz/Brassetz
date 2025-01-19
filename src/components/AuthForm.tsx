import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const countries = [
  "USA", "India", "UK", "China", "Japan", "Germany", "France", "Italy", "Canada", "Australia"
];

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('USA');
  const [salt, setSalt] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassphrase, setGeneratedPassphrase] = useState('');

  const generateDID = (name: string, dob: string, city: string, salt: string) => {
    // Remove spaces and special characters from name
    const cleanName = name.replace(/[^a-zA-Z]/g, '');
    // Remove dashes from date
    const cleanDob = dob.replace(/-/g, '');
    // Remove spaces from city
    const cleanCity = city.replace(/\s+/g, '');
    
    // Combine the values in the specified format
    const baseString = `${cleanName}${cleanDob}${cleanCity}`;
    // Add salt and required suffix
    return `${baseString}${salt}0xbtz`;
  };

  const validateLoginPassphrase = (pass: string) => {
    if (!pass.endsWith('0xbtz')) return false;
    
    // Check if the passphrase follows the format: NameDOBCitySalt0xbtz
    const minLength = 20; // Minimum reasonable length for a valid passphrase
    if (pass.length < minLength) return false;
    
    // Remove the 0xbtz suffix for the main validation
    const mainPart = pass.slice(0, -5);
    
    // Check if the remaining string contains at least some letters (name)
    // followed by numbers (date) and then more letters (city and salt)
    const formatRegex = /^[a-zA-Z]+\d{8}[a-zA-Z]+.+$/;
    return formatRegex.test(mainPart);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        if (fullName.length < 3) {
          toast.error("Please enter your full name");
          return;
        }
        if (!dob) {
          toast.error("Please enter your date of birth");
          return;
        }
        if (!city) {
          toast.error("Please enter your city");
          return;
        }
        if (!salt) {
          toast.error("Please enter a salt value (e.g., childhood school, favorite person)");
          return;
        }
        if (!mobile || mobile.length < 7) {
          toast.error("Please enter a valid mobile number");
          return;
        }
        if (!email.includes('@')) {
          toast.error("Please enter a valid email address");
          return;
        }

        // Submit to Google Apps Script
        const formData = new FormData();
        formData.append('Name', fullName);
        formData.append('Email', email);
        formData.append('Mobile', `+${countryCode}${mobile}`);
        formData.append('Address', address);
        formData.append('DOB', dob);
        formData.append('City', city);
        formData.append('Country', country);
        formData.append('Message', message);

        const response = await fetch('https://script.google.com/macros/s/AKfycbw8Jz81LW555JPi8InP0Xz2jQhd8_uQ2hfml_-tARgI5kq_g831wFdow1hqTGrQeMD8/exec', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (data.result !== 'success') {
          throw new Error(data.error || 'Failed to submit form');
        }

        const did = generateDID(fullName, dob, city, salt);
        setGeneratedPassphrase(did);
        toast.success("Signup successful! Please save your DID");
        onSuccess(did);
      } else {
        if (!validateLoginPassphrase(passphrase)) {
          toast.error("Invalid DID format. Please enter a valid DID that ends with '0xbtz'");
          return;
        }
        onSuccess(passphrase);
        toast.success("Login successful!");
      }
    } catch (error) {
      toast.error("Error submitting form. Please try again.");
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
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full"
              />
            </div>
            
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full"
            />

            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full"
            />

            <Select
              value={country}
              onValueChange={setCountry}
            >
              <SelectTrigger className="w-full">
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

            <Input
              type="text"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              placeholder="Salt (e.g., childhood school, favorite person)"
              className="w-full"
            />
            
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

            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
            />

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message (optional)"
              className="min-h-[100px]"
            />
          </>
        ) : (
          <div>
            <Input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter your DID"
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Your DID ends with '0xbtz'
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
