import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CleanupResult {
  success: boolean;
  deleted: {
    audit_logs: number;
    cache_statistics: number;
    webhook_logs: number;
    rate_limits: number;
    transcription_cache: number;
    checkout_sessions: number;
    expired_procedures: number;
  };
  executed_at: string;
  duration_ms: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Optional: Verify admin access for manual triggers
    const authHeader = req.headers.get("Authorization");
    let isScheduledRun = false;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        if (!adminRole) {
          return new Response(
            JSON.stringify({ error: "Unauthorized: Admin access required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } else {
      // No auth header = scheduled/cron run
      isScheduledRun = true;
    }

    console.log(`[cleanup-old-data] Starting cleanup (scheduled: ${isScheduledRun})`);

    // Call the database function for main cleanup
    const { data: dbResult, error: dbError } = await supabase.rpc("cleanup_old_data");

    if (dbError) {
      console.error("Database cleanup error:", dbError);
      throw dbError;
    }

    // Additional cleanup: expired procedure cache
    const { count: expiredProcedures, error: procError } = await supabase
      .from("carcare_procedure_cache")
      .delete({ count: "exact" })
      .lt("expires_at", new Date().toISOString());

    if (procError) {
      console.warn("Procedure cache cleanup warning:", procError);
    }

    const result: CleanupResult = {
      success: true,
      deleted: {
        ...dbResult.deleted,
        expired_procedures: expiredProcedures || 0,
      },
      executed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    };

    console.log(`[cleanup-old-data] Cleanup completed:`, JSON.stringify(result, null, 2));

    // Log the cleanup event
    await supabase.from("cache_statistics").insert({
      cache_type: "system",
      operation: "cleanup",
      metadata: result,
    });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[cleanup-old-data] Error:", errorMessage);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        duration_ms: Date.now() - startTime,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
