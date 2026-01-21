import { useState, useEffect } from "react";
import { Bell, Mail, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type NotificationPreferences = Tables<"user_notification_preferences">;

interface NotificationSettingsProps {
  userId: string;
}

const NotificationSettings = ({ userId }: NotificationSettingsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({
    email_critical_diagnostics: true,
    email_diagnostic_completed: true,
    email_ticket_updates: true,
    email_account_updates: true,
    email_marketing: false,
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current preferences
  const { data: existingPreferences, isLoading } = useQuery({
    queryKey: ["notification-preferences", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as NotificationPreferences | null;
    },
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (existingPreferences) {
      setPreferences({
        email_critical_diagnostics: existingPreferences.email_critical_diagnostics,
        email_diagnostic_completed: existingPreferences.email_diagnostic_completed,
        email_ticket_updates: existingPreferences.email_ticket_updates,
        email_account_updates: existingPreferences.email_account_updates,
        email_marketing: existingPreferences.email_marketing,
      });
    }
  }, [existingPreferences]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (existingPreferences) {
        // Update existing
        const { error } = await supabase
          .from("user_notification_preferences")
          .update(preferences)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("user_notification_preferences")
          .insert({
            user_id: userId,
            ...preferences,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      setHasChanges(false);
      toast({
        title: "Preferências salvas!",
        description: "Suas configurações de notificação foram atualizadas.",
      });
    },
    onError: (error) => {
      console.error("Error saving preferences:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-chakra uppercase flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações por Email
        </CardTitle>
        <CardDescription>
          Configure quais notificações você deseja receber por email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critical Diagnostics */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <Label htmlFor="critical" className="font-medium">
                Alertas Críticos
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Notificações de problemas críticos que afetam a segurança do veículo
            </p>
          </div>
          <Switch
            id="critical"
            checked={preferences.email_critical_diagnostics}
            onCheckedChange={() => handleToggle("email_critical_diagnostics")}
          />
        </div>

        {/* Diagnostic Completed */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <Label htmlFor="completed" className="font-medium">
                Diagnóstico Concluído
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receba um email quando um diagnóstico for concluído
            </p>
          </div>
          <Switch
            id="completed"
            checked={preferences.email_diagnostic_completed}
            onCheckedChange={() => handleToggle("email_diagnostic_completed")}
          />
        </div>

        {/* Ticket Updates */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <Label htmlFor="tickets" className="font-medium">
                Atualizações de Tickets
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Notificações sobre respostas e atualizações em seus tickets de suporte
            </p>
          </div>
          <Switch
            id="tickets"
            checked={preferences.email_ticket_updates}
            onCheckedChange={() => handleToggle("email_ticket_updates")}
          />
        </div>

        {/* Account Updates */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <Label htmlFor="account" className="font-medium">
                Atualizações da Conta
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Alertas de segurança sobre alterações na sua conta
            </p>
          </div>
          <Switch
            id="account"
            checked={preferences.email_account_updates}
            onCheckedChange={() => handleToggle("email_account_updates")}
          />
        </div>

        {/* Marketing */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="marketing" className="font-medium">
              Novidades e Promoções
            </Label>
            <p className="text-sm text-muted-foreground">
              Receba dicas, novidades e ofertas especiais
            </p>
          </div>
          <Switch
            id="marketing"
            checked={preferences.email_marketing}
            onCheckedChange={() => handleToggle("email_marketing")}
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="w-full sm:w-auto"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Preferências"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;