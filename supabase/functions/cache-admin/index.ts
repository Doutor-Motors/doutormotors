import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CacheAdminRequest {
  action: "stats" | "clear-all" | "clear-expired" | "delete-entry" | "export" | "schedule-info" | "run-scheduled-cleanup";
  entryId?: string;
}

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Verify admin role
async function isAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });
  
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return false;
  
  const supabase = getSupabaseClient();
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  
  return !!role;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    
    // Verify admin access
    const admin = await isAdmin(authHeader);
    if (!admin) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json() as CacheAdminRequest;
    const { action, entryId } = body;
    
    console.log("Cache Admin request:", { action, entryId });
    
    const supabase = getSupabaseClient();

    switch (action) {
      case "stats": {
        // Get total count
        const { count: totalCount } = await supabase
          .from("video_transcription_cache")
          .select("*", { count: "exact", head: true });

        // Get transcription used count
        const { count: transcribedCount } = await supabase
          .from("video_transcription_cache")
          .select("*", { count: "exact", head: true })
          .eq("transcription_used", true);

        // Get expired count
        const { count: expiredCount } = await supabase
          .from("video_transcription_cache")
          .select("*", { count: "exact", head: true })
          .lt("expires_at", new Date().toISOString());

        // Get recent entries
        const { data: recentEntries } = await supabase
          .from("video_transcription_cache")
          .select("id, video_url, youtube_video_id, transcription_used, vehicle_context, created_at, expires_at")
          .order("created_at", { ascending: false })
          .limit(20);

        // Estimate storage (rough estimate based on data size)
        const { data: allData } = await supabase
          .from("video_transcription_cache")
          .select("original_transcription, elaborated_steps, translated_title, translated_description, translated_video_description");
        
        let estimatedStorageBytes = 0;
        allData?.forEach((entry) => {
          estimatedStorageBytes += (entry.original_transcription?.length || 0);
          estimatedStorageBytes += JSON.stringify(entry.elaborated_steps || []).length;
          estimatedStorageBytes += (entry.translated_title?.length || 0);
          estimatedStorageBytes += (entry.translated_description?.length || 0);
          estimatedStorageBytes += (entry.translated_video_description?.length || 0);
        });

        // Calculate oldest and newest
        const { data: oldest } = await supabase
          .from("video_transcription_cache")
          .select("created_at")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        const { data: newest } = await supabase
          .from("video_transcription_cache")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              totalEntries: totalCount || 0,
              transcribedEntries: transcribedCount || 0,
              htmlFallbackEntries: (totalCount || 0) - (transcribedCount || 0),
              expiredEntries: expiredCount || 0,
              estimatedStorageKB: Math.round(estimatedStorageBytes / 1024),
              oldestEntry: oldest?.created_at || null,
              newestEntry: newest?.created_at || null,
              recentEntries: recentEntries || [],
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "clear-all": {
        const { error } = await supabase
          .from("video_transcription_cache")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

        if (error) {
          console.error("Error clearing cache:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("All cache entries cleared");
        return new Response(
          JSON.stringify({ success: true, message: "All cache entries cleared" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "clear-expired": {
        const { data: deleted, error } = await supabase
          .from("video_transcription_cache")
          .delete()
          .lt("expires_at", new Date().toISOString())
          .select("id");

        if (error) {
          console.error("Error clearing expired cache:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Cleared ${deleted?.length || 0} expired cache entries`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `${deleted?.length || 0} expired entries cleared` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete-entry": {
        if (!entryId) {
          return new Response(
            JSON.stringify({ success: false, error: "entryId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("video_transcription_cache")
          .delete()
          .eq("id", entryId);

        if (error) {
          console.error("Error deleting cache entry:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Deleted cache entry: ${entryId}`);
        return new Response(
          JSON.stringify({ success: true, message: "Entry deleted" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "export": {
        // Export all cache entries for backup
        const { data: allEntries, error } = await supabase
          .from("video_transcription_cache")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error exporting cache:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Exported ${allEntries?.length || 0} cache entries`);
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              exportDate: new Date().toISOString(),
              totalEntries: allEntries?.length || 0,
              entries: allEntries || [],
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "schedule-info": {
        // Get scheduled cleanup info from system_settings
        const { data: scheduleSetting } = await supabase
          .from("system_settings")
          .select("*")
          .eq("key", "cache_auto_cleanup")
          .maybeSingle();

        const { data: lastCleanup } = await supabase
          .from("system_settings")
          .select("*")
          .eq("key", "cache_last_cleanup")
          .maybeSingle();

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              enabled: scheduleSetting?.value === true || scheduleSetting?.value === "true",
              schedule: "Semanalmente (Domingo às 03:00 UTC)",
              lastCleanup: lastCleanup?.value || null,
              lastCleanupDate: lastCleanup?.updated_at || null,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "run-scheduled-cleanup": {
        // Manual trigger for scheduled cleanup (also used by cron)
        const { data: deleted, error } = await supabase
          .from("video_transcription_cache")
          .delete()
          .lt("expires_at", new Date().toISOString())
          .select("id");

        if (error) {
          console.error("Error in scheduled cleanup:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update last cleanup timestamp
        const cleanupResult = {
          deletedCount: deleted?.length || 0,
          timestamp: new Date().toISOString(),
        };

        await supabase
          .from("system_settings")
          .upsert({
            key: "cache_last_cleanup",
            value: cleanupResult,
            category: "cache",
            description: "Last automatic cache cleanup result",
          }, { onConflict: "key" });

        console.log(`Scheduled cleanup: removed ${deleted?.length || 0} expired entries`);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Limpeza automática concluída: ${deleted?.length || 0} entradas removidas`,
            data: cleanupResult,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Cache Admin error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
