import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SystemAlertRequest {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetType: 'all' | 'specific' | 'role';
  targetUserIds?: string[];
  targetRole?: 'user' | 'admin';
  sendEmail: boolean;
  expiresAt?: string;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Doutor Motors <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send email to ${to}:`, errorText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return null;
  }
}

function generateAlertEmailHtml(title: string, message: string, type: string, userName: string): string {
  const typeColors: Record<string, { bg: string; border: string; text: string }> = {
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
  };

  const colors = typeColors[type] || typeColors.info;
  const icon = type === 'error' ? '🔴' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <div style="background: linear-gradient(135deg, #0066cc, #004080); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${icon} Alerta do Sistema</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${userName}!</h2>
          
          <div style="background: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: ${colors.text};">${title}</h3>
            <p style="margin: 0; color: ${colors.text}; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Este é um alerta importante enviado pela equipe Doutor Motors. 
            Para mais informações, acesse sua conta.
          </p>
          
          <a href="https://doutormotors.com.br/dashboard" 
             style="display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">
            Acessar Painel
          </a>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Este é um email automático do sistema Doutor Motors.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client with service role for admin operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user is admin using auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!)
      .auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      console.error("Not admin:", roleError);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const alertData: SystemAlertRequest = await req.json();
    console.log("Creating system alert:", alertData);

    // Validate required fields
    if (!alertData.title || !alertData.message) {
      return new Response(
        JSON.stringify({ error: "Title and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create the alert in database
    const { data: alert, error: insertError } = await supabase
      .from("system_alerts")
      .insert({
        title: alertData.title,
        message: alertData.message,
        type: alertData.type || 'info',
        priority: alertData.priority || 'normal',
        target_type: alertData.targetType || 'all',
        target_user_ids: alertData.targetUserIds || null,
        target_role: alertData.targetRole || null,
        sent_by: user.id,
        send_email: alertData.sendEmail || false,
        expires_at: alertData.expiresAt || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting alert:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create alert" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Alert created:", alert.id);

    // Send emails if requested
    let emailsSent = 0;
    if (alertData.sendEmail) {
      console.log("Sending emails for alert...");

      // Get target users based on target type
      let usersQuery = supabase.from("profiles").select("user_id, name, email");

      if (alertData.targetType === 'specific' && alertData.targetUserIds?.length) {
        usersQuery = usersQuery.in("user_id", alertData.targetUserIds);
      } else if (alertData.targetType === 'role' && alertData.targetRole) {
        // Get users with specific role
        const { data: roleUsers } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", alertData.targetRole);
        
        if (roleUsers?.length) {
          usersQuery = usersQuery.in("user_id", roleUsers.map(r => r.user_id));
        }
      }
      // For 'all', we don't add any filter

      const { data: users, error: usersError } = await usersQuery;

      if (usersError) {
        console.error("Error fetching users:", usersError);
      } else if (users) {
        console.log(`Sending emails to ${users.length} users`);

        const emailSubject = `${alertData.type === 'error' ? '🔴' : alertData.type === 'warning' ? '⚠️' : 'ℹ️'} ${alertData.title} - Doutor Motors`;

        // Send emails in parallel with batching
        const batchSize = 10;
        for (let i = 0; i < users.length; i += batchSize) {
          const batch = users.slice(i, i + batchSize);
          const emailPromises = batch.map(async (profile) => {
            const html = generateAlertEmailHtml(
              alertData.title,
              alertData.message,
              alertData.type,
              profile.name
            );
            const result = await sendEmail(profile.email, emailSubject, html);
            if (result) emailsSent++;
          });
          await Promise.all(emailPromises);
        }

        console.log(`Sent ${emailsSent} emails`);

        // Update email sent count
        await supabase
          .from("system_alerts")
          .update({ email_sent_count: emailsSent })
          .eq("id", alert.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alert: alert,
        emailsSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-system-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);