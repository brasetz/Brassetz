import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const LoginForm = () => {
  const [passphrase, setPassphrase] = useState('');
  const pattern = /^.{5}021au.*120btz.{3}$/;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length !== 26) {
      toast.error("Passphrase must be 26 characters long");
      return;
    }
    if (!pattern.test(passphrase)) {
      toast.error("Invalid passphrase pattern");
      return;
    }
    toast.success("Login successful!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <Input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="Enter 26-digit passphrase"
          className="w-full"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Hint: 26 digits, contains "021au" after first 5 digits and "120btz" before last 3 digits
        </p>
      </div>
      <Button type="submit" className="w-full">Login</Button>
    </form>
  );
};