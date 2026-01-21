import { motion } from "framer-motion";
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
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted 
                      ? "rgb(34 197 94)" 
                      : isCurrent 
                        ? "hsl(var(--primary))" 
                        : "rgba(255, 255, 255, 0.1)",
                    borderColor: isCompleted 
                      ? "rgb(34 197 94)" 
                      : isCurrent 
                        ? "hsl(var(--primary))" 
                        : "rgba(255, 255, 255, 0.2)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 text-white",
                    isCurrent && "shadow-lg shadow-primary/40"
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <step.icon className={cn(
                        "w-4 h-4",
                        isCurrent ? "text-white" : "text-white/40"
                      )} />
                    </motion.div>
                  )}
                </motion.div>
                
                <motion.span
                  initial={false}
                  animate={{
                    color: isCompleted
                      ? "rgb(74 222 128)"
                      : isCurrent
                        ? "hsl(var(--primary))"
                        : "rgba(255, 255, 255, 0.4)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 text-xs font-medium whitespace-nowrap"
                >
                  {step.label}
                </motion.span>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 relative -mt-6 overflow-hidden">
                  {/* Background line */}
                  <div className="absolute inset-0 bg-white/10 rounded-full" />
                  
                  {/* Animated progress line */}
                  <motion.div
                    initial={false}
                    animate={{
                      scaleX: isCompleted ? 1 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      delay: isCompleted ? 0.1 : 0,
                    }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-green-500 rounded-full"
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
