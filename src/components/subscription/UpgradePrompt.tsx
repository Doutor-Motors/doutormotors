import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  compact?: boolean;
}

/**
 * @deprecated Use ProFeatureGate instead for integrated gating
 */
export function UpgradePrompt({ feature, description, compact = false }: UpgradePromptProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-dashed border-amber-500/30">
        <Lock className="w-4 h-4 text-amber-400" />
        <span className="text-sm text-muted-foreground flex-1">{feature}</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
          onClick={() => navigate("/dashboard/upgrade")}
        >
          <Crown className="w-3 h-3 mr-1" />
          Pro
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-dashed border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold font-chakra uppercase">{feature}</h3>
          {description && (
            <p className="text-sm text-muted-foreground max-w-md">
              {description}
            </p>
          )}
        </div>
        <Button 
          onClick={() => navigate("/dashboard/upgrade")} 
          className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
          <Crown className="w-4 h-4" />
          Fazer Upgrade para Pro
        </Button>
      </CardContent>
    </Card>
  );
}
