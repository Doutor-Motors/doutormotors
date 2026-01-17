import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  className?: string;
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  label?: string;
  showLabel?: boolean;
}

const BackButton = ({ 
  className = "", 
  variant = "ghost",
  label = "Voltar",
  showLabel = true
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleBack}
      className={`gap-2 font-chakra uppercase text-sm ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {showLabel && <span>{label}</span>}
    </Button>
  );
};

export default BackButton;
