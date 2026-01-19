import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  turnstileToken?: string;
}

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.warn("TURNSTILE_SECRET_KEY not configured, skipping verification");
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    formData.append("remoteip", ip);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    const result: TurnstileVerifyResponse = await response.json();
    
    if (!result.success) {
      console.error("Turnstile verification failed:", result["error-codes"]);
    }
    
    return result.success;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return false;
  }
}

async function sendEmail(payload: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}) {
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";

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

    const { name, email, phone, subject, message, turnstileToken }: ContactEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error("Missing required fields:", { name, email, subject, message });
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios não preenchidos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate field lengths
    if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Campos excedem o tamanho máximo permitido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check rate limit BEFORE captcha verification
    const { data: rateLimitData, error: rateLimitError } = await supabase.rpc(
      "check_contact_rate_limit",
      { p_email: email, p_ip_address: clientIP }
    );

    if (rateLimitError) {
      console.error("Error checking rate limit:", rateLimitError);
      // Continue without rate limiting if there's an error
    } else if (rateLimitData && !rateLimitData.allowed) {
      console.warn("Rate limit exceeded for:", { email, ip: clientIP });
      
      const minutesRemaining = rateLimitData.minutes_remaining || 120;
      return new Response(
        JSON.stringify({ 
          error: `Você atingiu o limite de mensagens. Tente novamente em ${minutesRemaining} minutos.`,
          rateLimited: true,
          minutesRemaining
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify Turnstile CAPTCHA
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ error: "Verificação de segurança não completada" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const isCaptchaValid = await verifyTurnstileToken(turnstileToken, clientIP);
    if (!isCaptchaValid) {
      return new Response(
        JSON.stringify({ error: "Falha na verificação de segurança. Tente novamente." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Processing contact form from:", name, email);

    // Save message to database
    const { data: savedMessage, error: dbError } = await supabase
      .from("contact_messages")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error saving to database:", dbError);
      // Continue with email sending even if DB save fails
    } else {
      console.log("Message saved to database:", savedMessage.id);
    }

    // Send notification email to admin
    const adminEmailResponse = await sendEmail({
      from: "Doutor Motors <onboarding@resend.dev>",
      to: ["contato@doutormotors.com.br"],
      subject: `[Contato] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Nova Mensagem de Contato</h2>
          <hr style="border: 1px solid #eee;">
          
          <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${phone ? `<p><strong>Telefone:</strong> ${escapeHtml(phone)}</p>` : ''}
          <p><strong>Assunto:</strong> ${escapeHtml(subject)}</p>
          
          <h3 style="color: #333;">Mensagem:</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
          
          <hr style="border: 1px solid #eee; margin-top: 20px;">
          <p style="color: #666; font-size: 12px;">
            Esta mensagem foi enviada através do formulário de contato do site Doutor Motors.
            ${savedMessage ? `<br>ID da mensagem: ${savedMessage.id}` : ''}
            <br>IP: ${clientIP}
          </p>
        </div>
      `,
    });

    console.log("Admin notification sent:", adminEmailResponse);

    // Send confirmation email to user
    const userEmailResponse = await sendEmail({
      from: "Doutor Motors <onboarding@resend.dev>",
      to: [email],
      subject: "Recebemos sua mensagem - Doutor Motors",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0066cc, #004080); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Doutor Motors</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #333;">Olá, ${escapeHtml(name)}!</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Obrigado por entrar em contato conosco. Recebemos sua mensagem sobre 
              <strong>"${escapeHtml(subject)}"</strong> e nossa equipe irá analisá-la em breve.
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Normalmente respondemos em até 24 horas úteis. Enquanto isso, você pode 
              acompanhar nossas novidades nas redes sociais.
            </p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Sua mensagem:</h3>
              <p style="color: #666; white-space: pre-wrap;">${escapeHtml(message)}</p>
            </div>
            
            <p style="color: #555;">
              Atenciosamente,<br>
              <strong>Equipe Doutor Motors</strong>
            </p>
          </div>
          
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Este é um email automático. Por favor, não responda diretamente a este email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("User confirmation sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Emails enviados com sucesso",
        messageId: savedMessage?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Helper function to escape HTML and prevent XSS
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

serve(handler);
