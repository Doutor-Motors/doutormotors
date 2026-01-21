import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

interface MileageSyncState {
  lastSyncedMileage: number | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
}

export function useMileageSync() {
  const { user } = useAuth();
  const { activeVehicleId } = useAppStore();
  const [state, setState] = useState<MileageSyncState>({
    lastSyncedMileage: null,
    lastSyncedAt: null,
    isSyncing: false,
  });

  // Sync mileage from OBD to database and check maintenance reminders
  const syncMileage = useCallback(async (currentMileage: number) => {
    if (!user?.id || !activeVehicleId || currentMileage <= 0) return;

    try {
      setState(prev => ({ ...prev, isSyncing: true }));

      // Update vehicle mileage (we'll add this column if needed)
      // For now, we'll check reminders based on mileage

      // Fetch reminders that might be triggered by this mileage
      const { data: reminders, error } = await supabase
        .from('maintenance_reminders')
        .select('*')
        .eq('vehicle_id', activeVehicleId)
        .eq('is_completed', false)
        .not('due_mileage', 'is', null);

      if (error) throw error;

      // Check which reminders are now due based on mileage
      const dueReminders = reminders?.filter(r => 
        r.due_mileage && currentMileage >= r.due_mileage
      ) || [];

      if (dueReminders.length > 0) {
        // Trigger notifications for due reminders
        for (const reminder of dueReminders) {
          toast.warning(`Manutenção necessária: ${reminder.title}`, {
            description: `Quilometragem atingida: ${currentMileage.toLocaleString()} km`,
            duration: 10000,
          });

          // Update reminder to mark notification as sent
          await supabase
            .from('maintenance_reminders')
            .update({
              notification_sent: true,
              notification_sent_at: new Date().toISOString(),
            })
            .eq('id', reminder.id)
            .eq('notification_sent', false);
        }
      }

      setState({
        lastSyncedMileage: currentMileage,
        lastSyncedAt: new Date().toISOString(),
        isSyncing: false,
      });

      console.log(`[MileageSync] Synced ${currentMileage} km, ${dueReminders.length} reminders due`);
    } catch (err) {
      console.error('[MileageSync] Error:', err);
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [user?.id, activeVehicleId]);

  return {
    ...state,
    syncMileage,
  };
}

export default useMileageSync;
