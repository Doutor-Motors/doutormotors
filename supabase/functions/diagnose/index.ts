import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiagnosticRequest {
  dtcCodes: string[];
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
}

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dtcCodes, vehicleBrand, vehicleModel, vehicleYear } = await req.json() as DiagnosticRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create prompt for AI analysis
    const prompt = `Você é um especialista em diagnóstico automotivo. Analise os seguintes códigos DTC (Diagnostic Trouble Codes) para um veículo ${vehicleBrand} ${vehicleModel} ${vehicleYear}.

Códigos para analisar: ${dtcCodes.join(', ')}

Para CADA código, forneça uma análise detalhada em português brasileiro incluindo:
1. Descrição clara do problema em linguagem simples (sem jargão técnico)
2. Causas prováveis (lista de 2-4 causas)
3. Nível de severidade de 1-10 (1=menor, 10=crítico)
4. Prioridade: "critical" (segurança/dano grave), "attention" (precisa atenção) ou "preventive" (manutenção)
5. Se pode ser resolvido pelo próprio dono (DIY): true ou false
6. Se DIY, dificuldade de 1-5 (1=fácil, 5=muito difícil)

IMPORTANTE: 
- Seja claro e objetivo
- Use linguagem acessível para leigos
- Priorize a segurança do motorista
- Seja realista sobre o que pode ser feito em casa

Responda APENAS com o JSON, sem explicações adicionais.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Você é um especialista em diagnóstico automotivo OBD2. Responda sempre em português brasileiro com JSONs válidos." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_dtc_codes",
              description: "Analisa códigos DTC e retorna diagnósticos estruturados",
              parameters: {
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
                        severity: { type: "number", minimum: 1, maximum: 10 },
                        can_diy: { type: "boolean" },
                        diy_difficulty: { type: "number", minimum: 1, maximum: 5 },
                        probable_causes: { type: "array", items: { type: "string" } },
                      },
                      required: ["dtc_code", "description_human", "priority", "severity", "can_diy", "probable_causes"],
                    },
                  },
                },
                required: ["diagnostics"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_dtc_codes" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao processar diagnóstico");
    }

    const aiResponse = await response.json();
    
    // Extract the function call result
    let diagnosticItems: DiagnosticItem[] = [];
    
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        diagnosticItems = parsed.diagnostics || [];
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }
    }

    // If no items from AI, provide fallback based on known codes
    if (diagnosticItems.length === 0) {
      diagnosticItems = dtcCodes.map(code => ({
        dtc_code: code,
        description_human: `Código ${code} detectado. Consulte um mecânico para diagnóstico completo.`,
        priority: code.startsWith('P03') || code.startsWith('P07') ? 'critical' : 'attention',
        severity: 5,
        can_diy: false,
        diy_difficulty: null,
        probable_causes: ['Diagnóstico adicional necessário'],
        solution_url: null,
      }));
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        diagnostics: diagnosticItems,
        vehicleInfo: { brand: vehicleBrand, model: vehicleModel, year: vehicleYear }
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
