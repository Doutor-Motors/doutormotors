import { useState } from "react";
import { format, isPast, isWithinInterval, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  Plus,
  Check,
  AlertTriangle,
  Clock,
  Wrench,
  Droplets,
  Disc,
  Filter,
  Zap,
  Car,
  ChevronDown,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useMaintenanceReminders, MaintenanceReminder } from "@/hooks/useMaintenanceReminders";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

const REMINDER_TYPES = [
  { value: "oil_change", label: "Troca de Óleo", icon: Droplets },
  { value: "tire_rotation", label: "Rodízio de Pneus", icon: Disc },
  { value: "brake_inspection", label: "Inspeção de Freios", icon: Disc },
  { value: "air_filter", label: "Filtro de Ar", icon: Filter },
  { value: "spark_plugs", label: "Velas de Ignição", icon: Zap },
  { value: "general", label: "Manutenção Geral", icon: Wrench },
];

const PRIORITY_CONFIG = {
  critical: { color: "bg-red-500", label: "Crítico", icon: AlertTriangle },
  attention: { color: "bg-orange-500", label: "Atenção", icon: Clock },
  preventive: { color: "bg-yellow-500", label: "Preventivo", icon: Bell },
};

interface ReminderFormData {
  title: string;
  reminder_type: string;
  priority: "critical" | "attention" | "preventive";
  due_date: string;
  due_mileage?: number;
  interval_months?: number;
  interval_km?: number;
  description?: string;
}

export function MaintenanceRemindersPanel() {
  const { activeVehicleId } = useAppStore();
  const { 
    reminders, 
    isLoading, 
    createReminder, 
    completeReminder, 
    deleteReminder,
    isCreating 
  } = useMaintenanceReminders(activeVehicleId || undefined);
  
  const [isOpen, setIsOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [formData, setFormData] = useState<ReminderFormData>({
    title: "",
    reminder_type: "oil_change",
    priority: "preventive",
    due_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicleId) return;

    await createReminder({
      vehicle_id: activeVehicleId,
      title: formData.title,
      reminder_type: formData.reminder_type,
      priority: formData.priority,
      due_date: formData.due_date,
      due_mileage: formData.due_mileage,
      interval_months: formData.interval_months,
      interval_km: formData.interval_km,
      description: formData.description,
    });

    setFormData({
      title: "",
      reminder_type: "oil_change",
      priority: "preventive",
      due_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    });
    setIsOpen(false);
  };

  const getStatusBadge = (reminder: MaintenanceReminder) => {
    if (reminder.is_completed) {
      return <Badge className="bg-green-500 text-white">Concluído</Badge>;
    }
    
    const dueDate = new Date(reminder.due_date);
    const today = new Date();
    
    if (isPast(dueDate)) {
      return <Badge className="bg-red-500 text-white">Atrasado</Badge>;
    }
    
    if (isWithinInterval(dueDate, { start: today, end: addDays(today, 7) })) {
      return <Badge className="bg-orange-500 text-white">Próximo</Badge>;
    }
    
    return <Badge variant="outline">Agendado</Badge>;
  };

  const getReminderIcon = (type: string) => {
    const config = REMINDER_TYPES.find(t => t.value === type);
    const Icon = config?.icon || Wrench;
    return <Icon className="w-4 h-4" />;
  };

  const activeReminders = reminders.filter(r => !r.is_completed);
  const completedReminders = reminders.filter(r => r.is_completed);

  if (!activeVehicleId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Car className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            Selecione um veículo para ver os lembretes de manutenção
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-chakra text-lg uppercase flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Lembretes de Manutenção
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="font-chakra uppercase">
              <Plus className="w-4 h-4 mr-1" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-chakra uppercase">
                Novo Lembrete de Manutenção
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Troca de óleo do motor"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.reminder_type}
                    onValueChange={(v) => setFormData({ ...formData, reminder_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v: "critical" | "attention" | "preventive") => 
                      setFormData({ ...formData, priority: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", config.color)} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Prevista</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Km Previsto (opcional)</Label>
                  <Input
                    type="number"
                    value={formData.due_mileage || ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      due_mileage: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Ex: 50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Intervalo (meses)</Label>
                  <Input
                    type="number"
                    value={formData.interval_months || ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      interval_months: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Ex: 6"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Intervalo (km)</Label>
                  <Input
                    type="number"
                    value={formData.interval_km || ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      interval_km: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Ex: 10000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais sobre a manutenção..."
                  rows={2}
                />
              </div>

              <Button type="submit" className="w-full font-chakra uppercase" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Lembrete
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : activeReminders.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum lembrete ativo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione lembretes para não esquecer suas manutenções
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className={cn(
                  "p-2 rounded-full",
                  PRIORITY_CONFIG[reminder.priority].color,
                  "text-white"
                )}>
                  {getReminderIcon(reminder.reminder_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm truncate">
                      {reminder.title}
                    </span>
                    {getStatusBadge(reminder)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(reminder.due_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    {reminder.due_mileage && ` • ${reminder.due_mileage.toLocaleString()} km`}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                    onClick={() => completeReminder(reminder.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {completedReminders.length > 0 && (
          <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-sm">
                <span>Concluídos ({completedReminders.length})</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  showCompleted && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {completedReminders.slice(0, 5).map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg opacity-60"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm line-through truncate">
                      {reminder.title}
                    </span>
                    {reminder.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Concluído em {format(new Date(reminder.completed_at), "dd/MM/yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
