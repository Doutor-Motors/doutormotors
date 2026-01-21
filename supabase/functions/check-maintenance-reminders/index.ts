import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaintenanceReminder {
  id: string;
  user_id: string;
  vehicle_id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: 'critical' | 'attention' | 'preventive';
  notification_sent: boolean;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
}

interface Profile {
  user_id: string;
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get current date and dates for reminder windows
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Fetch reminders that are due within the next 7 days and haven't been notified
    const { data: reminders, error: remindersError } = await supabase
      .from('maintenance_reminders')
      .select('*')
      .eq('is_completed', false)
      .eq('notification_sent', false)
      .lte('due_date', sevenDaysFromNow.toISOString())
      .order('due_date', { ascending: true });

    if (remindersError) {
      throw remindersError;
    }

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending reminders to process',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[MaintenanceReminders] Processing ${reminders.length} reminders`);

    let notificationsSent = 0;
    const errors: string[] = [];

    for (const reminder of reminders as MaintenanceReminder[]) {
      try {
        // Get vehicle info
        const { data: vehicle } = await supabase
          .from('vehicles')
          .select('id, brand, model, year')
          .eq('id', reminder.vehicle_id)
          .single();

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .eq('user_id', reminder.user_id)
          .single();

        if (!profile) {
          console.warn(`[MaintenanceReminders] No profile found for user ${reminder.user_id}`);
          continue;
        }

        const dueDate = new Date(reminder.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Determine urgency for notification
        let urgency = 'preventive';
        if (daysUntilDue <= 0) {
          urgency = 'critical'; // Overdue
        } else if (daysUntilDue <= 3) {
          urgency = 'attention'; // Due soon
        }

        // Format vehicle name
        const vehicleName = vehicle 
          ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` 
          : 'seu veículo';

        // Format due date message
        let dueMessage = '';
        if (daysUntilDue < 0) {
          dueMessage = `está ${Math.abs(daysUntilDue)} dias atrasada`;
        } else if (daysUntilDue === 0) {
          dueMessage = 'vence hoje';
        } else if (daysUntilDue === 1) {
          dueMessage = 'vence amanhã';
        } else {
          dueMessage = `vence em ${daysUntilDue} dias`;
        }

        // Send notification via the send-notification function
        const notificationPayload = {
          type: 'maintenance_reminder',
          userId: reminder.user_id,
          data: {
            reminderId: reminder.id,
            title: reminder.title,
            description: reminder.description,
            vehicleName,
            dueDate: dueDate.toLocaleDateString('pt-BR'),
            dueMessage,
            priority: urgency,
            userName: profile.name,
          },
        };

        const notificationResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify(notificationPayload),
          }
        );

        if (notificationResponse.ok) {
          // Mark reminder as notified
          await supabase
            .from('maintenance_reminders')
            .update({
              notification_sent: true,
              notification_sent_at: now.toISOString(),
            })
            .eq('id', reminder.id);

          notificationsSent++;
          console.log(`[MaintenanceReminders] Notification sent for reminder ${reminder.id}`);
        } else {
          const errorText = await notificationResponse.text();
          console.error(`[MaintenanceReminders] Failed to send notification: ${errorText}`);
          errors.push(`Reminder ${reminder.id}: ${errorText}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[MaintenanceReminders] Error processing reminder ${reminder.id}:`, err);
        errors.push(`Reminder ${reminder.id}: ${errorMessage}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: reminders.length,
        notificationsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[MaintenanceReminders] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
