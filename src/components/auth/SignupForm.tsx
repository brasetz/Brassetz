import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SignupFormProps {
  username: string;
  setUsername: (value: string) => void;
  mobile: string;
  setMobile: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  username,
  setUsername,
  mobile,
  setMobile,
  email,
  setEmail,
  isLoading,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  );
};