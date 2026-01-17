import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SolutionRequest {
  dtcCode: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  problemDescription: string;
}

interface SolutionResponse {
  success: boolean;
  solution?: {
    title: string;
    description: string;
    steps: string[];
    estimatedTime: string;
    estimatedCost: string;
    difficulty: number;
    tools: string[];
    parts: string[];
    warnings: string[];
    professionalRecommended: boolean;
    sourceUrl: string;
  };
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dtcCode, vehicleBrand, vehicleModel, vehicleYear, problemDescription } = 
      await req.json() as SolutionRequest;

    console.log(`Fetching solution for ${dtcCode} - ${vehicleBrand} ${vehicleModel} ${vehicleYear}`);

    // Validate input
    if (!dtcCode || !vehicleBrand || !vehicleModel || !vehicleYear) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Search CarCareKiosk for relevant content
    const searchQuery = `${vehicleBrand} ${vehicleModel} ${vehicleYear} ${dtcCode} repair`;
    console.log("Searching CarCareKiosk for:", searchQuery);

    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `site:carcarekiosk.com ${searchQuery}`,
        limit: 3,
        scrapeOptions: {
          formats: ["markdown"],
        },
      }),
    });

    let scrapedContent = "";
    let sourceUrl = `https://www.carcarekiosk.com/search?q=${encodeURIComponent(searchQuery)}`;

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log("Search results:", JSON.stringify(searchData).substring(0, 500));
      
      if (searchData.data && searchData.data.length > 0) {
        // Get content from search results
        scrapedContent = searchData.data
          .map((result: any) => result.markdown || result.description || "")
          .join("\n\n---\n\n");
        sourceUrl = searchData.data[0]?.url || sourceUrl;
      }
    }

    // If no search results, try direct scrape of a relevant page
    if (!scrapedContent) {
      console.log("No search results, trying direct scrape...");
      
      // Try scraping a generic video page for the vehicle
      const directUrl = `https://www.carcarekiosk.com/video/${vehicleBrand.toLowerCase()}/${vehicleModel.toLowerCase().replace(/\s+/g, '_')}/${vehicleYear}`;
      
      const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: directUrl,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });

      if (scrapeResponse.ok) {
        const scrapeData = await scrapeResponse.json();
        if (scrapeData.data?.markdown) {
          scrapedContent = scrapeData.data.markdown;
          sourceUrl = directUrl;
        }
      }
    }

    // Step 2: Process with Lovable AI to generate structured solution
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Você é um especialista em diagnóstico e reparo automotivo. Sua função é criar guias de solução claros, detalhados e didáticos EXCLUSIVAMENTE em português brasileiro (pt-BR).

⚠️ REGRA CRÍTICA DE IDIOMA:
- TODO o conteúdo gerado DEVE estar em PORTUGUÊS BRASILEIRO
- NUNCA use palavras em inglês - SEMPRE traduza para português
- Traduza termos técnicos para português (ex: "spark plug" = "vela de ignição", "throttle body" = "corpo de borboleta", "mass air flow" = "sensor de fluxo de ar")
- Se a fonte estiver em inglês, traduza COMPLETAMENTE para português
- Nomes de ferramentas devem estar em português (ex: "socket wrench" = "chave soquete", "multimeter" = "multímetro")

CONTEXTO DO PROBLEMA:
- Veículo: ${vehicleBrand} ${vehicleModel} ${vehicleYear}
- Código DTC: ${dtcCode}
- Descrição: ${problemDescription}

${scrapedContent ? `INFORMAÇÕES DE REFERÊNCIA (podem estar em inglês - TRADUZA TUDO):
${scrapedContent.substring(0, 4000)}` : ""}

INSTRUÇÕES:
1. Crie um guia de solução completo e didático EM PORTUGUÊS BRASILEIRO
2. Use linguagem clara e acessível para leigos brasileiros
3. Inclua avisos de segurança quando necessário
4. Estime custos em Reais (R$) com base no mercado brasileiro
5. Seja específico para o veículo mencionado
6. Se o reparo for complexo, recomende um profissional
7. TRADUZA absolutamente TUDO para português - sem exceções`;

    const userPrompt = `Crie um guia completo de solução para o código ${dtcCode} no ${vehicleBrand} ${vehicleModel} ${vehicleYear}.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_solution_guide",
              description: "Cria um guia estruturado de solução para o problema automotivo",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Título descritivo da solução em português",
                  },
                  description: {
                    type: "string",
                    description: "Descrição detalhada do problema e da solução em português (2-3 parágrafos)",
                  },
                  steps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de passos detalhados para resolver o problema (mínimo 5 passos)",
                  },
                  estimatedTime: {
                    type: "string",
                    description: "Tempo estimado para o reparo (ex: '1-2 horas')",
                  },
                  estimatedCost: {
                    type: "string",
                    description: "Custo estimado em Reais (ex: 'R$ 150 - R$ 400')",
                  },
                  difficulty: {
                    type: "number",
                    description: "Nível de dificuldade de 1 a 10 (1=muito fácil, 10=muito difícil)",
                  },
                  tools: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de ferramentas necessárias",
                  },
                  parts: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de peças que podem precisar ser substituídas",
                  },
                  warnings: {
                    type: "array",
                    items: { type: "string" },
                    description: "Avisos de segurança e precauções importantes",
                  },
                  professionalRecommended: {
                    type: "boolean",
                    description: "Se é recomendado procurar um mecânico profissional",
                  },
                },
                required: [
                  "title",
                  "description",
                  "steps",
                  "estimatedTime",
                  "estimatedCost",
                  "difficulty",
                  "tools",
                  "parts",
                  "warnings",
                  "professionalRecommended",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_solution_guide" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao processar solução com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    console.log("AI Response received");

    // Extract the tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ success: false, error: "Resposta de IA inválida" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const solutionData = JSON.parse(toolCall.function.arguments);

    const response: SolutionResponse = {
      success: true,
      solution: {
        ...solutionData,
        sourceUrl,
      },
    };

    console.log("Solution generated successfully");

    return new Response(JSON.stringify(response), {
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
