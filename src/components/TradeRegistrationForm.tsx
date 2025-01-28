import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const COIN_VALUE = 0.035;

export const TradeRegistrationForm = ({ onClose }: { onClose: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    tokenName: '',
    brasetzDID: '',
    email: '',
    buySell: 'Buy',
    currentPrice: COIN_VALUE.toString(),
  });

  const validateBrasetzDID = (did: string) => {
    return did.length === 70;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBrasetzDID(formData.brasetzDID)) {
      toast.error("Brasetz(D-ID) must be exactly 70 characters long");
      return;
    }

    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      const timestamp = new Date().toISOString();
      
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, value);
      });
      params.append('timestamp', timestamp);

      const response = await fetch('https://script.google.com/macros/s/AKfycbxweoEBqT8VyJo-EiPQXEQySXzbJZUPAKYNy6LiL9xs2_idfy89rPeNWLltK5A7vbkzOA/exec', {
        method: 'POST',
        body: params,
      });

      const data = await response.json();
      
      if (data.result === 'success') {
        toast.success('Form submitted successfully!');
        onClose();
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="tokenName">Token Name</Label>
          <Input
            id="tokenName"
            required
            value={formData.tokenName}
            onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="brasetzDID">Brasetz(D-ID)</Label>
          <Input
            id="brasetzDID"
            required
            value={formData.brasetzDID}
            onChange={(e) => setFormData(prev => ({ ...prev, brasetzDID: e.target.value }))}
          />
          <p className="text-sm text-muted-foreground">Must be exactly 70 characters</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="buySell">Buy/Sell</Label>
          <Select
            value={formData.buySell}
            onValueChange={(value) => setFormData(prev => ({ ...prev, buySell: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Buy">Buy</SelectItem>
              <SelectItem value="Sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="currentPrice">Current Price</Label>
          <Input
            id="currentPrice"
            type="number"
            step="0.01"
            required
            value={formData.currentPrice}
            disabled
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </div>
    </form>
  );
};