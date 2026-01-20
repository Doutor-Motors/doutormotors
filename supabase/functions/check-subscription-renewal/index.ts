import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    console.log("Checking subscriptions expiring between now and", threeDaysFromNow.toISOString());

    // Find subscriptions expiring in the next 3 days that are still active
    const { data: expiringSubscriptions, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select(`
        id,
        user_id,
        plan_type,
        expires_at,
        status,
        profiles!inner(name, email)
      `)
      .eq("status", "active")
      .gte("expires_at", now.toISOString())
      .lte("expires_at", threeDaysFromNow.toISOString());

    if (fetchError) {
      console.error("Error fetching expiring subscriptions:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${expiringSubscriptions?.length || 0} expiring subscriptions`);

    const results = {
      processed: 0,
      emailsSent: 0,
      errors: [] as string[],
    };

    if (resendApiKey && expiringSubscriptions && expiringSubscriptions.length > 0) {
      const resend = new Resend(resendApiKey);

      for (const subscription of expiringSubscriptions) {
        try {
          const profile = subscription.profiles as unknown as { name: string; email: string };
          const expiresAt = new Date(subscription.expires_at!);
          const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          console.log(`Processing subscription for ${profile.email}, expires in ${daysUntilExpiry} days`);

          // Send reminder email
          const { error: emailError } = await resend.emails.send({
            from: "Doutor Motors <noreply@doutormotors.com.br>",
            to: [profile.email],
            subject: daysUntilExpiry <= 1 
              ? "⚠️ Sua assinatura expira AMANHÃ - Renove agora!"
              : `🔔 Sua assinatura expira em ${daysUntilExpiry} dias`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .header h1 { color: white; margin: 0; font-size: 24px; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .urgency { background: ${daysUntilExpiry <= 1 ? '#fef2f2' : '#fff7ed'}; border-left: 4px solid ${daysUntilExpiry <= 1 ? '#ef4444' : '#f97316'}; padding: 15px; margin: 20px 0; border-radius: 4px; }
                  .btn { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                  .btn:hover { background: #ea580c; }
                  .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                  .feature { padding: 10px 0; border-bottom: 1px solid #eee; }
                  .feature:last-child { border-bottom: none; }
                  .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🚗 Doutor Motors</h1>
                  </div>
                  <div class="content">
                    <h2>Olá, ${profile.name}!</h2>
                    
                    <div class="urgency">
                      <strong>${daysUntilExpiry <= 1 ? '⚠️ Atenção!' : '🔔 Lembrete:'}</strong>
                      <p>Sua assinatura do plano <strong>${subscription.plan_type?.toUpperCase()}</strong> expira ${daysUntilExpiry <= 1 ? 'AMANHÃ' : `em ${daysUntilExpiry} dias`} (${expiresAt.toLocaleDateString('pt-BR')}).</p>
                    </div>
                    
                    <p>Para continuar aproveitando todos os benefícios do Doutor Motors, renove sua assinatura agora:</p>
                    
                    <div class="features">
                      <h3>O que você vai perder se não renovar:</h3>
                      <div class="feature">✅ Diagnósticos ilimitados</div>
                      <div class="feature">✅ Consultas de IA avançadas</div>
                      <div class="feature">✅ Funções de codificação</div>
                      <div class="feature">✅ Suporte prioritário</div>
                      <div class="feature">✅ Gravação de dados em tempo real</div>
                    </div>
                    
                    <center>
                      <a href="https://doutormotors.com.br/dashboard/upgrade" class="btn">
                        Renovar Agora por R$ 29,90/mês
                      </a>
                    </center>
                    
                    <p style="color: #666; font-size: 14px;">
                      Se você já renovou, por favor ignore este email. Caso tenha dúvidas, entre em contato com nosso suporte.
                    </p>
                  </div>
                  <div class="footer">
                    <p>© ${now.getFullYear()} Doutor Motors. Todos os direitos reservados.</p>
                    <p>Este email foi enviado para ${profile.email}</p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });

          if (emailError) {
            console.error(`Error sending email to ${profile.email}:`, emailError);
            results.errors.push(`Failed to send to ${profile.email}: ${emailError.message}`);
          } else {
            console.log(`Reminder email sent to ${profile.email}`);
            results.emailsSent++;
          }

          results.processed++;
        } catch (err) {
          console.error("Error processing subscription:", err);
          results.errors.push(`Error processing ${subscription.id}: ${err}`);
        }
      }
    }

    // Also mark expired subscriptions as inactive
    const { data: expiredSubs, error: expireError } = await supabase
      .from("user_subscriptions")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("expires_at", now.toISOString())
      .select("id");

    if (!expireError && expiredSubs) {
      console.log(`Marked ${expiredSubs.length} subscriptions as expired`);
    }

    return new Response(JSON.stringify({
      success: true,
      ...results,
      expiredCount: expiredSubs?.length || 0,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in subscription renewal check:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
