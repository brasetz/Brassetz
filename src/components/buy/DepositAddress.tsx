import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface DepositAddressProps {
  address: string;
}

export const DepositAddress = ({ address }: DepositAddressProps) => {
  const copyFixedKey = () => {
    navigator.clipboard.writeText(address);
    toast.success("Deposit address copied to clipboard!");
  };

  return (
    <div className="bg-muted p-4 rounded-lg space-y-2">
      <label className="text-sm font-medium">USDT Deposit Address</label>
      <div className="flex items-center justify-between p-2 bg-background rounded-md">
        <code className="text-sm break-all">{address}</code>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={copyFixedKey}
          className="ml-2 flex-shrink-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};