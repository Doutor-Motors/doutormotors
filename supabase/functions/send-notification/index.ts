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

type NotificationType = 
  | 'critical_diagnostic'
  | 'diagnostic_completed'
  | 'ticket_created'
  | 'ticket_updated'
  | 'ticket_resolved'
  | 'account_update'
  | 'password_changed';

interface NotificationRequest {
  type: NotificationType;
  userId: string;
  data: Record<string, any>;
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

function generateEmailContent(type: NotificationType, data: Record<string, any>, userName: string): { subject: string; html: string } {
  const baseStyle = `
    <style>
      .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
      .header { background: linear-gradient(135deg, #0066cc, #004080); padding: 30px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 24px; }
      .content { padding: 30px; background: #ffffff; }
      .footer { background: #333; padding: 20px; text-align: center; }
      .footer p { color: #999; font-size: 12px; margin: 0; }
      .alert-critical { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
      .alert-warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
      .alert-success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
      .alert-info { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; }
      .btn { display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
      .code-box { background: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; margin: 15px 0; }
    </style>
  `;

  switch (type) {
    case 'critical_diagnostic':
      return {
        subject: '🔴 ALERTA CRÍTICO - Diagnóstico detectou problema grave',
        html: `
          ${baseStyle}
          <div class="email-container">
            <div class="header">
              <h1>🔴 ALERTA CRÍTICO</h1>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <div class="alert-critical">
                <strong>⚠️ Um problema crítico foi detectado no seu veículo!</strong>
              </div>
              <p><strong>Veículo:</strong> ${data.vehicleName || 'Seu veículo'}</p>
              <p><strong>Código:</strong> ${data.dtcCode || 'N/A'}</p>
              <p><strong>Descrição:</strong> ${data.description || 'Problema crítico detectado'}</p>
              
              <div class="alert-critical">
                <p style="margin: 0; color: #dc2626;">
                  <strong>IMPORTANTE:</strong> Este problema afeta a segurança do veículo. 
                  Recomendamos fortemente que você procure um profissional imediatamente.
                </p>
              </div>
              
              <p>
                Acesse o painel para ver o relatório completo e obter mais informações sobre as próximas etapas.
              </p>
              
              <a href="https://doutormotors.com.br/dashboard/diagnostics/${data.diagnosticId}" class="btn">
                Ver Diagnóstico Completo
              </a>
            </div>
            <div class="footer">
              <p>Este é um email automático de alerta. Plataforma informativa e educativa.</p>
            </div>
          </div>
        `
      };

    case 'diagnostic_completed':
      return {
        subject: '✅ Diagnóstico Concluído - Resultados Disponíveis',
        html: `
          ${baseStyle}
          <div class="email-container">
            <div class="header">
              <h1>Diagnóstico Concluído</h1>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <div class="alert-success">
                <strong>✅ Seu diagnóstico foi concluído com sucesso!</strong>
              </div>
              <p><strong>Veículo:</strong> ${data.vehicleName || 'Seu veículo'}</p>
              <p><strong>Total de códigos encontrados:</strong> ${data.totalCodes || 0}</p>
              ${data.criticalCount > 0 ? `
                <div class="alert-warning">
                  <strong>⚠️ ${data.criticalCount} problema(s) crítico(s) encontrado(s)</strong>
                </div>
              ` : ''}
              
              <p>Acesse o painel para ver o relatório completo com todos os detalhes.</p>
              
              <a href="https://doutormotors.com.br/dashboard/diagnostics/${data.diagnosticId}" class="btn">
                Ver Relatório Completo
              </a>
            </div>
            <div class="footer">
              <p>Este é um email automático. Plataforma informativa e educativa.</p>
            </div>
          </div>
        `
      };

    case 'ticket_created':
      return {
        subject: `🎫 Ticket #${data.ticketNumber} Criado - ${data.subject}`,
        html: `
          ${baseStyle}
          <div class="email-container">
            <div class="header">
              <h1>Ticket de Suporte Criado</h1>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <div class="alert-info">
                <strong>🎫 Seu ticket foi criado com sucesso!</strong>
              </div>
              
              <div class="code-box">
                <p style="margin: 0;"><strong>Número do Ticket:</strong> ${data.ticketNumber}</p>
              </div>
              
              <p><strong>Assunto:</strong> ${data.subject}</p>
              <p><strong>Categoria:</strong> ${data.category}</p>
              <p><strong>Prioridade:</strong> ${data.priority}</p>
              
              <p>Nossa equipe analisará sua solicitação e responderá em breve. Você receberá um email quando houver atualizações.</p>
              
              <a href="https://doutormotors.com.br/dashboard/support/${data.ticketId}" class="btn">
                Acompanhar Ticket
              </a>
            </div>
            <div class="footer">
              <p>Este é um email automático. Não responda diretamente a este email.</p>
            </div>
          </div>
        `
      };

    case 'ticket_updated':
      return {
        subject: `🔄 Ticket #${data.ticketNumber} Atualizado`,
        html: `
          ${baseStyle}
          <div class="email-container">
            <div class="header">
              <h1>Atualização no Ticket</h1>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <div class="alert-info">
                <strong>🔄 Seu ticket foi atualizado!</strong>
              </div>
              
              <div class="code-box">
                <p style="margin: 0;"><strong>Ticket:</strong> ${data.ticketNumber}</p>
                <p style="margin: 5px 0 0 0;"><strong>Assunto:</strong> ${data.subject}</p>
              </div>
              
              <p><strong>Nova mensagem da equipe:</strong></p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
              </div>
              
              <a href="https://doutormotors.com.br/dashboard/support/${data.ticketId}" class="btn">
                Responder
              </a>
            </div>
            <div class="footer">
              <p>Este é um email automático. Responda através do painel.</p>
            </div>
          </div>
        `
      };

    case 'ticket_resolved':
      return {
        subject: `✅ Ticket #${data.ticketNumber} Resolvido`,
        html: `
          ${baseStyle}
          <div class="email-container">
            <div class="header">
              <h1>Ticket Resolvido</h1>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <div class="alert-success">
                <strong>✅ Seu ticket foi resolvido!</strong>
              </div>
              
              <div class="code-box">
                <p style="margin: 0;"><strong>Ticket:</strong> ${data.ticketNumber}</p>
                <p style="margin: 5px 0 0 0;"><strong>Assunto:</strong> ${data.subject}</p>
              </div>
              
              <p>Se você ainda tiver dúvidas ou o problema persistir, você pode reabrir o ticket ou criar um novo.</p>
              
              <a href="https://doutormotors.com.br/dashboard/support/${data.ticketId}" class="btn">
                Ver Detalhes
              </a>
            </div>
            <div class="footer">
              <p>Obrigado por usar o Doutor Motors!</p>
            </div>
          </div>
        `
      };

    case 'account_update':
      return {
        subject: '🔔 Atualização na sua conta - Doutor Motors',
        html: `
          ${baseStyle}
          <div class="email-container">
            <div class="header">
              <h1>Atualização da Conta</h1>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <div class="alert-info">
                <strong>🔔 Seus dados foram atualizados!</strong>
              </div>
              
              <p>${data.message || 'Seus dados de perfil foram atualizados com sucesso.'}</p>
              
              <p>Se você não fez esta alteração, entre em contato conosco imediatamente.</p>
              
              <a href="https://doutormotors.com.br/profile" class="btn">
                Ver Meu Perfil
              </a>
            </div>
            <div class="footer">
              <p>Este é um email automático de segurança.</p>
            </div>
          </div>
        `
      };

    case 'password_changed':
      return {
        subject: '🔐 Sua senha foi alterada - Doutor Motors',
        html: `
          ${baseStyle}
          <div class="email-container">
            <div class="header">
              <h1>Senha Alterada</h1>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <div class="alert-warning">
                <strong>🔐 Sua senha foi alterada com sucesso!</strong>
              </div>
              
              <p>Esta alteração foi realizada em ${new Date().toLocaleString('pt-BR')}.</p>
              
              <p><strong>Se você não fez esta alteração:</strong></p>
              <ol>
                <li>Entre em contato conosco imediatamente</li>
                <li>Tente recuperar sua senha usando o email cadastrado</li>
                <li>Verifique se há acessos suspeitos à sua conta</li>
              </ol>
              
              <a href="https://doutormotors.com.br/contato" class="btn">
                Entrar em Contato
              </a>
            </div>
            <div class="footer">
              <p>Este é um email automático de segurança.</p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: 'Notificação - Doutor Motors',
        html: `
          ${baseStyle}
          <div class="email-container">
            <div class="header">
              <h1>Notificação</h1>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <p>${data.message || 'Você tem uma nova notificação.'}</p>
            </div>
            <div class="footer">
              <p>Este é um email automático.</p>
            </div>
          </div>
        `
      };
  }
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

    const { type, userId, data }: NotificationRequest = await req.json();

    console.log("Processing notification:", { type, userId, data });

    // Validate required fields
    if (!type || !userId) {
      console.error("Missing required fields:", { type, userId });
      return new Response(
        JSON.stringify({ error: "Missing required fields: type and userId" }),
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

    // Check user notification preferences
    const { data: preferences } = await supabase
      .from("user_notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Default to sending if no preferences set
    const shouldSend = !preferences || checkPreferences(type, preferences);

    if (!shouldSend) {
      console.log("User has disabled this notification type:", type);
      return new Response(
        JSON.stringify({ success: true, message: "Notification skipped (user preference)" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate email content
    const { subject, html } = generateEmailContent(type, data, profile.name);

    // Send email
    const emailResponse = await sendEmail({
      from: "Doutor Motors <onboarding@resend.dev>",
      to: [profile.email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent",
        emailId: emailResponse.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function checkPreferences(type: NotificationType, preferences: Record<string, any>): boolean {
  switch (type) {
    case 'critical_diagnostic':
      return preferences.email_critical_diagnostics !== false;
    case 'diagnostic_completed':
      return preferences.email_diagnostic_completed !== false;
    case 'ticket_created':
    case 'ticket_updated':
    case 'ticket_resolved':
      return preferences.email_ticket_updates !== false;
    case 'account_update':
    case 'password_changed':
      return preferences.email_account_updates !== false;
    default:
      return true;
  }
}

serve(handler);