import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface KPITarget {
  id: string;
  name: string;
  target: number;
  alertEnabled: boolean;
  alertThreshold: number; // percentage below target to trigger alert
}

interface KPITargetEditorProps {
  targets: KPITarget[];
  onSave: (targets: KPITarget[]) => Promise<void>;
  isLoading?: boolean;
}

export function KPITargetEditor({ targets, onSave, isLoading }: KPITargetEditorProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editedTargets, setEditedTargets] = useState<KPITarget[]>(targets);
  const [saving, setSaving] = useState(false);

  const handleTargetChange = (id: string, field: keyof KPITarget, value: number | boolean) => {
    setEditedTargets(prev => 
      prev.map(t => t.id === id ? { ...t, [field]: value } : t)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedTargets);
      toast({
        title: "Metas salvas!",
        description: "As metas foram atualizadas com sucesso.",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as metas.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Sync with props when they change
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setEditedTargets(targets);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
          <Settings className="w-4 h-4" />
          Configurar Metas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Metas e Alertas</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {editedTargets.map((target) => (
            <div key={target.id} className="p-4 rounded-lg border bg-muted/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{target.name}</h4>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`alert-${target.id}`} className="text-sm text-muted-foreground">
                    Alertas
                  </Label>
                  <Switch
                    id={`alert-${target.id}`}
                    checked={target.alertEnabled}
                    onCheckedChange={(checked) => handleTargetChange(target.id, 'alertEnabled', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`target-${target.id}`}>Meta</Label>
                  <Input
                    id={`target-${target.id}`}
                    type="number"
                    min={0}
                    value={target.target}
                    onChange={(e) => handleTargetChange(target.id, 'target', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`threshold-${target.id}`}>
                    Alertar abaixo de (%)
                  </Label>
                  <Input
                    id={`threshold-${target.id}`}
                    type="number"
                    min={0}
                    max={100}
                    value={target.alertThreshold}
                    onChange={(e) => handleTargetChange(target.id, 'alertThreshold', parseInt(e.target.value) || 0)}
                    disabled={!target.alertEnabled}
                  />
                </div>
              </div>

              {target.alertEnabled && (
                <p className="text-xs text-muted-foreground">
                  Um alerta será enviado quando o progresso estiver abaixo de {target.alertThreshold}% da meta ({Math.floor(target.target * target.alertThreshold / 100).toLocaleString()}).
                </p>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Metas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
