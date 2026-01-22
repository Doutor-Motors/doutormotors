import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const diagnosticRequestSchema = z.object({
  dtcCodes: z
    .array(
      z.string()
        .regex(/^[A-Z][0-9]{4}$/, "Código DTC inválido (formato: P0123)")
        .max(10, "Código muito longo")
    )
    .min(1, "Pelo menos um código DTC é necessário")
    .max(20, "Máximo de 20 códigos por diagnóstico"),
  vehicleBrand: z.string().min(1, "Marca é obrigatória").max(50, "Marca muito longa"),
  vehicleModel: z.string().min(1, "Modelo é obrigatório").max(50, "Modelo muito longo"),
  vehicleYear: z
    .number()
    .int("Ano deve ser um número inteiro")
    .min(1900, "Ano inválido")
    .max(new Date().getFullYear() + 2, "Ano inválido"),
  diagnosticId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
});

interface DiagnosticItem {
  dtc_code: string;
  description_human: string;
  priority: 'critical' | 'attention' | 'preventive';
  severity: number;
  can_diy: boolean;
  diy_difficulty: number | null;
  probable_causes: string[];
  solution_url: string | null;
}

// JSON Schema for Gemini
const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    diagnostics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dtc_code: { type: "string" },
          description_human: { type: "string" },
          priority: { type: "string", enum: ["critical", "attention", "preventive"] },
          severity: { type: "integer" },
          can_diy: { type: "boolean" },
          diy_difficulty: { type: "integer" },
          probable_causes: { type: "array", items: { type: "string" } },
        },
        required: ["dtc_code", "description_human", "priority", "severity", "can_diy", "probable_causes"]
      }
    }
  },
  required: ["diagnostics"]
};

async function sendNotification(
  supabaseUrl: string,
  serviceRoleKey: string,
  type: string,
  userId: string,
  data: Record<string, any>
) {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ type, userId, data }),
      }
    );

    if (!response.ok) {
      console.error("Failed to send notification:", await response.text());
      return false;
    }

    console.log(`${type} notification sent successfully`);
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}

serve(async (req) => {
  // Health check endpoint
  if (req.url.endsWith('/health')) {
    const { handleHealthCheck } = await import("../_shared/healthCheck.ts");
    return handleHealthCheck('diagnose', '1.0.0');
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    const validationResult = diagnosticRequestSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      console.error("Validation failed:", errors);
      return new Response(
        JSON.stringify({ error: `Dados inválidos: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      dtcCodes,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      diagnosticId,
      userId,
      vehicleId
    } = validationResult.data;

    // Rate limiting: 10 requisições por minuto por usuário
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip");

    const rateLimitResult = await checkRateLimit({
      supabase,
      userId,
      ipAddress,
      endpoint: "diagnose",
      limit: 10,
      windowMinutes: 1,
    });

    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for user ${userId || ipAddress}`);
      return new Response(
        JSON.stringify({
          error: "Muitas requisições. Por favor, aguarde um momento.",
          retryAfter: 60,
          remaining: 0,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "60",
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Switch to GEMINI_API_KEY
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("Configuração de IA ausente no servidor");
    }

    const prompt = `Você é um especialista em diagnóstico automotivo. Analise os seguintes códigos DTC (Diagnostic Trouble Codes) para um veículo ${vehicleBrand} ${vehicleModel} ${vehicleYear}.

Códigos para analisar: ${dtcCodes.join(', ')}

Para CADA código, forneça uma análise detalhada em português brasileiro incluindo:
1. Descrição clara do problema em linguagem simples (sem jargão técnico excessivo)
2. Causas prováveis (lista de 2-4 causas)
3. Nível de severidade de 1-10 (1=menor, 10=crítico)
4. Prioridade: "critical" (segurança/dano grave), "attention" (precisa atenção) ou "preventive" (manutenção)
5. Se pode ser resolvido pelo próprio dono (DIY): true ou false
6. Se DIY, dificuldade de 1-5 (1=fácil, 5=muito difícil)

IMPORTANTE:
- Seja realista e seguro. Se houver dúvida sobre segurança, coloque como "critical".
- Responda EXATAMENTE conforme o JSON schema solicitado.`;

    // Gemini API call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: GEMINI_RESPONSE_SCHEMA
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Erro no processamento de IA: ${response.status}`);
    }

    const aiResponse = await response.json();
    let diagnosticItems: DiagnosticItem[] = [];

    try {
      const jsonText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        const parsed = JSON.parse(jsonText);
        diagnosticItems = parsed.diagnostics || [];
      }
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
    }

    // Fallback if AI fails or returns empty
    if (diagnosticItems.length === 0) {
      console.warn("AI returned empty diagnostics, using fallback");
      diagnosticItems = dtcCodes.map(code => ({
        dtc_code: code,
        description_human: `Código ${code} detectado. Consulte um mecânico para detalhes. (Análise IA indisponível temporariamente)`,
        priority: 'attention',
        severity: 5,
        can_diy: false,
        diy_difficulty: null,
        probable_causes: ['Falha na conexão de análise avançada'],
        solution_url: null,
      }));
    }

    const criticalItems = diagnosticItems.filter(item => item.priority === 'critical');
    const hasCritical = criticalItems.length > 0;
    const vehicleName = `${vehicleBrand} ${vehicleModel} ${vehicleYear}`;

    // Notifications
    if (userId && diagnosticId) {
      if (hasCritical) {
        await sendNotification(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, 'critical_diagnostic', userId, {
          diagnosticId,
          vehicleName,
          dtcCode: criticalItems[0]?.dtc_code || 'N/A',
          description: criticalItems[0]?.description_human || 'Problema crítico detectado',
        });
      }

      await sendNotification(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, 'diagnostic_completed', userId, {
        diagnosticId,
        vehicleName,
        totalCodes: diagnosticItems.length,
        criticalCount: criticalItems.length,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        diagnostics: diagnosticItems,
        vehicleInfo: { brand: vehicleBrand, model: vehicleModel, year: vehicleYear },
        hasCritical,
        totalItems: diagnosticItems.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Diagnose function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido ao processar diagnóstico"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});