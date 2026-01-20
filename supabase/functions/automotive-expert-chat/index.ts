import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o Especialista Automotivo do Doutor Motors, um assistente técnico amigável e didático especializado em:

1. **Mecânica Automotiva**: Explicar funcionamento de sistemas, componentes e tecnologias de veículos
2. **Diagnóstico**: Ajudar a interpretar sintomas, barulhos, alertas e códigos de erro
3. **Manutenção Preventiva**: Orientar sobre revisões, trocas de fluidos, peças e cuidados periódicos
4. **Tomada de Decisão**: Auxiliar o usuário a entender se pode resolver sozinho ou precisa de um profissional

DIRETRIZES DE COMUNICAÇÃO:
- Use linguagem simples e acessível, evitando jargões técnicos sem explicação
- Seja didático: explique o "porquê" das coisas, não apenas o "o quê"
- Seja objetivo e organizado, usando listas e passos quando apropriado
- Sempre priorize a segurança do usuário e do veículo
- Deixe claro quando um problema exige avaliação presencial de um mecânico
- Forneça estimativas de custo quando possível (faixas de preço)
- Mencione sinais de alerta que indicam urgência

LIMITAÇÕES (seja honesto sobre):
- Não pode fazer diagnóstico definitivo sem inspeção física
- Preços variam por região e oficina
- Alguns problemas podem ter múltiplas causas possíveis

FORMATO DAS RESPOSTAS:
- Use markdown para estruturar (títulos, listas, negrito)
- Seja conciso mas completo
- Termine com uma pergunta de acompanhamento quando fizer sentido

CONTEXTO DO VEÍCULO DO USUÁRIO (quando disponível):
{{vehicleContext}}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, vehicleContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with vehicle context if available
    let systemPrompt = SYSTEM_PROMPT;
    if (vehicleContext) {
      systemPrompt = systemPrompt.replace(
        "{{vehicleContext}}", 
        `O usuário possui: ${vehicleContext.brand} ${vehicleContext.model} ${vehicleContext.year}`
      );
    } else {
      systemPrompt = systemPrompt.replace("{{vehicleContext}}", "Não informado pelo usuário.");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("automotive-expert-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
