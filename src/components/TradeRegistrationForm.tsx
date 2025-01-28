import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FormData {
  "Token Name": string;
  "Brasetz(D-ID)": string;
  Email: string;
  "Buy/Sell": string;
  "Current price": string;
  "Date and Time": string;
}

export const TradeRegistrationForm = ({ onClose }: { onClose: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    "Token Name": "",
    "Brasetz(D-ID)": "",
    Email: "",
    "Buy/Sell": "Buy",
    "Current price": "",
    "Date and Time": "",
  });

  const validateForm = () => {
    if (!formData["Token Name"]) {
      toast.error("Token Name is required");
      return false;
    }
    if (!formData["Brasetz(D-ID)"] || formData["Brasetz(D-ID)"].length !== 70) {
      toast.error("Brasetz(D-ID) must be exactly 70 characters");
      return false;
    }
    if (!formData.Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData["Current price"] || parseFloat(formData["Current price"]) <= 0) {
      toast.error("Please enter a valid current price");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Add UTC timestamp and date
    const now = new Date();
    const timestamp = now.toISOString();
    const formDataWithTimestamp = {
      ...formData,
      "Date and Time": timestamp
    };

    const params = new URLSearchParams();
    Object.entries(formDataWithTimestamp).forEach(([key, value]) => {
      params.append(key, value.toString());
    });

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxweoEBqT8VyJo-EiPQXEQySXzbJZUPAKYNy6LiL9xs2_idfy89rPeNWLltK5A7vbkzOA/exec",
        {
          method: "POST",
          body: params,
        }
      );

      const data = await response.json();

      if (data.result === "success") {
        toast.success("Trade registration submitted successfully!");
        onClose();
      } else {
        toast.error(`Error: ${data.error || "Something went wrong"}`);
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Something went wrong"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="TokenName">Token Name</Label>
          <Input
            id="TokenName"
            value={formData["Token Name"]}
            onChange={(e) => setFormData({ ...formData, "Token Name": e.target.value })}
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="BrasetzDID">Brasetz(D-ID)</Label>
          <Input
            id="BrasetzDID"
            value={formData["Brasetz(D-ID)"]}
            onChange={(e) => setFormData({ ...formData, "Brasetz(D-ID)": e.target.value })}
            className="w-full"
            maxLength={70}
            required
          />
          <p className="text-sm text-muted-foreground">
            Must be exactly 70 characters. Current length: {formData["Brasetz(D-ID)"].length}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="Email">Email</Label>
          <Input
            id="Email"
            type="email"
            value={formData.Email}
            onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="BuySell">Buy/Sell</Label>
          <Select
            value={formData["Buy/Sell"]}
            onValueChange={(value) => setFormData({ ...formData, "Buy/Sell": value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Buy">Buy</SelectItem>
              <SelectItem value="Sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="CurrentPrice">Current Price</Label>
          <Input
            id="CurrentPrice"
            type="number"
            step="0.01"
            value={formData["Current price"]}
            onChange={(e) => setFormData({ ...formData, "Current price": e.target.value })}
            className="w-full"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Trade Registration"
        )}
      </Button>
    </form>
  );
};