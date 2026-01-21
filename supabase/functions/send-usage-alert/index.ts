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

type UsageType = 'diagnostics' | 'coding_executions' | 'data_recordings' | 'ai_queries';

const USAGE_LABELS: Record<UsageType, string> = {
  diagnostics: 'Diagnósticos',
  coding_executions: 'Funções de Coding',
  data_recordings: 'Gravações de Dados',
  ai_queries: 'Consultas IA',
};

const USAGE_LIMITS = {
  basic: {
    diagnostics: 5,
    coding_executions: 3,
    data_recordings: 2,
    ai_queries: 10,
  },
  pro: {
    diagnostics: -1,
    coding_executions: -1,
    data_recordings: -1,
    ai_queries: -1,
  },
};

interface UsageAlertRequest {
  userId: string;
  usageType: UsageType;
  currentCount: number;
  limit: number;
  percentage: number;
}

interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

async function sendEmail(payload: ResendEmailPayload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${errorText}`);
  }

  return response.json();
}

function generateAlertEmail(
  userName: string, 
  usageType: UsageType, 
  currentCount: number, 
  limit: number, 
  percentage: number
): { subject: string; html: string } {
  const usageLabel = USAGE_LABELS[usageType];
  const isAtLimit = currentCount >= limit;
  
  const baseStyle = `
    <style>
      .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
      .header { background: linear-gradient(135deg, ${isAtLimit ? '#dc2626' : '#f59e0b'}, ${isAtLimit ? '#b91c1c' : '#d97706'}); padding: 30px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 24px; }
      .content { padding: 30px; background: #ffffff; }
      .footer { background: #333; padding: 20px; text-align: center; }
      .footer p { color: #999; font-size: 12px; margin: 0; }
      .alert-box { background: ${isAtLimit ? '#fee2e2' : '#fef3c7'}; border-left: 4px solid ${isAtLimit ? '#dc2626' : '#f59e0b'}; padding: 15px; margin: 15px 0; }
      .progress-bar { background: #e5e7eb; border-radius: 9999px; height: 12px; overflow: hidden; margin: 15px 0; }
      .progress-fill { background: ${isAtLimit ? '#dc2626' : percentage >= 90 ? '#f59e0b' : '#3b82f6'}; height: 100%; border-radius: 9999px; }
      .btn { display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
      .btn-upgrade { background: linear-gradient(135deg, #f59e0b, #d97706); }
      .stats-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
  `;

  const subject = isAtLimit
    ? `🔴 Limite Atingido - ${usageLabel}`
    : `⚠️ Alerta de Uso - ${percentage}% do limite de ${usageLabel}`;

  const html = `
    ${baseStyle}
    <div class="email-container">
      <div class="header">
        <h1>${isAtLimit ? '🔴 Limite Atingido' : '⚠️ Alerta de Uso'}</h1>
      </div>
      <div class="content">
        <h2>Olá, ${userName}!</h2>
        
        <div class="alert-box">
          <strong>${isAtLimit 
            ? `Você atingiu o limite mensal de ${usageLabel}!` 
            : `Você já utilizou ${percentage}% do seu limite mensal de ${usageLabel}.`
          }</strong>
        </div>

        <div class="stats-box">
          <p style="margin: 0 0 10px 0;"><strong>${usageLabel}</strong></p>
          <p style="margin: 0;">Utilizado: <strong>${currentCount}</strong> de <strong>${limit}</strong></p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <p style="margin: 0; text-align: right; font-size: 14px; color: ${isAtLimit ? '#dc2626' : '#f59e0b'}">
            ${percentage}% utilizado
          </p>
        </div>

        ${isAtLimit ? `
          <p>Para continuar utilizando este recurso, você pode:</p>
          <ul>
            <li>Aguardar o próximo mês para renovação automática do limite</li>
            <li>Fazer upgrade para o plano <strong>Pro</strong> e ter uso ilimitado</li>
          </ul>
        ` : `
          <p>
            Seu limite mensal está quase acabando. Considere fazer upgrade para o plano 
            <strong>Pro</strong> para ter uso ilimitado de todos os recursos.
          </p>
        `}

        <p><strong>Benefícios do Plano Pro:</strong></p>
        <ul>
          <li>✅ Diagnósticos ilimitados</li>
          <li>✅ Funções de Coding ilimitadas</li>
          <li>✅ Gravações de dados ilimitadas</li>
          <li>✅ Consultas IA ilimitadas</li>
          <li>✅ Suporte prioritário</li>
        </ul>

        <a href="https://doutormotors.com.br/dashboard/upgrade" class="btn btn-upgrade">
          ⬆️ Fazer Upgrade para Pro
        </a>

        <p style="margin-top: 20px;">
          <a href="https://doutormotors.com.br/dashboard" style="color: #0066cc;">
            Acessar Dashboard
          </a>
        </p>
      </div>
      <div class="footer">
        <p>Este é um email automático. Você pode desativar estes alertas nas configurações de notificação.</p>
        <p style="margin-top: 10px;">© 2025 Doutor Motors - Plataforma informativa e educativa</p>
      </div>
    </div>
  `;

  return { subject, html };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { userId, usageType, currentCount, limit, percentage }: UsageAlertRequest = await req.json();

    console.log("Processing usage alert:", { userId, usageType, currentCount, limit, percentage });

    // Validate required fields
    if (!userId || !usageType || currentCount === undefined || !limit || !percentage) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if we already sent an alert for this usage type this month
    // Using a simple approach: check usage_tracking for a flag
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const alertKey = `${usageType}_alert_sent`;
    
    const { data: usageTracking } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("month_year", currentMonth)
      .maybeSingle();

    // Check if alert was already sent (stored in metadata or a flag)
    // For now, we'll proceed but in production you'd want to track this
    
    // Generate email content
    const { subject, html } = generateAlertEmail(
      profile.name,
      usageType,
      currentCount,
      limit,
      percentage
    );

    // Send email
    const emailResponse = await sendEmail({
      from: "Doutor Motors <onboarding@resend.dev>",
      to: [profile.email],
      subject,
      html,
    });

    console.log("Usage alert email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Usage alert sent",
        emailId: emailResponse.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-usage-alert function:", error);
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
