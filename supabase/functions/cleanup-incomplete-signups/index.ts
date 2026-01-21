import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Dias de inatividade antes de limpar conta incompleta
const INACTIVE_DAYS_THRESHOLD = 7;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("[CLEANUP] Starting incomplete signup cleanup...");

    // Calcular data limite (7 dias atrás)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - INACTIVE_DAYS_THRESHOLD);
    const thresholdISO = thresholdDate.toISOString();

    console.log(`[CLEANUP] Looking for users created before ${thresholdISO} without active subscription...`);

    // Buscar todos os profiles criados há mais de 7 dias
    const { data: oldProfiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, name, email, created_at")
      .lt("created_at", thresholdISO);

    if (profilesError) {
      console.error("[CLEANUP] Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!oldProfiles || oldProfiles.length === 0) {
      console.log("[CLEANUP] No old profiles found to check.");
      return new Response(JSON.stringify({
        success: true,
        message: "No profiles to check",
        deletedCount: 0,
        checkedCount: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[CLEANUP] Found ${oldProfiles.length} profiles older than ${INACTIVE_DAYS_THRESHOLD} days`);

    const deletedUsers: { userId: string; email: string | null; name: string | null }[] = [];
    const errors: { userId: string; error: string }[] = [];

    for (const profile of oldProfiles) {
      const userId = profile.user_id;

      try {
        // Verificar se o usuário tem subscription ativa ou paga
        const { data: subscription, error: subError } = await supabaseAdmin
          .from("user_subscriptions")
          .select("id, status, plan_type")
          .eq("user_id", userId)
          .in("status", ["active", "trialing"])
          .maybeSingle();

        if (subError) {
          console.error(`[CLEANUP] Error checking subscription for ${userId}:`, subError);
          errors.push({ userId, error: subError.message });
          continue;
        }

        // Se tem subscription ativa, não deletar
        if (subscription) {
          console.log(`[CLEANUP] User ${userId} has active subscription, skipping...`);
          continue;
        }

        // Verificar se tem algum pagamento confirmado
        const { data: payments, error: payError } = await supabaseAdmin
          .from("payments")
          .select("id, status")
          .eq("user_id", userId)
          .eq("status", "paid")
          .limit(1);

        if (payError) {
          console.error(`[CLEANUP] Error checking payments for ${userId}:`, payError);
          errors.push({ userId, error: payError.message });
          continue;
        }

        // Se tem pagamento confirmado, não deletar
        if (payments && payments.length > 0) {
          console.log(`[CLEANUP] User ${userId} has confirmed payment, skipping...`);
          continue;
        }

        // Verificar se é admin (nunca deletar admins)
        const { data: adminRole } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (adminRole) {
          console.log(`[CLEANUP] User ${userId} is admin, skipping...`);
          continue;
        }

        console.log(`[CLEANUP] Deleting incomplete user ${userId} (${profile.email})...`);

        // Deletar dados relacionados do usuário
        // 1. Delete user roles
        await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);

        // 2. Delete subscriptions (mesmo pendentes)
        await supabaseAdmin.from("user_subscriptions").delete().eq("user_id", userId);

        // 3. Delete notification preferences
        await supabaseAdmin.from("user_notification_preferences").delete().eq("user_id", userId);

        // 4. Delete usage tracking
        await supabaseAdmin.from("usage_tracking").delete().eq("user_id", userId);

        // 5. Delete legal consents
        await supabaseAdmin.from("legal_consents").delete().eq("user_id", userId);

        // 6. Delete OBD settings
        await supabaseAdmin.from("obd_settings").delete().eq("user_id", userId);

        // 7. Delete coding executions
        await supabaseAdmin.from("coding_executions").delete().eq("user_id", userId);

        // 8. Delete data recordings and their data points
        const { data: recordings } = await supabaseAdmin
          .from("data_recordings")
          .select("id")
          .eq("user_id", userId);

        if (recordings && recordings.length > 0) {
          const recordingIds = recordings.map(r => r.id);
          await supabaseAdmin.from("recording_data_points").delete().in("recording_id", recordingIds);
          await supabaseAdmin.from("data_recordings").delete().eq("user_id", userId);
        }

        // 9. Delete diagnostics and their items
        const { data: diagnostics } = await supabaseAdmin
          .from("diagnostics")
          .select("id")
          .eq("user_id", userId);

        if (diagnostics && diagnostics.length > 0) {
          const diagnosticIds = diagnostics.map(d => d.id);
          await supabaseAdmin.from("diagnostic_items").delete().in("diagnostic_id", diagnosticIds);
          await supabaseAdmin.from("diagnostics").delete().eq("user_id", userId);
        }

        // 10. Delete support tickets and their messages
        const { data: tickets } = await supabaseAdmin
          .from("support_tickets")
          .select("id")
          .eq("user_id", userId);

        if (tickets && tickets.length > 0) {
          const ticketIds = tickets.map(t => t.id);
          await supabaseAdmin.from("ticket_messages").delete().in("ticket_id", ticketIds);
          await supabaseAdmin.from("support_tickets").delete().eq("user_id", userId);
        }

        // 11. Delete vehicles
        await supabaseAdmin.from("vehicles").delete().eq("user_id", userId);

        // 12. Delete tutorial progress and favorites
        await supabaseAdmin.from("tutorial_progress").delete().eq("user_id", userId);
        await supabaseAdmin.from("tutorial_favorites").delete().eq("user_id", userId);

        // 13. Delete payments pendentes (não pagos)
        await supabaseAdmin.from("payments").delete().eq("user_id", userId);

        // 14. Delete checkout sessions
        await supabaseAdmin.from("checkout_sessions").delete().eq("user_id", userId);

        // 15. Delete profile
        await supabaseAdmin.from("profiles").delete().eq("user_id", userId);

        // 16. Deletar usuário do auth.users
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteAuthError) {
          console.error(`[CLEANUP] Error deleting auth user ${userId}:`, deleteAuthError);
          errors.push({ userId, error: deleteAuthError.message });
          continue;
        }

        console.log(`[CLEANUP] Successfully deleted user ${userId}`);
        deletedUsers.push({
          userId,
          email: profile.email,
          name: profile.name,
        });

        // Log no audit
        await supabaseAdmin.from("audit_logs").insert({
          user_id: "system", // ID fictício para ações do sistema
          action: "AUTO_CLEANUP_INCOMPLETE_SIGNUP",
          entity_type: "user",
          entity_id: userId,
          old_value: {
            name: profile.name,
            email: profile.email,
            created_at: profile.created_at,
          },
          metadata: {
            reason: `Cadastro incompleto há mais de ${INACTIVE_DAYS_THRESHOLD} dias sem pagamento`,
            cleaned_at: new Date().toISOString(),
            threshold_days: INACTIVE_DAYS_THRESHOLD,
          },
        });

      } catch (userError) {
        const errorMsg = userError instanceof Error ? userError.message : "Unknown error";
        console.error(`[CLEANUP] Error processing user ${userId}:`, errorMsg);
        errors.push({ userId, error: errorMsg });
      }
    }

    const result = {
      success: true,
      message: `Cleanup completed. Deleted ${deletedUsers.length} incomplete accounts.`,
      checkedCount: oldProfiles.length,
      deletedCount: deletedUsers.length,
      deletedUsers,
      errors: errors.length > 0 ? errors : undefined,
      thresholdDays: INACTIVE_DAYS_THRESHOLD,
      thresholdDate: thresholdISO,
    };

    console.log("[CLEANUP] Cleanup completed:", JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("[CLEANUP] Critical error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error",
      details: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
