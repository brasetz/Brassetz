import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton = ({ onClick, label = "Back" }: BackButtonProps) => {
  return (
    <Button
      variant="ghost"
      className="mb-4 hover:bg-muted"
      onClick={onClick}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};