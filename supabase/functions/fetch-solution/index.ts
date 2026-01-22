import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const solutionRequestSchema = z.object({
  dtcCode: z
    .string()
    .regex(/^[A-Z][0-9]{4}$/, "Código DTC inválido (formato: P0123)")
    .max(10, "Código muito longo"),
  vehicleBrand: z.string().min(1, "Marca é obrigatória").max(50, "Marca muito longa"),
  vehicleModel: z.string().min(1, "Modelo é obrigatório").max(50, "Modelo muito longo"),
  vehicleYear: z
    .number()
    .int("Ano deve ser um número inteiro")
    .min(1900, "Ano inválido")
    .max(new Date().getFullYear() + 2, "Ano inválido"),
  problemDescription: z.string().max(1000, "Descrição muito longa").optional().default(""),
});

// JSON Schema for Gemini
const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    steps: { type: "array", items: { type: "string" } },
    estimatedTime: { type: "string" },
    estimatedCost: { type: "string" },
    difficulty: { type: "integer" },
    tools: { type: "array", items: { type: "string" } },
    parts: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } },
    professionalRecommended: { type: "boolean" }
  },
  required: [
    "title", "description", "steps", "estimatedTime", "estimatedCost",
    "difficulty", "tools", "parts", "warnings", "professionalRecommended"
  ]
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 10 requisições por minuto
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    let userId: string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip");

    const rateLimitResult = await checkRateLimit({
      supabase,
      userId,
      ipAddress,
      endpoint: "fetch-solution",
      limit: 10,
      windowMinutes: 1,
    });

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: "Muitas requisições. Por favor, aguarde um momento.",
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }

    const rawBody = await req.json();
    const validationResult = solutionRequestSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return new Response(
        JSON.stringify({ success: false, error: `Dados inválidos: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { dtcCode, vehicleBrand, vehicleModel, vehicleYear, problemDescription } = validationResult.data;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    // Step 1: Search context (Firecrawl)
    let scrapedContent = "";
    let sourceUrl = "";

    if (FIRECRAWL_API_KEY) {
      try {
        const searchQuery = `${vehicleBrand} ${vehicleModel} ${vehicleYear} ${dtcCode} repair`;
        const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `site:carcarekiosk.com ${searchQuery}`,
            limit: 3,
            scrapeOptions: { formats: ["markdown"] },
          }),
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.data && searchData.data.length > 0) {
            scrapedContent = searchData.data.map((r: any) => r.markdown || r.description || "").join("\n\n---\n\n");
            sourceUrl = searchData.data[0]?.url || "";
          }
        }
      } catch (e) {
        console.warn("Firecrawl search failed, proceeding without context:", e);
      }
    }

    // Step 2: Generate solution with Gemini
    const systemPrompt = `Você é um especialista em diagnóstico e reparo automotivo. Sua função é criar guias de solução claros, detalhados e didáticos EXCLUSIVAMENTE em português brasileiro (pt-BR).

⚠️ REGRA CRÍTICA DE IDIOMA:
- TODO o conteúdo gerado DEVE estar em PORTUGUÊS BRASILEIRO
- NUNCA use palavras em inglês - SEMPRE traduza para português
- Estime custos em Reais (R$) com base no mercado brasileiro
- Siga estritamente o formato JSON solicitado.

CONTEXTO DO VEÍCULO:
- Veículo: ${vehicleBrand} ${vehicleModel} ${vehicleYear}
- Código DTC: ${dtcCode}
- Problema: ${problemDescription}

${scrapedContent ? `CONTEXTO TÉCNICO ENCONTRADO:\n${scrapedContent.substring(0, 8000)}` : ""}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: GEMINI_RESPONSE_SCHEMA
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} ${await response.text()}`);
    }

    const aiData = await response.json();
    let solutionData = {};

    try {
      const jsonText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) solutionData = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      throw new Error("Falha ao processar resposta da IA");
    }

    return new Response(JSON.stringify({
      success: true,
      solution: {
        ...solutionData,
        sourceUrl: sourceUrl || `https://www.google.com/search?q=${dtcCode}+${vehicleBrand}+${vehicleModel}`,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in fetch-solution:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
