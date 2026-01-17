import { AlertTriangle, Info, Shield } from "lucide-react";
import { LEGAL_PHRASES } from "./LegalDisclaimers";

interface DiagnosticDisclaimerProps {
  variant?: "compact" | "full";
  showProfessionalWarning?: boolean;
  isCritical?: boolean;
}

const DiagnosticDisclaimer = ({ 
  variant = "compact", 
  showProfessionalWarning = true,
  isCritical = false 
}: DiagnosticDisclaimerProps) => {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>{LEGAL_PHRASES.EDUCATIONAL_ONLY}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Aviso de sistema crítico */}
      {isCritical && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                {LEGAL_PHRASES.CRITICAL_SPECIALIST}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                Este problema requer atenção imediata de um profissional qualificado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Aviso padrão */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-foreground font-medium">
              {LEGAL_PHRASES.NOT_INSTRUCTIVE}
            </p>
            <p className="text-xs text-muted-foreground">
              {LEGAL_PHRASES.PROFESSIONAL_EVALUATION}
            </p>
            {showProfessionalWarning && (
              <p className="text-xs text-muted-foreground">
                {LEGAL_PHRASES.CONSCIOUS_DECISION}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticDisclaimer;
