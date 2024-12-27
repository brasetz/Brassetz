import { Check, X } from "lucide-react";

interface StatusDisplayProps {
  isValid: boolean;
  isAmountValid: boolean;
  passcode: string;
}

export const StatusDisplay = ({ isValid, isAmountValid, passcode }: StatusDisplayProps) => {
  const isApproved = isValid && isAmountValid;
  
  if (!passcode) return null;
  
  return (
    <div className="bg-muted p-4 rounded-lg space-y-2">
      <label className="text-sm font-medium">Status</label>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-background p-2 rounded-md w-full">
          <span className={isApproved ? 'text-green-500' : 'text-red-500'}>
            {isApproved ? 'Approved' : 'Not Approved'}
          </span>
          {isApproved ? (
            <Check className="text-green-500 h-5 w-5" />
          ) : (
            <X className="text-red-500 h-5 w-5" />
          )}
        </div>
      </div>
    </div>
  );
};