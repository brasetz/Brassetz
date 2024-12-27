import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PassphraseDisplayProps {
  generatedPassphrase: string;
}

export const PassphraseDisplay: React.FC<PassphraseDisplayProps> = ({
  generatedPassphrase
}) => {
  if (!generatedPassphrase) return null;

  return (
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
  );
};