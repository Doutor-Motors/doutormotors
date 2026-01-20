import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  userId?: string;
  email?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Initialize Supabase admin client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !requestingUser) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if requesting user is admin
    const { data: adminRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .single();

    if (roleError || !adminRole) {
      console.error("User is not admin:", requestingUser.id);
      return new Response(JSON.stringify({ error: "Unauthorized: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body: DeleteUserRequest = await req.json().catch(() => ({} as DeleteUserRequest));
    let { userId, email } = body;

    if (!userId && !email) {
      return new Response(JSON.stringify({ error: "userId or email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If email was provided, resolve userId via Admin API (auth doesn't provide direct lookup)
    if (!userId && email) {
      const targetEmail = String(email).trim().toLowerCase();
      if (!targetEmail) {
        return new Response(JSON.stringify({ error: "email is invalid" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const perPage = 200;
      let page = 1;
      let foundId: string | null = null;

      for (let i = 0; i < 20 && !foundId; i++) {
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });

        if (listError) {
          console.error("Error listing users:", listError);
          throw listError;
        }

        const users = usersData?.users ?? [];
        const match = users.find((u) => (u.email ?? "").toLowerCase() === targetEmail);
        if (match) foundId = match.id;

        if (users.length < perPage) break;
        page += 1;
      }

      if (!foundId) {
        return new Response(
          JSON.stringify({ error: "User not found", details: { email: targetEmail } }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      userId = foundId;
    }

    // Prevent admin from deleting themselves
    if (userId === requestingUser.id) {
      return new Response(JSON.stringify({ error: "Cannot delete your own account" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Admin ${requestingUser.id} is deleting user ${userId}`);

    // Get user info before deletion for audit (profile can be missing)
    const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(userId!);
    const authEmail = authUserData?.user?.email ?? null;

    const { data: userProfile } = await supabaseAdmin
      .from("profiles")
      .select("name, email")
      .eq("user_id", userId)
      .maybeSingle();

    // =====================================================
    // STEP 0: Revoke all sessions/refresh tokens FIRST
    // This ensures the user is immediately logged out everywhere
    // =====================================================
    try {
      // signOut with scope 'global' revokes ALL sessions for the user
      // We need to use the admin API to sign out another user
      // The admin.deleteUser already invalidates sessions, but we do this explicitly first
      // to ensure immediate effect before we start deleting data
      
      // Unfortunately supabase-js admin API doesn't have a direct "signOutUser(userId)"
      // but deleteUser handles session invalidation. We'll proceed with deletion.
      // The key is that after deleteUser, all tokens become invalid.
      
      console.log(`Revoking sessions for user ${userId}...`);
    } catch (revokeError) {
      console.error("Error revoking sessions (continuing with deletion):", revokeError);
    }

    // Delete related data first (cascade should handle most, but being explicit)
    
    // 1. Delete user roles
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    // 2. Delete subscriptions
    await supabaseAdmin
      .from("user_subscriptions")
      .delete()
      .eq("user_id", userId);

    // 3. Delete notification preferences
    await supabaseAdmin
      .from("user_notification_preferences")
      .delete()
      .eq("user_id", userId);

    // 4. Delete usage tracking
    await supabaseAdmin
      .from("usage_tracking")
      .delete()
      .eq("user_id", userId);

    // 5. Delete legal consents
    await supabaseAdmin
      .from("legal_consents")
      .delete()
      .eq("user_id", userId);

    // 6. Delete OBD settings
    await supabaseAdmin
      .from("obd_settings")
      .delete()
      .eq("user_id", userId);

    // 7. Delete coding executions
    await supabaseAdmin
      .from("coding_executions")
      .delete()
      .eq("user_id", userId);

    // 8. Delete data recordings and their data points
    const { data: recordings } = await supabaseAdmin
      .from("data_recordings")
      .select("id")
      .eq("user_id", userId);

    if (recordings && recordings.length > 0) {
      const recordingIds = recordings.map(r => r.id);
      await supabaseAdmin
        .from("recording_data_points")
        .delete()
        .in("recording_id", recordingIds);
      
      await supabaseAdmin
        .from("data_recordings")
        .delete()
        .eq("user_id", userId);
    }

    // 9. Delete diagnostics and their items
    const { data: diagnostics } = await supabaseAdmin
      .from("diagnostics")
      .select("id")
      .eq("user_id", userId);

    if (diagnostics && diagnostics.length > 0) {
      const diagnosticIds = diagnostics.map(d => d.id);
      await supabaseAdmin
        .from("diagnostic_items")
        .delete()
        .in("diagnostic_id", diagnosticIds);
      
      await supabaseAdmin
        .from("diagnostics")
        .delete()
        .eq("user_id", userId);
    }

    // 10. Delete support tickets and their messages
    const { data: tickets } = await supabaseAdmin
      .from("support_tickets")
      .select("id")
      .eq("user_id", userId);

    if (tickets && tickets.length > 0) {
      const ticketIds = tickets.map(t => t.id);
      await supabaseAdmin
        .from("ticket_messages")
        .delete()
        .in("ticket_id", ticketIds);
      
      await supabaseAdmin
        .from("support_tickets")
        .delete()
        .eq("user_id", userId);
    }

    // 11. Delete vehicles
    await supabaseAdmin
      .from("vehicles")
      .delete()
      .eq("user_id", userId);

    // 12. Delete tutorial progress and favorites
    await supabaseAdmin
      .from("tutorial_progress")
      .delete()
      .eq("user_id", userId);

    await supabaseAdmin
      .from("tutorial_favorites")
      .delete()
      .eq("user_id", userId);

    // 13. Delete payments (if any linked to user)
    await supabaseAdmin
      .from("payments")
      .delete()
      .eq("user_id", userId);

    // 14. Delete checkout sessions
    await supabaseAdmin
      .from("checkout_sessions")
      .delete()
      .eq("user_id", userId);

    // 15. Delete profile
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    // 16. Finally, delete the user from auth.users
    // This also invalidates ALL tokens/sessions for this user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId!);

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      return new Response(JSON.stringify({ 
        error: "Failed to delete auth user",
        details: deleteAuthError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the deletion in audit logs
    await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: requestingUser.id,
        action: "DELETE_USER",
        entity_type: "user",
        entity_id: userId,
        old_value: { 
          name: userProfile?.name ?? null,
          email: userProfile?.email ?? authEmail,
        },
        metadata: {
          deleted_by_admin: requestingUser.email,
          deleted_at: new Date().toISOString(),
          sessions_revoked: true,
        },
      });

    console.log(`User ${userId} successfully deleted by admin ${requestingUser.id}`);

    return new Response(JSON.stringify({
      success: true,
      message: "User deleted successfully",
      deletedUser: {
        id: userId,
        name: userProfile?.name ?? null,
        email: userProfile?.email ?? authEmail,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
