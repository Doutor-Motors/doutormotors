import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KPITarget {
  id: string;
  name: string;
  target: number;
  alertEnabled: boolean;
  alertThreshold: number;
}

interface KPIMetric {
  id: string;
  name: string;
  current: number;
  target: number;
  percentage: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get KPI targets from settings
    const { data: settings } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "kpi_targets")
      .maybeSingle();

    if (!settings?.value) {
      return new Response(
        JSON.stringify({ message: "No KPI targets configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targets = settings.value as KPITarget[];
    const enabledTargets = targets.filter(t => t.alertEnabled);

    if (enabledTargets.length === 0) {
      return new Response(
        JSON.stringify({ message: "No alerts enabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch current metrics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

    // Get total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get pro subscribers
    const { count: proUsers } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("plan_type", "pro")
      .eq("status", "active");

    // Get monthly diagnostics
    const { count: monthlyDiagnostics } = await supabase
      .from("diagnostics")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth);

    // Get monthly recordings
    const { count: monthlyRecordings } = await supabase
      .from("data_recordings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth)
      .lte("created_at", endOfMonth);

    // Get daily active users
    const { count: dailyActiveUsers } = await supabase
      .from("diagnostics")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd);

    const currentMetrics: Record<string, number> = {
      'total-users': totalUsers || 0,
      'pro-subscribers': proUsers || 0,
      'monthly-diagnostics': monthlyDiagnostics || 0,
      'monthly-recordings': monthlyRecordings || 0,
      'daily-active': dailyActiveUsers || 0,
    };

    // Check which KPIs are below threshold
    const alertsToSend: KPIMetric[] = [];

    for (const target of enabledTargets) {
      const current = currentMetrics[target.id] || 0;
      const percentage = target.target > 0 ? (current / target.target) * 100 : 0;
      
      if (percentage < target.alertThreshold) {
        alertsToSend.push({
          id: target.id,
          name: target.name,
          current,
          target: target.target,
          percentage,
        });
      }
    }

    if (alertsToSend.length === 0) {
      return new Response(
        JSON.stringify({ message: "All KPIs are on track" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin users to notify
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminIds = adminRoles.map(r => r.user_id);

    // Create system alert for admins
    const alertMessage = alertsToSend.map(a => 
      `• ${a.name}: ${a.current.toLocaleString()} de ${a.target.toLocaleString()} (${a.percentage.toFixed(0)}%)`
    ).join('\n');

    const { error: alertError } = await supabase
      .from("system_alerts")
      .insert({
        title: "⚠️ Alerta de KPIs",
        message: `Os seguintes KPIs estão abaixo da meta:\n\n${alertMessage}`,
        type: "warning",
        priority: "high",
        target_type: "specific",
        target_user_ids: adminIds,
        sent_by: adminIds[0], // First admin as sender
        send_email: true,
      });

    if (alertError) {
      console.error("Error creating alert:", alertError);
    }

    return new Response(
      JSON.stringify({ 
        message: "KPI alerts sent",
        alerts: alertsToSend,
        notifiedAdmins: adminIds.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error("Error in check-kpi-alerts:", err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
