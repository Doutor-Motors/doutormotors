import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Thresholds for alerts
const SPAM_THRESHOLDS = {
  honeypot_blocked: { count: 10, period_hours: 1, severity: "high" },
  captcha_failed: { count: 20, period_hours: 1, severity: "medium" },
  rate_limited: { count: 15, period_hours: 1, severity: "medium" },
  validation_error: { count: 50, period_hours: 1, severity: "low" },
};

async function sendAlertEmail(
  subject: string,
  htmlContent: string,
  adminEmails: string[]
) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return null;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Doutor Motors Alerts <onboarding@resend.dev>",
      to: adminEmails,
      subject,
      html: htmlContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send alert email:", errorText);
    return null;
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const alerts: { type: string; count: number; severity: string }[] = [];
    const now = new Date();

    // Check each event type against thresholds
    for (const [eventType, threshold] of Object.entries(SPAM_THRESHOLDS)) {
      const periodStart = new Date(now.getTime() - threshold.period_hours * 60 * 60 * 1000);
      
      const { count, error } = await supabase
        .from("contact_form_analytics")
        .select("*", { count: "exact", head: true })
        .eq("event_type", eventType)
        .gte("created_at", periodStart.toISOString());

      if (error) {
        console.error(`Error checking ${eventType}:`, error);
        continue;
      }

      if (count && count >= threshold.count) {
        alerts.push({
          type: eventType,
          count,
          severity: threshold.severity,
        });
      }
    }

    // Check for suspicious IPs (many attempts from same IP)
    const { data: suspiciousIPs, error: ipError } = await supabase
      .from("contact_form_analytics")
      .select("ip_address")
      .gte("created_at", new Date(now.getTime() - 60 * 60 * 1000).toISOString())
      .not("event_type", "eq", "submission");

    if (!ipError && suspiciousIPs) {
      const ipCounts: Record<string, number> = {};
      for (const row of suspiciousIPs) {
        if (row.ip_address) {
          ipCounts[row.ip_address] = (ipCounts[row.ip_address] || 0) + 1;
        }
      }

      const suspiciousIPList = Object.entries(ipCounts)
        .filter(([, count]) => count >= 5)
        .map(([ip, count]) => ({ ip, count }));

      if (suspiciousIPList.length > 0) {
        alerts.push({
          type: "suspicious_ips",
          count: suspiciousIPList.length,
          severity: "high",
        });
      }
    }

    if (alerts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No alerts triggered", checked_at: now }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get recent stats for the email
    const { data: recentStats } = await supabase
      .from("contact_form_analytics")
      .select("event_type, ip_address, email, created_at")
      .gte("created_at", new Date(now.getTime() - 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    const highSeverityAlerts = alerts.filter(a => a.severity === "high");
    const hasHighSeverity = highSeverityAlerts.length > 0;

    // Build email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${hasHighSeverity ? '#dc2626' : '#f59e0b'}; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Alerta de Spam Detectado</h1>
        </div>
        
        <div style="padding: 20px; background: #fff;">
          <p style="color: #333; font-size: 16px;">
            O sistema detectou atividade suspeita no formulário de contato:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Tipo</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Contagem</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Severidade</th>
              </tr>
            </thead>
            <tbody>
              ${alerts.map(a => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${a.type.replace(/_/g, ' ')}</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${a.count}</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">
                    <span style="padding: 2px 8px; border-radius: 4px; background: ${
                      a.severity === 'high' ? '#fecaca' : a.severity === 'medium' ? '#fef3c7' : '#dbeafe'
                    }; color: ${
                      a.severity === 'high' ? '#dc2626' : a.severity === 'medium' ? '#d97706' : '#2563eb'
                    };">
                      ${a.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${recentStats && recentStats.length > 0 ? `
            <h3 style="color: #333;">Eventos Recentes:</h3>
            <ul style="color: #666; font-size: 14px;">
              ${recentStats.slice(0, 10).map(s => `
                <li>${new Date(s.created_at).toLocaleString('pt-BR')} - ${s.event_type} - IP: ${s.ip_address || 'N/A'}</li>
              `).join('')}
            </ul>
          ` : ''}
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Acesse o painel administrativo para mais detalhes.
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Este é um alerta automático do sistema Doutor Motors.
            <br>Gerado em: ${now.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    `;

    // Send alert email
    const emailResult = await sendAlertEmail(
      `[${hasHighSeverity ? 'URGENTE' : 'ATENÇÃO'}] Alerta de Spam - Doutor Motors`,
      emailHtml,
      ["contato@doutormotors.com.br"]
    );

    // Log alert to database
    await supabase.from("system_alerts").insert({
      title: "Alerta de Spam Detectado",
      message: `Detectados ${alerts.length} tipos de atividade suspeita no formulário de contato.`,
      type: "spam_alert",
      priority: hasHighSeverity ? "high" : "medium",
      sent_by: "00000000-0000-0000-0000-000000000000", // System
      target_type: "role",
      target_role: "admin",
      send_email: true,
      email_sent_count: emailResult ? 1 : 0,
    });

    return new Response(
      JSON.stringify({ 
        message: "Alerts processed",
        alerts_count: alerts.length,
        alerts,
        email_sent: !!emailResult,
        checked_at: now,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in check-spam-alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
