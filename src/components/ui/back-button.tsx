import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  className?: string;
  variant?: "default" | "ghost" | "ghost-light" | "outline" | "secondary" | "destructive" | "link";
  label?: string;
  showLabel?: boolean;
  darkBackground?: boolean;
}

const BackButton = ({ 
  className = "", 
  variant,
  label = "Voltar",
  showLabel = true,
  darkBackground = false
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Usar ghost-light automaticamente em fundos escuros
  const resolvedVariant = variant || (darkBackground ? "ghost-light" : "ghost");

  return (
    <Button
      variant={resolvedVariant}
      onClick={handleBack}
      className={`gap-2 font-chakra uppercase text-sm ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {showLabel && <span>{label}</span>}
    </Button>
  );
};

export default BackButton;
