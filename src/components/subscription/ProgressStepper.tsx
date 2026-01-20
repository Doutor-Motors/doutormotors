import { Check, UserPlus, CreditCard, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { id: 1, label: "Cadastro", icon: UserPlus },
  { id: 2, label: "Plano", icon: ListChecks },
  { id: 3, label: "Pagamento", icon: CreditCard },
];

interface ProgressStepperProps {
  currentStep: 1 | 2 | 3;
  className?: string;
}

export function ProgressStepper({ currentStep, className }: ProgressStepperProps) {
  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="flex items-center justify-between relative">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === STEPS.length - 1;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                        ? "bg-primary border-primary text-white animate-pulse"
                        : "bg-white/10 border-white/20 text-white/40"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors whitespace-nowrap",
                    isCompleted
                      ? "text-green-400"
                      : isCurrent
                        ? "text-primary"
                        : "text-white/40"
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 relative -mt-6">
                  <div className="absolute inset-0 bg-white/10 rounded-full" />
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full transition-all duration-500",
                      isCompleted ? "bg-green-500 w-full" : "bg-transparent w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
