import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type ReminderType = 
  | 'oil_change' 
  | 'tire_rotation' 
  | 'brake_inspection' 
  | 'air_filter' 
  | 'coolant' 
  | 'transmission' 
  | 'battery' 
  | 'spark_plugs' 
  | 'timing_belt' 
  | 'custom';

export type ReminderPriority = 'critical' | 'attention' | 'preventive';

export interface MaintenanceReminder {
  id: string;
  user_id: string;
  vehicle_id: string;
  reminder_type: ReminderType;
  title: string;
  description: string | null;
  due_date: string;
  due_mileage: number | null;
  last_service_date: string | null;
  last_service_mileage: number | null;
  interval_months: number | null;
  interval_km: number | null;
  is_completed: boolean;
  completed_at: string | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  priority: ReminderPriority;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderInput {
  vehicle_id: string;
  reminder_type: ReminderType;
  title: string;
  description?: string;
  due_date: Date;
  due_mileage?: number;
  last_service_date?: Date;
  last_service_mileage?: number;
  interval_months?: number;
  interval_km?: number;
  priority?: ReminderPriority;
}

// Predefined maintenance types with recommended intervals
export const MAINTENANCE_TYPES: Record<ReminderType, {
  label: string;
  description: string;
  defaultIntervalMonths: number;
  defaultIntervalKm: number;
  priority: ReminderPriority;
}> = {
  oil_change: {
    label: 'Troca de Óleo',
    description: 'Troca de óleo do motor e filtro',
    defaultIntervalMonths: 6,
    defaultIntervalKm: 10000,
    priority: 'attention',
  },
  tire_rotation: {
    label: 'Rodízio de Pneus',
    description: 'Rodízio e balanceamento dos pneus',
    defaultIntervalMonths: 6,
    defaultIntervalKm: 10000,
    priority: 'preventive',
  },
  brake_inspection: {
    label: 'Inspeção de Freios',
    description: 'Verificar pastilhas, discos e fluido de freio',
    defaultIntervalMonths: 12,
    defaultIntervalKm: 20000,
    priority: 'critical',
  },
  air_filter: {
    label: 'Filtro de Ar',
    description: 'Troca do filtro de ar do motor',
    defaultIntervalMonths: 12,
    defaultIntervalKm: 15000,
    priority: 'preventive',
  },
  coolant: {
    label: 'Fluido de Arrefecimento',
    description: 'Verificar/trocar fluido do radiador',
    defaultIntervalMonths: 24,
    defaultIntervalKm: 40000,
    priority: 'attention',
  },
  transmission: {
    label: 'Óleo de Câmbio',
    description: 'Troca do óleo da transmissão',
    defaultIntervalMonths: 36,
    defaultIntervalKm: 60000,
    priority: 'preventive',
  },
  battery: {
    label: 'Bateria',
    description: 'Verificar/trocar bateria do veículo',
    defaultIntervalMonths: 36,
    defaultIntervalKm: 0,
    priority: 'attention',
  },
  spark_plugs: {
    label: 'Velas de Ignição',
    description: 'Troca das velas de ignição',
    defaultIntervalMonths: 24,
    defaultIntervalKm: 30000,
    priority: 'preventive',
  },
  timing_belt: {
    label: 'Correia Dentada',
    description: 'Troca da correia dentada',
    defaultIntervalMonths: 60,
    defaultIntervalKm: 100000,
    priority: 'critical',
  },
  custom: {
    label: 'Personalizado',
    description: 'Lembrete personalizado',
    defaultIntervalMonths: 12,
    defaultIntervalKm: 20000,
    priority: 'preventive',
  },
};

interface UseMaintenanceRemindersReturn {
  reminders: MaintenanceReminder[];
  upcomingReminders: MaintenanceReminder[];
  overdueReminders: MaintenanceReminder[];
  isLoading: boolean;
  error: Error | null;
  createReminder: (input: CreateReminderInput) => Promise<MaintenanceReminder | null>;
  updateReminder: (id: string, updates: Partial<CreateReminderInput>) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
  completeReminder: (id: string, completedDate?: Date) => Promise<boolean>;
  getRemindersForVehicle: (vehicleId: string) => MaintenanceReminder[];
  refresh: () => Promise<void>;
}

export function useMaintenanceReminders(): UseMaintenanceRemindersReturn {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all reminders for the user
  const fetchReminders = useCallback(async () => {
    if (!user?.id) {
      setReminders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('maintenance_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;

      setReminders((data || []) as MaintenanceReminder[]);
    } catch (err) {
      console.error('[MaintenanceReminders] Fetch error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch reminders'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Create a new reminder
  const createReminder = useCallback(async (input: CreateReminderInput): Promise<MaintenanceReminder | null> => {
    if (!user?.id) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      const typeInfo = MAINTENANCE_TYPES[input.reminder_type];
      
      const { data, error: insertError } = await supabase
        .from('maintenance_reminders')
        .insert({
          user_id: user.id,
          vehicle_id: input.vehicle_id,
          reminder_type: input.reminder_type,
          title: input.title,
          description: input.description || typeInfo.description,
          due_date: input.due_date.toISOString(),
          due_mileage: input.due_mileage || null,
          last_service_date: input.last_service_date?.toISOString() || null,
          last_service_mileage: input.last_service_mileage || null,
          interval_months: input.interval_months || typeInfo.defaultIntervalMonths,
          interval_km: input.interval_km || typeInfo.defaultIntervalKm,
          priority: input.priority || typeInfo.priority,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newReminder = data as MaintenanceReminder;
      setReminders(prev => [...prev, newReminder].sort((a, b) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      ));
      
      toast.success('Lembrete criado com sucesso');
      return newReminder;
    } catch (err) {
      console.error('[MaintenanceReminders] Create error:', err);
      toast.error('Erro ao criar lembrete');
      return null;
    }
  }, [user?.id]);

  // Update a reminder
  const updateReminder = useCallback(async (id: string, updates: Partial<CreateReminderInput>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.due_date) updateData.due_date = updates.due_date.toISOString();
      if (updates.due_mileage !== undefined) updateData.due_mileage = updates.due_mileage;
      if (updates.interval_months !== undefined) updateData.interval_months = updates.interval_months;
      if (updates.interval_km !== undefined) updateData.interval_km = updates.interval_km;
      if (updates.priority) updateData.priority = updates.priority;

      const { error: updateError } = await supabase
        .from('maintenance_reminders')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      setReminders(prev => prev.map(r => 
        r.id === id ? { ...r, ...updateData, updated_at: new Date().toISOString() } as MaintenanceReminder : r
      ));
      
      toast.success('Lembrete atualizado');
      return true;
    } catch (err) {
      console.error('[MaintenanceReminders] Update error:', err);
      toast.error('Erro ao atualizar lembrete');
      return false;
    }
  }, []);

  // Delete a reminder
  const deleteReminder = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('maintenance_reminders')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success('Lembrete removido');
      return true;
    } catch (err) {
      console.error('[MaintenanceReminders] Delete error:', err);
      toast.error('Erro ao remover lembrete');
      return false;
    }
  }, []);

  // Mark a reminder as completed and optionally schedule the next one
  const completeReminder = useCallback(async (id: string, completedDate?: Date): Promise<boolean> => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return false;

      const now = completedDate || new Date();

      const { error: updateError } = await supabase
        .from('maintenance_reminders')
        .update({
          is_completed: true,
          completed_at: now.toISOString(),
          last_service_date: now.toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Create next reminder based on interval
      if (reminder.interval_months && reminder.interval_months > 0) {
        const nextDueDate = new Date(now);
        nextDueDate.setMonth(nextDueDate.getMonth() + reminder.interval_months);

        await createReminder({
          vehicle_id: reminder.vehicle_id,
          reminder_type: reminder.reminder_type as ReminderType,
          title: reminder.title,
          description: reminder.description || undefined,
          due_date: nextDueDate,
          interval_months: reminder.interval_months,
          interval_km: reminder.interval_km || undefined,
          priority: reminder.priority as ReminderPriority,
          last_service_date: now,
        });
      }

      setReminders(prev => prev.map(r => 
        r.id === id ? { ...r, is_completed: true, completed_at: now.toISOString() } : r
      ));
      
      toast.success('Manutenção concluída! Próximo lembrete agendado.');
      return true;
    } catch (err) {
      console.error('[MaintenanceReminders] Complete error:', err);
      toast.error('Erro ao concluir manutenção');
      return false;
    }
  }, [reminders, createReminder]);

  // Get reminders for a specific vehicle
  const getRemindersForVehicle = useCallback((vehicleId: string): MaintenanceReminder[] => {
    return reminders.filter(r => r.vehicle_id === vehicleId && !r.is_completed);
  }, [reminders]);

  // Calculate upcoming and overdue reminders
  const now = new Date();
  const upcomingReminders = reminders.filter(r => 
    !r.is_completed && new Date(r.due_date) >= now
  );
  const overdueReminders = reminders.filter(r => 
    !r.is_completed && new Date(r.due_date) < now
  );

  return {
    reminders,
    upcomingReminders,
    overdueReminders,
    isLoading,
    error,
    createReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    getRemindersForVehicle,
    refresh: fetchReminders,
  };
}

export default useMaintenanceReminders;
