import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrphanUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
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

    // Get all profiles user_ids
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("user_id");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    const profileUserIds = new Set((profiles ?? []).map(p => p.user_id));

    // Get all auth users (paginated)
    const orphanUsers: OrphanUser[] = [];
    const perPage = 200;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (listError) {
        console.error("Error listing users:", listError);
        throw listError;
      }

      const users = usersData?.users ?? [];
      
      for (const user of users) {
        if (!profileUserIds.has(user.id)) {
          orphanUsers.push({
            id: user.id,
            email: user.email ?? null,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at ?? null,
          });
        }
      }

      if (users.length < perPage) {
        hasMore = false;
      } else {
        page += 1;
      }

      // Safety limit
      if (page > 50) {
        hasMore = false;
      }
    }

    console.log(`Found ${orphanUsers.length} orphan users`);

    return new Response(JSON.stringify({
      success: true,
      orphanUsers,
      count: orphanUsers.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error listing orphan users:", error);
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
