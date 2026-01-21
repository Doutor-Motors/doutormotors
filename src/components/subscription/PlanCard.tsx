import { Check, X, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PlanType, PLAN_FEATURES } from "@/hooks/useSubscription";

interface PlanCardProps {
  planType: PlanType;
  isCurrentPlan: boolean;
  onSelect: (plan: PlanType) => void;
  isLoading?: boolean;
}

export function PlanCard({ planType, isCurrentPlan, onSelect, isLoading }: PlanCardProps) {
  const plan = PLAN_FEATURES[planType];
  const isPro = planType === "pro";

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all duration-300 hover:shadow-lg",
        isPro && "border-primary shadow-md scale-[1.02]",
        isCurrentPlan && "ring-2 ring-primary"
      )}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            <Crown className="w-3 h-3 mr-1" />
            Mais Popular
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary" className="px-3 py-1">
            Seu Plano
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2">
          {isPro ? (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Zap className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-foreground">{plan.price}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Incluído
          </p>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {plan.limitations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Limitações
            </p>
            <ul className="space-y-2">
              {plan.limitations.map((limitation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isPro ? "default" : "outline"}
          disabled={isCurrentPlan || isLoading}
          onClick={() => onSelect(planType)}
        >
          {isCurrentPlan
            ? "Plano Atual"
            : isPro
            ? "Fazer Upgrade"
            : "Selecionar"}
        </Button>
      </CardFooter>
    </Card>
  );
}
