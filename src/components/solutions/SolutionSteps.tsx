import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolutionStepsProps {
  steps: string[];
  onStepComplete?: (stepIndex: number, completed: boolean) => void;
}

const SolutionSteps = ({ steps, onStepComplete }: SolutionStepsProps) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
    onStepComplete?.(index, newCompleted.has(index));
  };

  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {completedSteps.size}/{steps.length} passos
        </span>
      </div>

      {/* Steps List */}
      <ol className="space-y-3">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(idx);
          
          return (
            <li 
              key={idx} 
              className={cn(
                "flex gap-4 p-4 rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-sm",
                isCompleted 
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" 
                  : "bg-card border-border hover:border-primary/50"
              )}
              onClick={() => toggleStep(idx)}
            >
              <div 
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                  isCompleted 
                    ? "bg-green-500 text-white" 
                    : "bg-primary text-primary-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  idx + 1
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className={cn(
                  "text-foreground transition-all duration-300",
                  isCompleted && "line-through text-muted-foreground"
                )}>
                  {step}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Completion Message */}
      {completedSteps.size === steps.length && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center animate-in fade-in slide-in-from-bottom-2">
          <p className="text-green-700 dark:text-green-400 font-medium">
            🎉 Parabéns! Você completou todos os passos!
          </p>
        </div>
      )}
    </div>
  );
};

export default SolutionSteps;
